+++
title = "Telltale: Local Reasoning for Safe Protocol Changes"
date = 2025-02-09
description = "Preserving global compatibility through local reasoning as protocols change."
slug = "telltale"

[extra]
cover_image = "/images/labanotation-floor-plan.jpg"
cover_alt = "Nine generated floor plans showing labeled points and curved movement paths"
cover_caption = "Matthew Lewis, Labanotation floor plan generator (2008)"
+++

Upgrading a distributed protocol means dealing with exchanges already underway. Peers may adopt a new version at different times, while messages sent under the old version remain in flight. One peer might upgrade after sending a request to another but before receiving its reply. What must the upgrade preserve so that the exchange can still complete correctly?

Checking that the new versions work together is only part of the problem. An upgraded peer must also accept replies from peers still following the old protocol. Each participant acts on a local view, and queues record messages that other participants have yet to receive. Compatibility during an upgrade depends on those unfinished exchanges as well as the behavior of each version.

{% tikz(preamble="static/images/telltale/styles.tex", fig_w="560px", caption="<strong>An upgrade inherits an unfinished exchange.</strong> Time runs downward. Peer B sends its reply under v1 before peer A upgrades, but the reply arrives afterward. The replacement must remain compatible with that outstanding reply.") %}
\begin{tikzpicture}[telltale]
  \path[use as bounding box] (-1.9,1) rectangle (7,-4.6);
  \node[tt heading] at (0,0.6) {PEER A};
  \node[tt heading] at (6,0.6) {PEER B};
  \draw[tt guide] (0,0.1) -- (0,-1.95);
  \draw[tt guide] (0,-2.65) -- (0,-4.2);
  \draw[tt guide,->] (6,0.1) -- (6,-4.2);
  \node[anchor=east,tt annotation] at (-0.2,-0.45) {v1};
  \node[anchor=east,tt annotation] at (-0.2,-3.8) {v2};
  \node[anchor=west,tt annotation] at (6.2,-0.45) {v1};
  \draw[tt flow] (0,-0.7) -- node[above,sloped,tt annotation] {Request} (6,-1.65);
  \draw[tt flow] (6,-2) -- node[above,sloped,tt annotation] {Reply sent under v1} (0,-3.8);
  \node[tt readout, minimum width=2.5cm, minimum height=0.7cm]
    at (0,-2.3) {Upgrade to v2};
  \fill (0,-0.7) circle (1.5pt);
  \fill (6,-1.65) circle (1.5pt);
  \fill (6,-2) circle (1.5pt);
  \fill (0,-3.8) circle (1.5pt);
\end{tikzpicture}
{% end %}

Telltale studies how to establish this compatibility through local checks and preserve it as a protocol changes. Its Rust library supports protocol construction and execution, while a separate Lean formalization proves properties of the execution model. The central idea is to check each participant's remaining obligations together with queued messages, then show how those checks compose. Reconfiguration becomes a question of which obligations a change must preserve.

## From a shared protocol to local obligations

Multiparty session types, or MPST, describe a protocol globally and derive a local type for each participant. This derivation is called projection. For a request from peer A to peer B, projection assigns a send to A and a matching receive to B. Each implementation can then be checked against its own role in the protocol.

Since the original MPST formulation in 2008, the relationship between global protocols and local behavior has been a central research problem.[^honda] Projection asks whether a global description yields correct participant behaviors. In the other direction, synthesis asks when local behaviors can be assembled into a global protocol. Deniélou and Yoshida established a correspondence and synthesis algorithm for a class of communicating automata in 2013.[^synthesis]

Telltale examines compatibility during asynchronous execution, including linking participants and delegating responsibility. A global description specifies the exchange, but the running system also contains messages that have been sent and not yet received. To justify a handoff, the proof must account for those messages as well as the participants' remaining actions.

## Accounting for in-flight messages

Telltale records the remaining local type at each endpoint, together with the messages queued in each direction. The local type describes the communication actions that endpoint still has to perform. A function called `Consume` checks whether the receiver's type can consume the queued message types. This alignment is required wherever both endpoints exist and forms the condition called *operational coherence*.[^coherence]

