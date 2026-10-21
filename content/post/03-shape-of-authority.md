+++
title = "The Shape of Authority"
date = 2025-01-09
description = "How evidence, capabilities, and explicit agreement shape consent in Aura"
slug = "shape-of-authority"
+++

How far should authority travel when it changes hands? You can narrow permissions or pass them along, while broader authority requires a new grant. Evidence follows a different trajectory, accumulating as participants contribute attestations and decisions.

Aura expresses these directions through semilattices, mathematical structures that let replicas combine information predictably. Authentication and policy determine which evidence and grants the system admits. Together, these rules connect authorization, shared state, and recovery.

```mermaid
graph TD
    subgraph "Facts: Join-Semilattice"
        F1[Evidence] --> F2[More Evidence]
        F2 --> F3[Combined Evidence]
        style F1 fill:#e1f5fe
        style F2 fill:#b3e5fc
        style F3 fill:#81d4fa
    end

    subgraph "Capabilities: Meet-Semilattice"
        C1[Granted Authority] --> C2[Restricted]
        C2 --> C3[Further Restricted]
        style C1 fill:#fff3e0
        style C2 fill:#ffe0b2
        style C3 fill:#ffcc80
    end

    F1 -.->|"⊔ join: evidence accumulates"| F3
    C1 -.->|"⊓ meet: constraints combine"| C3
```

## Two Directions

A semilattice has an associative, commutative, idempotent binary operation. Regrouping inputs or changing their order preserves the result. Combining an element with itself changes nothing.

A join-semilattice supplies a least upper bound under its chosen order. For fact sets ordered by inclusion, join is union. A meet-semilattice supplies a greatest lower bound. For permissions ordered by inclusion, meet is intersection.

These operations give evidence and authority different trajectories. Replicas contribute facts through union, while capability composition preserves every applicable restriction. Two tokens from the same issuer may carry unrelated conditions. Their intersection depends on those conditions rather than token length.

```mermaid
graph LR
    subgraph "Join: Evidence Accumulates"
        A1[Attestation A] --> M1[Combined Evidence]
        A2[Attestation B] --> M1
        A3[Attestation C] --> M1
        style A1 fill:#e1f5fe
        style A2 fill:#e1f5fe
        style A3 fill:#e1f5fe
        style M1 fill:#81d4fa
    end

    subgraph "Meet: Constraints Combine"
        P1[Token Restrictions] --> I1[Effective Permission]
        P2[Local Policy] --> I1
        P3[Context Scope] --> I1
        style P1 fill:#fff3e0
        style P2 fill:#fff3e0
        style P3 fill:#fff3e0
        style I1 fill:#ffcc80
    end
```

## Evidence and Derived State

Aura journals retain facts within an authority or relational context. Admission checks establish the provenance and authorization each fact type requires. Deterministic reducers turn admitted evidence into application state.[^journal]

Replicas converge when they receive the same evidence and apply the same rules. Some decisions require agreement before their finalization facts can be admitted. Growing evidence can still shrink an active roster or revoke a permission.

```mermaid
graph TD
    subgraph "Mutable State"
        DB[(Current State)]
        W[Authorized Writer] -->|Update| DB
        Log[Audit History] -.->|Recorded separately| DB
    end

    subgraph "Aura Journal"
        J1[Admitted Fact 1] --> R[Deterministic Reduction]
        J2[Admitted Fact 2] --> R
        J3[Admitted Fact 3] --> R
        R --> S[Derived Domain State]
    end

    style DB fill:#ffcdd2
    style J1 fill:#e1f5fe
    style J2 fill:#e1f5fe
    style J3 fill:#e1f5fe
    style S fill:#c8e6c9
```

The journal supports accountable interpretation by recording evidence for authorized transitions. Compaction replaces older facts with validated summaries that preserve the required meaning. This permits bounded storage while retaining the evidence needed to check decisions.

## Logical Authorization

Aura uses Biscuit tokens to carry verifiable grants and Datalog checks.[^biscuit] Holders attenuate tokens by appending restrictions. Signature chains protect existing blocks, and Datalog scoping limits which assertions carry issuer authority.

Authorization combines a trusted issuer key, request facts, and local policy. Every request must satisfy both token checks and authorizer policy. Broader permissions require a separately authorized grant.

```mermaid
graph TD
    subgraph "Token Attenuation Chain"
        Root["Root Token<br/>granted authority"] --> T1["Attenuated<br/>+check: operation = read"]
        T1 --> T2["Further Attenuated<br/>+check: before deadline"]
        T2 --> T3["Final Token<br/>+check: public resources"]
    end

    subgraph "Permission Narrows"
        C1["read, write, delete"] --> C2["read"]
        C2 --> C3["read<br/>until deadline"]
        C3 --> C4["read public resources<br/>until deadline"]
    end

    Root -.-> C1
    T1 -.-> C2
    T2 -.-> C3
    T3 -.-> C4
    style Root fill:#fff3e0
    style T1 fill:#fff3e0
    style T2 fill:#ffe0b2
    style T3 fill:#ffcc80
    style C1 fill:#fff3e0
    style C2 fill:#fff3e0
    style C3 fill:#ffe0b2
    style C4 fill:#ffcc80
```

