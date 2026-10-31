+++
title = "Global Protocol Synthesis"
date = 2025-02-09
description = "Preserving global compatibility through local reasoning as protocols change."
slug = "telltale"

[extra]
cover_image = "/images/labanotation-floor-plan.jpg"
cover_alt = "Nine generated floor plans showing labeled points and curved movement paths"
cover_caption = "Matthew Lewis, Labanotation floor plan generator (2008)"
+++

No participant in a distributed protocol executes the entire protocol. Each acts on a local view, yet their actions must satisfy a shared contract. When do these separate obligations fit together into a coherent global protocol? And when a global protocol changes, what makes its local implementations remain correct?

Consider a coordinator delegating unfinished work while messages are still in-flight. Its replacement inherits an execution already underway, including requests already sent and replies still owed. The global handoff must correspond to local changes that preserve those obligations. Checking each participant in isolation cannot establish that correspondence.

Telltale makes this relationship explicit. Developers build protocols through its Rust library, while a separate Lean formalization establishes properties of the underlying execution model. Its method assembles local compatibility checks into a preserved invariant of protocol execution, then relates global reconfiguration to the corresponding local actions. This gives protocol changes concrete proof obligations that account for messages still in-flight.

## Distributed participation in a shared contract

Multiparty session types, or MPST, describe a protocol globally and derive a local type for each participant. This derivation is called projection. A coordinator's obligation to send a request becomes a worker's obligation to receive it. Each implementation can then be checked against its own role in the protocol.

Since the original MPST formulation in 2008, the relationship between global protocols and local behavior has been a central research problem.[^honda] Projection asks whether a global description yields correct participant behaviors. In the other direction, synthesis asks when local behaviors can be assembled into a global protocol. Deniélou and Yoshida established a correspondence and synthesis algorithm for a class of communicating automata in 2013.[^synthesis]

Telltale develops this correspondence for asynchronous execution with linking and delegation. Sending and receiving happen separately, so a sender may await a reply while its request remains queued. Local compatibility must account for these different positions, including when responsibility changes hands. Operational coherence supplies the invariant, while harmony asks whether global transformations agree with their local implementations.

## Accounting for in-flight messages

The method reasons directly about protocol execution by recording each endpoint’s remaining local type alongside buffered messages on directed edges. A function called `Consume` checks whether a receiver's remaining type can consume its queued message types. Operational coherence requires this alignment wherever both endpoints exist.[^coherence] Lean checks the preservation arguments against explicit transition rules, making the side conditions part of the theorem.

After the coordinator sends its request, it has advanced while the worker still expects the request. The queue accounts for their different positions. An acknowledgement may later be queued in the opposite direction, creating another obligation for a replacement coordinator. Checking that queue against the worker's remaining obligations gives the proof information about the current state, without repeatedly reconstructing a global description.

Preservation follows by separating the edges affected by a step. The directly changed edge needs a new alignment argument, adjacent edges need compatibility checks, and unrelated edges retain their witnesses. These local arguments combine into preservation of operational coherence. Typing and receiver-readiness premises remain necessary, since an empty queue alone says nothing about whether future messages will match.

## Transferring protocol obligations

The same invariant supports compatible endpoint replacement and delegation. A replacement must preserve the messages the receiver can consume, and delegation must respect the surrounding endpoints and buffers. Under these conditions, the mechanized preservation results establish coherence after the change. The proof can reuse compatibility evidence for untouched parts of the system, so composing another component need not restart the argument for every unrelated interaction.

The reconfiguration paper connects this local reasoning to global protocols through *harmony*. Reconfiguring the global protocol and then projecting should agree with projecting first and performing the corresponding local reconfiguration.[^harmony] It also characterizes coherence through compatible witnesses for the projected local views. These witnesses establish joint compatibility, while constructing a global protocol from local descriptions is a separate synthesis question.