In the upgrade example, the request queue is checked against peer B's remaining receives. A reply from B is checked against peer A's remaining receives. Replacing A during an upgrade creates a handoff whose obligations include continuing this exchange. The queues let the proof account for the participants' different positions without reconstructing a global description after every step.

{% tikz(preamble="static/images/telltale/styles.tex", fig_w="620px", caption="<strong>Receiving a message preserves compatibility.</strong> Read the top snapshot first. Each panel records the peers' remaining actions and the contents of the A-to-B queue at one moment. Initially, the queued request matches B's next receive. After B receives it, the queue is empty and B can send the reply A expects. The reverse queue remains empty and is omitted.") %}
\begin{tikzpicture}[telltale]
  \path[use as bounding box] (-1.9,1.7) rectangle (8.7,-5.1);
  % Each bordered panel is a complete snapshot, with identical columns.
  \node[tt heading, anchor=west] at (-1.6,1.25)
    {1. BEFORE B RECEIVES THE REQUEST};
  \draw[draw=black!65,line width=.65pt] (-1.6,0.8) rectangle (8.4,-1.2);
  \draw[tt guide] (-1.6,0) -- (8.4,0);
  \draw[tt guide] (1.7,0.8) -- (1.7,-1.2);
  \draw[tt guide] (5.1,0.8) -- (5.1,-1.2);
  \node[tt column] at (0,0.4) {Peer A\\remaining actions};
  \node[tt column] at (3.4,0.4) {Queued messages\\from A to B};
  \node[tt column] at (6.75,0.4) {Peer B\\remaining actions};
  \node at (0,-0.6) {Receive reply};
  \node[tt readout, minimum width=1.7cm, minimum height=0.55cm]
    at (3.4,-0.6) {Request};
  \node at (6.75,-0.6) {Receive request\\then send reply};
  \node[tt heading, anchor=west] at (-1.6,-2.25)
    {2. AFTER B RECEIVES THE REQUEST};
  \draw[draw=black!65,line width=.65pt] (-1.6,-2.7) rectangle (8.4,-4.7);
  \draw[tt guide] (-1.6,-3.5) -- (8.4,-3.5);
  \draw[tt guide] (1.7,-2.7) -- (1.7,-4.7);
  \draw[tt guide] (5.1,-2.7) -- (5.1,-4.7);
  \node[tt column] at (0,-3.1) {Peer A\\remaining actions};
  \node[tt column] at (3.4,-3.1) {Queued messages\\from A to B};
  \node[tt column] at (6.75,-3.1) {Peer B\\remaining actions};
  \node at (0,-4.1) {Receive reply};
  \node[tt annotation] at (3.4,-4.1) {Empty};
  \node at (6.75,-4.1) {Send reply};
\end{tikzpicture}
{% end %}

To prove that a step preserves coherence, the argument checks the communication edges it affects and reuses compatibility evidence for unrelated edges. Lean checks this reasoning against explicit transition rules. The theorem also requires typing and receiver-readiness assumptions. These matter even when a queue is empty, since the absence of pending messages does not establish that future sends and receives will match.

## Transferring protocol obligations

The same reasoning applies when an endpoint is replaced or its responsibility is delegated. The change must preserve compatible message consumption and satisfy the conditions imposed by surrounding endpoints and buffers. Under these conditions, the mechanized results establish coherence after the change. Reusing evidence for untouched interactions allows the proof to focus on the obligations affected by the handoff.

A further question is whether the local handoff implements the intended change to the global protocol. Telltale calls this relationship *harmony*. Changing the global protocol and then projecting should agree with projecting first and making the corresponding local changes.[^harmony] The diagram expresses this agreement between the two orders of operation.