Aura also uses Datalog for journal queries. A shared logic engine helps compose queries and policy, with trusted inputs and bounded evaluation at each boundary.[^authorization]

## Context Boundaries

What you share with your doctor differs from what you share with your employer. Aura expresses these relationships through separate contexts, each with its own namespace, journal, and capability frontier.

Cross-context transfers require permission under the source's disclosure policy and the destination's admission policy. A bridge protocol checks both, including when one device participates on both sides.

Opaque context UUIDs keep participant identities out of the identifier itself. Traffic patterns can still support correlation. Disclosure policy therefore works alongside transport privacy and metadata controls.

```mermaid
graph TD
    subgraph "Authority A"
        JA[Journal A]
    end

    subgraph "Authority B"
        JB[Journal B]
    end

    subgraph "Context: A↔B Relationship"
        JC[Shared Journal]
        JC --> FA[Evidence from A]
        JC --> FB[Evidence from B]
    end

    JA -.->|Authorized contribution| JC
    JB -.->|Authorized contribution| JC

    subgraph "Context: A↔C Relationship"
        JD[Separate Shared Journal]
    end

    JA -.->|Authorized contribution| JD
    JC x--x|No automatic flow| JD

    style JA fill:#fff3e0
    style JB fill:#fff3e0
    style JC fill:#e8f5e9
    style FA fill:#e8f5e9
    style FB fill:#e8f5e9
    style JD fill:#e3f2fd
```

## The Guard Chain

Application sends pass through capability, budget, journal-coupling, and leakage checks before transport. Guards evaluate a prepared snapshot and produce commands for an interpreter to execute.[^authorization]

Guard denial blocks the outbound message. Execution errors preserve any accounting and recovery obligations already incurred.

```mermaid
flowchart LR
    R[Request] --> CG["CapGuard<br/>check authorization"]
    CG -->|pass| FG["FlowGuard<br/>admit budget charge"]
    CG -->|fail| X1[Blocked]
    FG -->|pass| JC["JournalCoupler<br/>prepare journal commands"]
    FG -->|fail| X2[Blocked]
    JC -->|pass| LT["LeakageTracker<br/>check disclosure"]
    JC -->|fail| X3[Blocked]
    LT -->|pass| I[Interpret Approved Commands]
    LT -->|fail| X4[Blocked]
    I --> TE[Transport Send]
    style CG fill:#fff3e0
    style FG fill:#ffe0b2
    style JC fill:#ffe0b2
    style LT fill:#ffcc80
    style R fill:#fff3e0
    style I fill:#ffcc80
    style X1 fill:#ffcdd2
    style X2 fill:#ffcdd2
    style X3 fill:#ffcdd2
    style X4 fill:#ffcdd2
    style TE fill:#fff3e0
```

Charging precedes sending, so transport can fail after a durable charge. Explicit operation identities and retry rules preserve accurate accounting. Each path that releases protected information needs an enforced authorization boundary.

## Explicit Effect Commands

Effect interfaces let the same protocol decisions run against different handlers. Command-producing boundaries represent approved work as data for an interpreter.

A protocol can prepare a `SendEnvelope` command and submit it to the relevant guards. Production handlers use real transport and storage. Simulation handlers use controlled networks and fault schedules.

```mermaid
graph TD
    subgraph "Protocol Specification"
        G[Global Choreography]
        G --> PA["Projection: Alice's View"]
        G --> PB["Projection: Bob's View"]
    end

    subgraph "Guarded Effect Commands"
        PA --> EA[Approved Commands A]
        PB --> EB[Approved Commands B]
    end

    subgraph "Interpretation"
        EA --> I1[Production Interpreter]
        EA --> I2[Simulation Interpreter]
        EB --> I1
        EB --> I2
        I1 --> R1[Real Transport and Storage]
        I2 --> R2[Virtual Network and Faults]
    end

    style G fill:#81d4fa
    style PA fill:#e1f5fe
    style PB fill:#e1f5fe
    style EA fill:#b3e5fc
    style EB fill:#b3e5fc
    style I1 fill:#e1f5fe
    style I2 fill:#e1f5fe
    style R1 fill:#81d4fa
    style R2 fill:#81d4fa
```

Commands also support auditing. Where policy requires a durable record before an external effect, the interpreter persists it first. A persistence failure blocks the covered effect.

## Reactive Propagation

