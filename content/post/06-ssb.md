+++
title = "Aura vs Scuttlebutt"
date = 2025-01-09
description = "How both solve the same hard P2P problems of discovery, connectivity, and replication through very different architectural choices."
slug = "aura-vs-scuttlebutt"
draft = true
+++

The three core constraints SSB faces — discovery, connectivity, and replication — are universal to any serverless P2P system. Aura faces the same constraints but makes fundamentally different architectural choices at every layer.

## 1. Discovery

**SSB:** Social graph routing. You see people you follow + friends-of-friends. Pubs inject you into the graph — "everyone is now within 2 hops of each other." Discovery is a side effect of following relationships. No DHT, no global index.

**Aura:** Four-layer progressive discovery model (`docs/113_rendezvous.md` §6.2, `docs/115_social_architecture.md` §5.1):

| Layer | Strategy | Cost |
|-------|----------|------|
| **Direct** | Known peer with existing relationship | Minimal |
| **Home** | 0-hop relay through same-home members | Low |
| **Neighborhood** | Multi-hop traversal across 1-hop-linked homes | Medium |
| **Rendezvous** | Global flooding through rendezvous infrastructure | High |

The critical difference: SSB collapses discovery into the follow graph, which means you're either visible or you're not. Aura separates discovery into explicit layers with **escalating flow budget costs**. You don't need a pub-like intermediary to become visible — you join a home, and that home's members can relay for you. Neighborhood links provide 1-hop and 2-hop reachability without any single node acting as a graph injection point.

Discovery scope is also privacy-preserving in a way SSB's isn't. SSB pubs can observe your entire follow graph. In Aura, descriptors are **scoped to relational contexts** (`ContextId`). Only participating authorities can decrypt descriptor payloads. A home relay learns that you're reachable but not the content of your conversations or relationships outside that context.

## 2. NAT Traversal / Connectivity

**SSB:** Relay-by-default through pubs. Both peers replicate through a pub. No aggressive hole punching. This is closer to TURN servers than STUN.

**Aura:** Relay-first, direct-upgrade model (`docs/113_rendezvous.md` §3.1):

1. Start on relay immediately (any socially trusted peer — home member, neighborhood peer, or guardian)
2. Exchange direct/reflexive transport candidates from descriptor facts
3. Launch bounded holepunch attempts in the background (QUIC direct, QUIC reflexive via STUN, TCP direct, WebSocket relay)
4. Promote to direct when a direct path succeeds; remain on relay otherwise

The transport priority sequence is: QUIC direct, QUIC reflexive (STUN), TCP direct, WebSocket relay. The first successful transport wins.

**Key architectural difference:** SSB pubs are both the relay *and* the replication store. In Aura, relay and replication are separate concerns:

- **Relay** is a transport-layer service provided by any reachable peer (home members, neighborhood peers, guardians). Relay traffic is end-to-end encrypted. The relay cannot read message content.
- **Replication** happens through journal anti-entropy (`aura-sync`), which is independent of who you're relayed through.

This means Aura doesn't have the centralization pressure SSB has. A pub that provides relay *also* stores your feeds and re-serves them, creating resource concentration. In Aura, a relay forwards encrypted blobs it can't read, and replication is distributed across all peers in your social graph.

## 3. Replication and Data Availability

**SSB:** Gossip-based, opportunistic. Pubs act as "high-uptime gossip amplifiers" — they store feeds and re-serve them. Without pubs, replication degrades to LAN encounters and latency spikes.

**Aura:** Journal anti-entropy through `aura-sync` (`docs/001_system_architecture.md` §6.4, `docs/112_amp.md`):

- Each peer periodically exchanges fact digests with neighbors
- Gaps are identified and missing facts are selectively transferred
- Because journals are CRDTs, merging facts from any peer is safe regardless of ordering
- This runs continuously in the background without coordination

The availability model is tied to the social topology:

- **Home members** replicate pinned data across available devices (`docs/115_social_architecture.md` §12.1). The `HomeAvailability` type coordinates replication factor and failover.
- **Neighborhood links** define descriptor propagation paths. Connected homes exchange routing information.
- **Guardians** hold encrypted recovery shares and can serve as relay fallbacks.