{% tikz(preamble="static/images/telltale/styles.tex", fig_w="560px", caption="<strong>Global and local reconfiguration agree.</strong> C and C′ denote the global configurations before and after a change. Following either route through the square yields the same local configuration, under the compatibility and correspondence assumptions described in the text. Adapted from the harmony paper.") %}
\begin{tikzpicture}[telltale]
  % Both paths describe one linking or delegation operation.
  % Projection points downward only, without implying global synthesis.
  \node (g) at (0,0) {$C$};
  \node (gp) at (6,0) {$C'$};
  \node (l) at (0,-2.5) {$\mathsf{project}(C)$};
  \node (lp) at (6,-2.5) {$\mathsf{project}(C')$};
  \draw[tt flow] (g.east) -- node[above=5pt,tt annotation] {$\mathsf{step}_{\mathsf{reconfig}}$} (gp.west);
  \draw[tt flow] (l.east) -- node[below=5pt,tt annotation] {$\mathsf{localStep}_{\mathsf{reconfig}}$} (lp.west);
  \draw[tt flow] (g.south) -- node[left=5pt,tt annotation] {$\mathsf{project}$} (l.north);
  \draw[tt flow] (gp.south) -- node[right=5pt,tt annotation] {$\mathsf{project}$} (lp.north);
\end{tikzpicture}
{% end %}

The scope of the proof matters for anyone implementing a new transformation. Preservation for concrete linking and delegation operations is mechanized, while the broader harmony theorem requires a supplied correspondence between global and local changes. An implementer must establish that correspondence for the transformation in question. The paper also characterizes coherence through compatible projected views, but that argument remains at the paper level and does not itself construct a global protocol from local descriptions.

## Compatibility and progress

A compatible handoff can still leave one peer waiting for another that the scheduler never services. Telltale therefore treats compatibility and progress as separate questions. Its quantitative analysis assigns a measure of unfinished work to local types and queued messages, then proves that productive steps decrease it under specified transition laws.[^dynamics] This bounds productive work, while a bound on all steps additionally requires the scheduler to service enabled work within a bounded interval.

{% tikz(preamble="static/images/telltale/styles.tex", fig_w="580px", caption="<strong>Compatibility alone does not bound waiting.</strong> These schematic traces start with the same unfinished protocol work. Flat segments represent steps that do not reduce that work, and drops represent productive steps. Under the ranking laws, productive steps decrease the potential. Bounding all steps also requires bounded scheduler service. Neither trace specifies elapsed time.") %}
\begin{tikzpicture}[telltale]
  \path[use as bounding box] (-1.2,3.2) rectangle (8,-5.6);
  \node[anchor=west, tt heading] at (0,2.8)
    {WITHOUT SCHEDULER SERVICE};
  \draw[tt axis] (0,0) -- (0,2.4);
  \draw[tt axis] (0,0) -- (7.5,0);
  \node[rotate=90] at (-0.55,1.2) {Work left};
  \node[anchor=east, font=\sffamily\footnotesize] at (7.5,-0.4)
    {Execution steps};
  \draw[tt trace] (0,2) -- (5.8,2);
  \draw[tt trace,dashed] (5.8,2) -- (7.4,2);
  \node[tt annotation] at (3.7,1.05) {Waiting can continue indefinitely};
  \node[anchor=west, tt heading] at (0,-1.35)
    {WITH BOUNDED SCHEDULER SERVICE};
  \draw[tt axis] (0,-4.2) -- (0,-1.8);
  \draw[tt axis] (0,-4.2) -- (7.5,-4.2);
  \node[rotate=90] at (-0.55,-3) {Work left};
  \node[anchor=east, font=\sffamily\footnotesize] at (7.5,-4.65)
    {Execution steps};
  \draw[tt trace] (0,-2.2) -- (1.2,-2.2)
    -- (1.2,-2.7) -- (3,-2.7) -- (3,-3.2)
    -- (4.8,-3.2) -- (4.8,-3.7) -- (6.6,-3.7) -- (6.6,-4.2);
  \fill (6.6,-4.2) circle (1.7pt);
  \node[anchor=south,tt annotation] at (4.7,-2.4)
    {Productive steps reduce work};
\end{tikzpicture}
{% end %}

These assumptions explain what the execution environment must supply. A step bound alone gives no wall-clock latency guarantee, and finite buffers introduce another possible source of deadlock. The analysis characterizes queue-induced deadlock under explicit restrictions and provides bounded checks for interface refinement.[^bounds] An exhausted refinement search remains inconclusive, so callers must distinguish failure to establish compatibility from evidence of incompatibility.

Parallel execution raises a different question about which changes in ordering are acceptable. Telltale calls the permitted variation a *determinism envelope*. An execution contract specifies which observations must agree with a canonical reference execution, even when independent work runs in a different order. More permissive execution therefore requires an explicit account of what may vary.

## Carrying obligations into execution

The Rust library's protocol machine tracks remaining actions, manages buffers, and commits protocol-visible state. Application code performs computation and transport through typed effects, with asynchronous results returning as later typed inputs. The application controls how work is performed, while the machine tracks which protocol actions can follow.

During an upgrade, a delayed callback may return after ownership has changed. Ownership generations let the machine distinguish the current owner from an earlier owner with the same name. Stable operation identities distinguish retries from new work, so returning results can be checked against both ownership and operation identity.

Lean proves model properties, and differential tests compare Rust execution with formally defined state and event views. Compiler paths and host integrations require separate verification.[^verification] The simulator runs the same machine with controlled failures and recorded effects, letting developers replay a failing upgrade and inspect how it handled outstanding obligations.

## The Rust library and research papers

Developers can use the Rust library to build coordinated services and applications that transfer responsibility during unfinished work. A global protocol written with `tell!` or loaded from a `.tell` file yields typed Rust session interfaces or local types for machine execution, where supported.[^library] Generated effect traits connect the protocol to application behavior, and the repository includes runnable examples. Integrations supply transport and storage, and can use `SimulationHarness` to replay delayed responses, ownership failures, and other controlled fault scenarios.

The three papers develop the theory behind Telltale’s approach to asynchronous execution and protocol reconfiguration. The coherence paper develops the buffered execution model and mechanized preservation arguments for compatible changes.[^coherence] The quantitative paper studies progress bounds, queue capacity, and decision procedures under explicit restrictions.[^dynamics] The harmony paper relates global reconfiguration to local execution, identifying the correspondence needed to justify a transformation.[^harmony]

An upgraded peer inherits more than a role or an owner name. It inherits a position in an exchange, including messages already sent and responses still owed. Telltale makes those obligations available to local reasoning, with explicit conditions connecting the handoff to the global protocol. Responsibility can change hands while preserving the exchange that other participants are relying on.

---

[^honda]: Honda, K., Yoshida, N., & Carbone, M. (2008). [*Multiparty Asynchronous Session Types*](https://doi.org/10.1145/1328438.1328472). POPL 2008. Introduces the global-to-local MPST framework.

[^synthesis]: Deniélou, P.-M., & Yoshida, N. (2013). [*Multiparty Compatibility in Communicating Automata: Characterisation and Synthesis of Global Session Types*](https://arxiv.org/abs/1304.1902). ICALP 2013. Establishes correspondence and synthesis for a specified class of communicating automata.

[^coherence]: Berman, S. H. [*Coherence for Asynchronous Buffered MPST: A Mechanized Metatheory*](https://hxrts.com/telltale/papers/paper1.pdf). Telltale manuscript. Operational coherence, message consumption, preservation, and compatible replacement.

[^harmony]: Berman, S. H. [*Harmony from Coherence in Asynchronous MPST: A Minimal Erasure Invariant for Classical Dynamics*](https://hxrts.com/telltale/papers/paper3.pdf). Telltale manuscript. Each result distinguishes its mathematical premises and mechanization scope.

[^dynamics]: Berman, S. H. [*Computable Dynamics for Asynchronous MPST: Lyapunov Descent, Critical Capacity, and Decision Procedures*](https://hxrts.com/telltale/papers/paper2.pdf). Telltale manuscript. The potential doubles the summed depths of remaining local types and adds buffered-message counts. Quantitative bounds require the stated ranking laws, which are not yet established for every concrete machine instruction.

[^bounds]: The quantitative manuscript cited above characterizes queue-induced deadlock assuming deterministic execution, bounded occupancy, empty initial queues, and deadlock freedom without the queue bound. Finite reachable fragments support interface checks, while general asynchronous subtyping remains undecidable. The bounded subtyping checker can establish a refinement when it accepts.

[^verification]: Telltale, [Verification Inventory](https://github.com/hxrts/telltale/blob/main/docs/902_verification_inventory.md). Separates Lean proofs, Rust correspondence tests, compiler boundaries, and supplied assumptions.

[^library]: [Telltale](https://github.com/hxrts/telltale) and [Getting Started](https://github.com/hxrts/telltale/blob/main/docs/201_getting_started.md). Rust session interfaces, machine integration, generated effects, and deterministic testing.