Aura's reactive pipeline connects admitted facts to domain views and interface signals. Reducers interpret evidence, and views publish updated snapshots.

Signal revisions advance while their values can shrink or change. A departure removes a contact, a revocation withdraws permission, and finalization can replace a provisional result. Authoritative entities remain tied to the evidence required to create them.

```mermaid
graph LR
    subgraph "Fact Layer"
        F[Admitted Facts] -->|⊔ join| J[Journal]
    end

    subgraph "View Layer"
        J --> R[Reduction]
        R --> V[Canonical Domain View]
    end

    subgraph "UI Layer"
        V -->|Publish snapshot| S[Signal]
        S --> C1[Component]
        S --> C2[Component]
        S --> C3[Component]
    end

    style F fill:#e1f5fe
    style J fill:#e1f5fe
    style R fill:#b3e5fc
    style V fill:#81d4fa
    style S fill:#fff3e0
    style C1 fill:#ffe0b2
    style C2 fill:#ffe0b2
    style C3 fill:#ffe0b2
```

Pending actions and local interface state remain distinguishable from committed domain state. Subscribers recover from missed updates by reading a fresh snapshot. Observation failures remain explicit errors.

## Recover Identity Through Your Social Graph

Aura recovery uses guardians designated through an authorized setup protocol. Guardian policy sets eligible participants, scope, and the required threshold. Authenticated attestations bind each guardian's approval to a particular request and policy.

Distinct eligible attestations make the request eligible for a recovery ceremony. Consensus-gated transitions establish durable authorization for the approved membership or key change. Successful execution completes recovery.

```mermaid
graph TD
    subgraph Evidence["Guardian attestations · 2 of 3 required"]
        G1[Guardian 1 ✓]
        G2[Guardian 2 ✓]
        G3[Guardian 3 unavailable]
    end

    G1 --> A[Threshold Met]
    G2 --> A
    A --> B["Recovery Ceremony<br/>consensus-backed authorization"]
    B --> C["Execute Approved Change<br/>complete recovery"]

    style G1 fill:#e1f5fe
    style G2 fill:#e1f5fe
    style G3 fill:#f5f5f5,stroke-dasharray:4 4
    style A fill:#b3e5fc
    style B fill:#81d4fa
    style C fill:#c8e6c9
```

The interface can show sufficient attestations while the ceremony remains pending. It reports completion after the authorized action succeeds.

## Consentful Search

The same algebra suggests a search design. A query capability limits resources, purpose, and forwarding scope. Relays preserve these constraints and may narrow them further.

Each answering node applies its local disclosure policy. Admitted results can merge through union when their identities support deduplication. Permission to ask leaves recipients free to withhold an answer.

```mermaid
graph TD
    subgraph "Query Propagation"
        Q["Query Capability<br/>initial scope"] -->|⊓ preserve or narrow| N1["Relay<br/>scoped query"]
        N1 -->|⊓ preserve or narrow| N2["Node A<br/>local disclosure policy"]
        N1 -->|⊓ preserve or narrow| N3["Node B<br/>local disclosure policy"]
    end

    subgraph "Result Accumulation"
        N2 --> R2[Authorized Results A]
        N3 --> R3[Authorized Results B]
        R2 -->|⊔ join| M[Merged Results]
        R3 -->|⊔ join| M
    end

    M --> F[Final Response]
    style Q fill:#fff3e0
    style N1 fill:#ffe0b2
    style N2 fill:#ffcc80
    style N3 fill:#ffcc80
    style R2 fill:#e1f5fe
    style R3 fill:#e1f5fe
    style M fill:#b3e5fc
    style F fill:#81d4fa
```

Budgets constrain traffic and repeated disclosure. Surveillance resistance also needs controls for colluding relays, query correlation, multiple identities, and retained results. Those risks belong in the surrounding protocol's threat model.

## Structural Limits on Authority

A constitution establishes legitimate authority and procedures for changing it. Aura gives these concerns a technical expression through verifiable evidence, bounded delegation, and explicit agreement. Trusted keys and enforced boundaries connect those rules to the people authorized to act.

Participants can inspect the evidence behind a decision and the limits attached to a grant. Mathematics makes these commitments precise enough to verify. Infrastructure can then support authority that remains accountable as it passes between people.

---

[^journal]: Aura, [Journal](https://hxrts.com/aura/105_journal.html). Fact admission, reduction, and snapshot compaction.
[^biscuit]: Eclipse Biscuit, [Specifications](https://doc.biscuitsec.org/reference/specifications) and [Datalog](https://doc.biscuitsec.org/reference/datalog.html). Token attenuation, signature chains, and block scoping.
[^authorization]: Aura, [Authorization](https://hxrts.com/aura/106_authorization.html). Capability evaluation, sovereign policy, and guard integration.