The crucial difference from SSB: in Aura, replication happens through **structured social infrastructure** (homes and neighborhoods) rather than through **privileged always-on nodes** (pubs). Every home member contributes storage (up to 10MB per home). Every participant in a neighborhood contributes to descriptor propagation. There's no distinguished "high-uptime node" that the network depends on — the network's availability comes from the aggregate of its participants.

## 4. The "Pub Equivalent" Question

SSB pubs collapse four concerns into one primitive: discovery + connectivity + replication + social onboarding. This is a coherence move, but it creates a problem: the primitive that solves everything becomes the primitive everyone depends on, producing centralization pressure.

Aura decomposes those concerns into separate architectural layers:

| Concern | SSB | Aura |
|---------|-----|------|
| **Discovery bootstrap** | Pub follows you back, graph injection | Join a home, home members provide 0-hop relay. Neighborhood links provide 1-hop/2-hop reachability |
| **NAT traversal** | Relay through pub (stateful replication relay) | Relay through any reachable peer; background holepunch upgrade. Relay is transport-only, not replication |
| **Always-on replication** | Pub stores + re-serves feeds | Journal anti-entropy across all peers. Home members replicate pinned data. No distinguished always-on node required |
| **Social onboarding** | Pub invite, within 2 hops of many users | Invitation ceremony, relational context established, context-scoped keys derived, immediate encrypted communication |

The closest thing to a "pub" in Aura is a **home** — but a home is fundamentally different:

- A home is **governed by its participants** (capability-gated policy facts, moderator designations, Biscuit authorization), not by whoever runs the server
- A home has **hard storage limits** (10MB total, 200KB per participant) that create natural scarcity and prevent resource concentration
- A home is **not a node** — it's a shared journal context. There's no "home server" that can go down. The home exists as long as any of its members' devices are reachable
- A home cannot observe traffic it isn't part of. Context isolation means the home's journal is separate from its members' private conversations

## 5. Identity Model Comparison

**SSB:** Identity = cryptographic feed (single keypair). Feed is append-only log. Identity is tied to one key forever — key loss = identity loss.

**Aura:** Identity = opaque authority with threshold cryptography (`docs/001_system_architecture.md` §2.1). Keys are sharded across devices via FROST. External observers see only a threshold public key. Internal device structure is hidden.

This has profound implications for the pub/relay problem:

- In SSB, if your key is on one device behind NAT, you need a pub to be reachable
- In Aura, your authority spans multiple devices. If one device is behind NAT, another device on a different network can still participate. The authority is reachable as long as any threshold of its devices is reachable
- Key rotation and resharing maintain security as devices join or leave, without changing identity
- Recovery uses guardian protocols (social recovery through threshold secret sharing), not key backup

## 6. Where SSB's Pub Problems Don't Arise in Aura

**Centralization pressure:** SSB pubs concentrate resources because they store-and-forward everything. Aura distributes storage across all home members with hard per-participant budgets. No single node accumulates disproportionate load.

**Moderation problems:** SSB pub operators are de facto moderators because they control who gets replicated. Aura homes have explicit capability-gated governance — moderators are designated via consensus, their capabilities are auditable, and moderation actions flow through the guard chain.

**Resource burden:** SSB pubs pay storage/bandwidth for everyone they follow. Aura homes cap storage at 10MB and distribute the cost across participants. Neighborhood membership costs 1MB of your home's budget per neighborhood joined, creating meaningful tradeoffs.

**Single point of failure:** If an SSB pub goes down, everyone who bootstrapped through it loses their connectivity bridge. In Aura, if a home member goes offline, other home members still relay. If an entire home goes dark, neighborhood links provide alternate paths. The four-layer discovery model degrades gracefully rather than breaking.

## 7. What Aura Still Has to Solve

The tradeoff Aura makes is **complexity for resilience**. SSB's pub model is simple — one primitive, one deployment pattern, immediately useful. Aura's decomposed model requires:

- Home creation and membership management
- Neighborhood link establishment
- Multi-layer discovery routing
- Guardian relationship setup for recovery
- Threshold key ceremonies for identity

This is more infrastructure to stand up before you get "near-online" behavior. SSB with a pub is instantly useful. Aura requires establishing social structure first. The bet is that this social structure provides better long-term properties (no centralization, proper governance, privacy isolation, key recovery), but it's a higher activation energy.

The rooms evolution in SSB (moving from full replication relays to pure connection brokers/tunnelers) is converging toward something closer to what Aura's relay layer does — transport-only forwarding without replication responsibility. Aura started there by design.