{% tikz(fig_w="560px", caption="<strong>Two routes, the same local result.</strong> C and C′ are global configurations before and after reconfiguration. The square commutes when projecting after the global step yields the same local configuration as stepping after projection, under the stated compatibility and correspondence assumptions. Adapted from the harmony square in Paper 3.") %}
\usetikzlibrary{arrows.meta}
\begin{tikzpicture}[
    x=1cm, y=1cm,
    every node/.style={font=\sffamily\small, align=center},
    >={Stealth[length=5pt,width=4pt]},
    line width=0.7pt
  ]
  % Both paths describe one linking or delegation operation.
  % Projection points downward only, without implying global synthesis.
  \node (g) at (0,0) {$C$};
  \node (gp) at (6,0) {$C'$};
  \node (l) at (0,-2.5) {$\mathsf{project}(C)$};
  \node (lp) at (6,-2.5) {$\mathsf{project}(C')$};
  \draw[->] (g.east) -- node[above=5pt] {$\mathsf{step}_{\mathsf{reconfig}}$} (gp.west);
  \draw[->] (l.east) -- node[below=5pt] {$\mathsf{localStep}_{\mathsf{reconfig}}$} (lp.west);
  \draw[->] (g.south) -- node[left=5pt] {$\mathsf{project}$} (l.north);
  \draw[->] (gp.south) -- node[right=5pt] {$\mathsf{project}$} (lp.north);
\end{tikzpicture}
{% end %}

Concrete linking and delegation preservation are mechanized. The broader commuting theorem depends on a supplied correspondence between global and local transformations, and the projected-view characterization remains a paper-level argument. The contribution is a reusable method for preserving compatibility through reconfiguration, with explicit obligations connecting the two descriptions. Each permitted transformation must discharge those obligations to support an implementation guarantee.

## Counting progress and permitted variation

The quantitative paper quantifies progress through a weighted potential by doubling the summed depths of remaining local types and adding buffered-message counts. Under its transition laws, productive steps decrease that quantity, bounding useful work by the initial potential.[^dynamics] Bounding all steps additionally requires a scheduler that services enabled work within a bounded interval. This makes the source of a progress guarantee inspectable, including the obligation owed by the execution environment.

The distinction separates unfinished protocol work from waiting for service, so a transition bound gives no wall-clock latency guarantee. A capacity result characterizes deadlock introduced by bounded queues, assuming deterministic execution, bounded occupancy, empty initial queues, and deadlock freedom without the bound. Finite reachable fragments support checking interfaces, while general asynchronous subtyping remains undecidable. Telltale's bounded subtyping checker can establish a refinement when it accepts, with exhausted searches remaining inconclusive.

Parallel execution introduces a related distinction between changed scheduling and changed meaning. Telltale describes permitted differences through a *determinism envelope*. Independent work may appear in a different order while preserving the observations required by an execution contract. A canonical execution supplies the reference, and more permissive execution requires explicit contracts for the variation it introduces.

## Making the boundary executable

The library carries these distinctions into a protocol machine that advances local types, manages buffers, and commits protocol-visible state. Typed effects connect that machine to host computations and transport. Synchronous handlers return declared outcomes, while asynchronous host work returns through later typed inputs. Keeping that boundary explicit makes ownership checks and replay possible, while domain code retains control over how it realizes the requested effect.

Ownership includes a generation, so an old callback cannot regain authority merely by presenting the same owner name. Stable operation identities distinguish retries from new work. Observational results and authoritative evidence also have different roles. A status display can report sufficient approvals while an authorized operation remains unfinished.

The verification follows these boundaries. Lean establishes model-level results, and differential tests compare Rust execution with theorem-defined state and event projections. Compiler paths and host integrations have their own assurance requirements.[^verification] The simulator runs the same protocol machine with controlled failures and recorded effects, allowing a developer to reproduce a failing handoff instead of reconstructing it from logs.

## Using Telltale

For library users, the starting point is a global protocol written with `tell!` or loaded from a `.tell` file. Supported protocols yield typed Rust session interfaces or local types for machine execution. Generated effect traits let application code provide domain decisions without defining communication order independently for every participant. Protocol metadata reports which projection and execution paths are available.[^library]

This is useful for coordinated workers, multi-party service workflows, and applications where ownership changes during unfinished work. The repository includes running fan-out/fan-in, producer-consumer, and browser communication examples. Machine integrations can use deterministic fault scenarios and replay through `SimulationHarness`, including delayed responses and ownership failures that ordinary successful runs may never exercise. Deployment still supplies suitable transport, storage, and environmental assumptions.

A handoff is usually described as moving responsibility from one participant to another. The protocol makes responsibility more precise. It includes the messages already sent and the continuations still owed to other participants. Preserving those relationships makes replacement a transformation that preserves the obligations other participants rely on.

---

[^honda]: Honda, K., Yoshida, N., & Carbone, M. (2008). [*Multiparty Asynchronous Session Types*](https://doi.org/10.1145/1328438.1328472). POPL 2008. Introduces the global-to-local MPST framework.

[^synthesis]: Deniélou, P.-M., & Yoshida, N. (2013). [*Multiparty Compatibility in Communicating Automata: Characterisation and Synthesis of Global Session Types*](https://arxiv.org/abs/1304.1902). ICALP 2013. Establishes correspondence and synthesis for a specified class of communicating automata.

[^coherence]: Berman, S. H. [*Coherence for Asynchronous Buffered MPST: A Mechanized Metatheory*](https://hxrts.com/telltale/papers/paper1.pdf). Telltale manuscript. Operational coherence, message consumption, preservation, and compatible replacement.

[^harmony]: Berman, S. H. [*Harmony from Coherence in Asynchronous MPST: A Minimal Erasure Invariant for Classical Dynamics*](https://hxrts.com/telltale/papers/paper3.pdf). Telltale manuscript. Each result distinguishes its mathematical premises and mechanization scope.

[^dynamics]: Berman, S. H. [*Computable Dynamics for Asynchronous MPST: Lyapunov Descent, Critical Capacity, and Decision Procedures*](https://hxrts.com/telltale/papers/paper2.pdf). Telltale manuscript. Quantitative bounds require the stated ranking laws, which are not yet established for every concrete machine instruction.

[^verification]: Telltale, [Verification Inventory](https://github.com/hxrts/telltale/blob/main/docs/902_verification_inventory.md). Separates Lean proofs, Rust correspondence tests, compiler boundaries, and supplied assumptions.

[^library]: [Telltale](https://github.com/hxrts/telltale) and [Getting Started](https://github.com/hxrts/telltale/blob/main/docs/201_getting_started.md). Rust session interfaces, machine integration, generated effects, and deterministic testing.
