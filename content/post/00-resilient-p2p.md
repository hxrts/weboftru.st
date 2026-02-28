+++
title = "Patterns for Resilient P2P Networks: Learnings from Aura"
date = 2026-01-21
description = "A web without servers"
slug = "resilient-p2p"

[extra]
cover_image = "/images/pixillation.jpg"
cover_caption = "<em>Pixillation</em>, Lillian Schwartz and Ken Knowlton (1970)"
+++


---

## Introduction

In December I attended [Splintercon](https://splintercon.net/paris/) in Paris, a conference organized by eQualitie with help from my friends Lai Yi and Katerina. The topic was splinternets, intentionally isolated portions of the internet created by governments seeking to control information flow. There were in-depth discussions about the Chinese and Russian internet stacks, and several presentations documented the increasing sophistication of Iran's internet control apparatus.

The conference brought together a striking mix of people: diplomats, academic researchers, human rights advocates, representatives from internet infrastructure companies, and a contingent of developers building encrypted P2P networks and mesh networking tools. I've been building P2P software for the past few months, and the conference gave me an opportunity to speak with developers whose projects span a wide range of maturity levels.

These technologies are starting to see real adoption in places like Iran. But the conversations also revealed how sparse these physical and virtual networks remain, and how significant the gaps are that need to be bridged before they can reliably survive internet shutdowns.

As a follow-up, some of these developers are organizing a private event to find ways to work together, share learnings, or even stitch their technologies together. Because of the sensitive nature of the work, I'll omit the specifics. I was invited to attend and share some of my recent work on Aura, but sadly I had other obligations.

I wanted to support this effort to the extent I could, so I decided to write up some of the learnings from my recent experiments. What follows is a survey of design patterns from Aura that may be relevant to developers working on mesh networks, P2P protocols, offline-first applications, and decentralized platforms.

---

## 1. Social Infrastructure

> **Source**: [Project Overview](../docs/000_project_overview.md) | [Social Architecture](../docs/114_social_architecture.md)

Traditional P2P systems treat the network as a flat, anonymous resource pool. Nodes connect to random peers via DHTs, discover content through flooding, and route messages through shortest paths. This approach has two fundamental problems.

**Privacy leakage**: Random peer selection exposes your communication patterns to arbitrary observers. Every node in your routing path learns that you're communicating with someone, even if they can't decrypt the content. DHT lookups reveal your interests. Flooding reveals your social graph.

**Trust mismatch**: The nodes storing and forwarding your data have no accountability to you. A Sybil attacker can position themselves on your routing paths. A malicious DHT node can track your queries. There's no relationship between "peers who help you" and "people you trust."

Aura inverts this model. Your friends' devices relay your messages. Your community stores your data. Your guardians recover your keys. The people you trust are the infrastructure you depend on.

> **The social graph IS the routing infrastructure.**

This design provides three concrete services:

1. **Discovery**: Find peers through social topology rather than global flooding. Direct contacts are cheap to reach, and strangers are expensive.

2. **Storage**: Your community replicates your data. Storage comes from people with stake in your success, not anonymous nodes.

3. **Identity**: Guardians hold threshold key shares. Losing a device doesn't mean losing your identity.

### Homes and Neighborhoods

Aura organizes social infrastructure with two levels: homes and neighborhoods.

A home is a small community with fixed resource constraints: 10 MB total storage, a maximum of 8 residents, and membership in up to 4 neighborhoods. Homes provide data replication (residents replicate pinned data), message relay (home peers as first-hop relays), and storage coordination (enforced budgets per resident). The small size is intentional. Eight residents can maintain real relationships and mutual accountability. Storage caps force prioritization. These constraints create genuine communities rather than anonymous hosting.

Neighborhoods are collections of homes connected via adjacency graphs. Each home donates 1 MB of storage per neighborhood joined (max 4), creating a trade-off between broader reach and local storage for home culture. Neighborhoods extend reach beyond your home. They provide discovery paths to residents of adjacent homes, shared storage for cross-home content, and relay infrastructure for multi-hop routing.

Discovery cost is proportional to social distance. When discovering a peer, the system checks direct contacts first, then home peers, then neighborhood adjacencies, and only falls back to global rendezvous as a last resort. This creates economic incentives to establish social relationships before communication. Direct messages are cheap while cold outreach is expensive. Relays are selected based on this same social topology: home peers first, then neighborhood peers, then guardians. Recovery infrastructure doubles as relay capacity.

---

## 2. Operation Categories

> **Source**: [Operation Categories](../docs/107_operation_categories.md)

Not all operations require coordination. Aura classifies operations into three categories based on their agreement requirements.

**Category A (Optimistic)**: Immediate local effect, background sync via anti-entropy. Send a message, create a channel, block a contact. These work because the cryptographic context already exists. Keys derive deterministically from shared state. No new agreement is needed.

**Category B (Deferred)**: Local effect pending until agreement is reached. Change permissions, remove a member, transfer ownership. These show as "pending" until confirmed, and revert if rejected.

**Category C (Consensus-Gated)**: Operation does NOT proceed until ceremony completes. Add a contact, create a group, rotate guardians, execute recovery. These require multi-party agreement because they establish or modify cryptographic relationships.

The crucial insight is that ceremonies establish shared cryptographic context, and operations within that context are cheap. A ceremony runs once per relationship. It establishes a shared context identifier and cryptographic roots, creates a relational journal, and provides the foundation from which all future encryption derives. Optimistic operations happen within this established context, simply deriving keys and emitting CRDT facts with no new agreement needed.

The expensive part is establishing WHO is in the relationship. Once established, operations WITHIN the relationship derive keys deterministically from shared state.

---

## 3. Coordination

> **Source**: [MPST and Choreography](../docs/108_mpst_and_choreography.md) | [Consensus](../docs/106_consensus.md)

Category C operations require multi-party coordination, and getting distributed protocols right is notoriously difficult. Race conditions, deadlocks, and message ordering bugs are easy to introduce and hard to detect through testing. Aura uses choreographic programming to make these protocols correct by construction.

### Choreographic Programming

A choreography describes a protocol from a global perspective, capturing the complete interaction pattern between all participants. The compiler then projects this global view into local implementations for each role, guaranteeing that the pieces fit together correctly. If the global choreography is well-formed, the local projections cannot deadlock or get stuck waiting for messages that never arrive.

This inverts the typical approach where each participant's behavior is written independently and correctness is verified through testing. Instead, you design the coordination pattern once, and the tooling generates implementations that are guaranteed to interoperate.

### Session Types and Consensus

Choreographies produce session-typed channels. A session type specifies the exact sequence of messages a channel will carry. Send an invite, receive an acceptance or rejection, then either exchange keys or terminate. The type system ensures each participant follows this protocol. Attempting to send when you should receive, or sending the wrong message type, is a compile-time error.

This separates two concerns that P2P systems often conflate: **session types handle sequencing** (what happens in what order), while **consensus handles agreement** (do all parties see the same outcome). You don't need consensus to order messages within a session because the session type already guarantees that. Consensus is only needed when the outcome must be recorded durably and agreed upon by all parties.

### Two-Path Consensus

Aura Consensus provides single-shot agreement when CRDT semantics aren't sufficient. It is not a global log. Each instance agrees on a single operation, binds to a single prestate, and produces a single commit fact.

The protocol has two paths. The fast path completes in 1-2 round trips when all witnesses are online. The fallback path triggers on disagreement or initiator stall, using leaderless gossip where any witness can drive completion. This reflects a deliberate philosophy: **the optimistic path optimizes for speed, while the fallback optimizes for robustness**. When conditions are good, you get fast consensus. When conditions degrade (partitions form, nodes fail, or the initiator disappears) the system shifts to a protocol that prioritizes correctness and liveness over latency. You never have to choose between a fast system that breaks under stress and a robust system that's always slow.

Operations bind to explicit prestates, preventing forks and replays by ensuring all parties agree on the starting state before any commits.

---

## 4. Protocol Evolution

> **Source**: [Coordination Guide](../docs/803_coordination_guide.md)

P2P systems face a fundamental tension: protocols must evolve, but you can't coordinate a simultaneous upgrade across all peers. Devices come online at different times. Network partitions prevent synchronization. Some peers may never upgrade at all.

### Safe Reconfiguration

Aura addresses this through two composition primitives that preserve protocol coherence even as the system reconfigures. The `link` operation composes protocols at deployment time, combining invitation, recovery, and messaging protocols into a unified session while verifying that their interfaces align. The `delegate` operation transfers session endpoints at runtime, handing off an active session from one device to another without restarting the protocol.

The critical property is that both operations preserve coherence: if the system was in a valid state before reconfiguration, it remains in a valid state after. This is verified formally, not just tested. Device migration uses delegation to transfer sessions to a new device while preserving protocol continuity. Guardian handoff delegates recovery session endpoints to a replacement guardian. Relay responsibilities can be handed to better-connected peers without disrupting active conversations.

This enables genuinely asynchronous distributed upgrades. New protocol versions can be deployed incrementally. Devices joining after an upgrade inherit the new behavior through delegation. The formal coherence guarantee means you don't need to reason about every possible interleaving of old and new protocol versions. If the delegation is valid, the composed system remains correct.

---

## 5. Messaging

> **Source**: [Asynchronous Message Patterns](../docs/110_amp.md)

AMP (Asynchronous Message Protocol) provides secure messaging with strong post-compromise security and bounded forward secrecy.

### Multi-Device Ratcheting

Signal-style ratchets assume device-local state: the ratchet position is stored on your device, and if you lose your device, you lose your ratchet state. Multi-device support requires complex synchronization protocols that are difficult to get right.

Aura has different requirements. All ratchet state must be deterministically recoverable from replicated facts, with no device-specific secrets. All devices must converge to the same ratchet position after syncing. And out-of-order delivery must work without head-of-line blocking.

AMP solves this with a dual-window approach that maintains two overlapping valid ranges at all times, eliminating boundary issues and accepting messages that arrive out of order.

### Deterministic Recovery

Recovery requires no coordination: load journal facts, reduce to current state, rederive keys. Ready to message with no peer contact needed.

If your ratchet state can be lost, it will be lost. Design for recovery from first principles, with the journal as the single source of truth.

---

## 6. Recovery

> **Source**: [Relational Contexts](../docs/112_relational_contexts.md) | [Authority and Identity](../docs/102_authority_and_identity.md)

Recovery relationships are cryptographic, not just social. They live in relational contexts with their own journals.

A guardian binding captures account and guardian commitment hashes, recovery parameters (delay period, notification requirements), and the consensus proof that both parties agreed. Guardian binding requires consensus. Both parties must explicitly agree to the relationship. The recovery delay (24 hours by default) gives the account owner time to challenge fraudulent recovery attempts. Required notification ensures the account owner knows when recovery is happening, even if they can't immediately respond.

When a guardian approves recovery, they create a grant capturing the old and new account commitments, the specific operation, and the consensus proof. All operations bind to explicit prestates, preventing forks, replays, and inconsistent views.

---

## 7. Privacy

> **Source**: [Privacy and Information Flow](../docs/003_information_flow_contract.md)

Traditional privacy systems force users to choose between complete isolation and complete exposure. Aura takes a different view: privacy is relational. Sharing information with people you trust isn't a privacy violation. It's the foundation of meaningful collaboration. The question isn't "who can see my data?" but "did I consent to this disclosure?"

This leads to a model where privacy boundaries align with social relationships rather than technical perimeters. Within a relationship you've established, the other party sees what you've agreed to share. Outside that relationship, they see nothing, not because of access controls, but because there's literally nothing to access. Different contexts use different keys, so there's no data to leak.

### Contextual Identity

Deterministic key derivation makes this concrete. When Alice talks to Bob, she uses keys derived specifically for that context. When she talks to Carol, she uses entirely different keys. Bob cannot link Alice's identity across these contexts because he has no cryptographic handle on her other relationships. Identity is contextual by construction, not by policy.

The same principle extends to observers at different distances. Your direct contacts see message content by mutual consent. Your home peers forwarding traffic see only encrypted envelopes. Network observers see only that you're using the system at all. Each layer has a privacy boundary with explicit rules about what crosses it.

### Guard Chain Enforcement

To enforce these boundaries, choreographies integrate with a guard chain that enforces invariants at each protocol step. Before any message crosses the network, it passes through a sequence of guards: capability verification (is this action authorized?), flow budget charging (does the sender have sufficient quota?), journal coupling (can this fact be recorded?), and leakage tracking (does this action fit within metadata budgets?).

Aura uses a charge-before-send invariant: every network-observable action must first succeed at budget charging. If authorization fails or budgets are exhausted, the operation is blocked locally with no packet emitted. An observer cannot distinguish between "operation denied" and "operation never attempted." This is enforced structurally. The transport layer only sees messages that have already passed all guards.

This means attackers cannot probe your capabilities by observing failures. There's simply nothing to observe when an operation is denied.

---

## Further Reading

- [System Architecture](../docs/001_system_architecture.md) - Guard chain, effect system
- [Operation Categories](../docs/107_operation_categories.md) - A/B/C classification details
- [Social Architecture](../docs/114_social_architecture.md) - Homes, neighborhoods
- [MPST and Choreography](../docs/108_mpst_and_choreography.md) - Session types, choreographic programming
- [Coordination Guide](../docs/803_coordination_guide.md) - Protocol design patterns
- [AMP Protocol](../docs/110_amp.md) - Dual-window ratcheting details
- [Consensus](../docs/106_consensus.md) - Fast path + fallback protocol
- [Relational Contexts](../docs/112_relational_contexts.md) - Guardian binding
- [Privacy Contract](../docs/003_information_flow_contract.md) - Flow budgets, leakage tracking
