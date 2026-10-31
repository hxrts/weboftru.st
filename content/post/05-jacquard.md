+++
title = "Adaptive Mesh Routing"
date = 2025-05-21
description = "Building a mesh routing protocol that adapts to changing connectivity and resource limits."
slug = "jacquard"
+++

Choosing a peer-to-peer routing algorithm also means choosing assumptions about connectivity and available resources. A protocol may depend on frequent neighbor updates, spare bandwidth, or storage for messages awaiting delivery. These assumptions often remain implicit in its design. Its operating limits can become apparent only after conditions change.

I built Jacquard to make these system contracts and their failure conditions more explicit.[^jacquard] It combines a Rust routing library with a deterministic simulator. The larger question is whether understanding those limits can guide an adaptive routing algorithm. Such an algorithm would adjust its behavior as connectivity and resource availability change.

## Comparing routing strategies

Consider two groups of devices joined by an intermittent relay. During a contact window, the relay provides a connected path between them. Between windows, a message may need to remain on a device until another transfer becomes possible. Several conversations may compete for that opportunity.

Routing strategies incur different costs in this situation. Maintaining next-hop tables consumes bandwidth for control traffic, while explicit search spends work constructing paths. Store-carry-forward uses storage and later contacts to move messages across disconnection. Changes in relay availability or resource budgets can make a previously suitable strategy ineffective.

Jacquard compares seven engines spanning proactive next-hop routing, explicit-path search, deferred delivery, and hybrid corridors.[^engines] The proactive group includes BATMAN variants, Babel’s distance-vector approach, and OLSRv2’s link-state approach. Engines propose routes through a shared contract, while a common router manages admission and installed route identities. Each engine states whether it exposes a path, a next hop, a corridor, or an opportunistic-delivery claim.

## Making the contract explicit

A system contract connects a strategy’s operating requirements to the service it can provide. Jacquard makes parts of that relationship explicit through capability declarations, resource limits, and admission checks. An engine uses observed conditions to assess a proposed route. The router assigns an accepted route an identity and a period of validity.

Later observations can undermine the evidence supporting that route. A lost link may require local repair, a different route, or a change of strategy. The engine reports the outcome through an explicit lifecycle. This gives adaptation a defined place to act, although detecting every violated assumption remains an experimental problem.

This distinction also permits honest descriptions of disconnection. Scatter can claim that opportunistic delivery is supportable without publishing a connected path. A corridor engine can distinguish loss of connected support from a decision to retain a message. Applications can make waiting an explicit requirement, and admission checks must preserve its meaning across a change of strategy.

## Experiments that can be replayed

The experiments first ask where each strategy’s operating assumptions stop supporting useful routing. A further question is whether observations of changing conditions can guide a better response. Jacquard compares implementations under controlled changes in connectivity, workload, and resource pressure. The scenarios include asymmetric links, partitions, delayed observations, and overloaded relays.

Each experiment runs a scenario across explicit seeds and engine configurations, allowing comparisons across multiple realizations of the same modeled conditions. Tuning sweeps identify operating points before comparative runs hold configurations fixed. Measurements include activation, route presence, recovery, and route changes. Additional experiments measure the weakest flow and check installed forwarding evidence against changed topology.[^method]

The simulator drives the same router and host integration used by the reference client. Routing state uses integer quantities, explicit logical time, and deterministic ordering. Replaying the same inputs reproduces the modeled execution. This makes a failed transition inspectable, although physical radios and uncontrolled traffic still require separate validation.

## Finding the failure conditions

The shared-relay experiments exposed a severe problem with averaging across objectives. Pathway alone gave one flow complete route availability while two others remained entirely unserved. BATMAN Bellman, Mercator, Scatter, and the combined Pathway–BATMAN stack avoided that starvation in the same families.[^fairness] Their minimum per-flow availability reached 100% on the measured fairness window.

A high average concealed a failure to support concurrent requests. An adaptive policy needs to detect that failure even while aggregate availability remains high. Measuring the weakest flow makes neglected requests visible. These experiments measure route availability, so successful packet delivery and throughput fairness remain further questions.

Delayed information creates another discrepancy between route presence and valid support. In the recovery-window experiment, Mercator published no unusable connected routes after the disruption but provided a route for less of the run. Pathway maintained higher publication presence while retaining unusable connected routes for nine rounds. The table counts rounds with unsupported connected routes after disruption alongside total-window publication presence.[^stale]

| Engine | Routing family | Invalid rounds | Presence |
|---|---|---:|---:|
| BATMAN Classic | Originator gossip | 7 | 73.3% |
| BATMAN Bellman | Topology-based next hop | 1 | 63.3% |
| Babel | Distance vector | 11 | 90.0% |
| OLSRv2 | Link state | 1 | 50.0% |
| Pathway | Explicit path | 9 | 93.3% |
| Scatter | Deferred delivery | N/A[^scatter-stale] | 93.3% |
| Mercator | Hybrid corridor | 0 | 60.0% |

## Choosing among engines

Registering several engines provides options for adaptation. In one high-loss connected scenario, however, the mixed router achieved 87.5% route presence. The best standalone engines reached 91.6% under their representative configurations.[^selection] Having a better option registered did not ensure its selection.

The router can retain an early acceptable route until maintenance or expiry triggers reconsideration. That policy preserves continuity, but it can delay a useful switch. Adaptive routing therefore requires criteria for reconsidering a strategy before its existing route disappears. The current experiments expose that requirement without yet establishing a reliable selection rule.

{{ tikz(source="static/images/jacquard/adaptation-findings.tex", fig_w="620px", caption="<strong>Different limits of engine composition.</strong> A compares Pathway with Pathway + BATMAN Bellman, which eliminates two starved flows in the shared-corridor experiment. B shows mixed-router selection trailing the standalone top tier by 4.1 percentage points under high loss. Bars measure route presence, not packet delivery, over the fairness window in A and the full run in B.") }}

Mercator explores a response to these findings. It maintains a bounded collection of evidence and plans a primary route with alternatives.[^mercator] It tracks underserved objectives and pressure on heavily used relays. Its repair process invalidates evidence after topology changes and withdraws connected support when surviving alternatives are insufficient.

## Carrying messages across gaps

Disconnection requires a different measure of success. A message can arrive through successive contacts without any simultaneous path between sender and recipient. Jacquard’s separate diffusion experiments measure delivery by a common workload deadline, undelivered targets, latency, and resource costs. Selective forwarding and suppression performed well under several modeled scarcity and congestion conditions.[^diffusion]

Those experiments simulate contact policies rather than executing every engine’s actual forwarding implementation. Unresolved deadlines remain unmeasured, and the same application outcomes still need instrumentation across actual engines. Some policies also use delivery and cluster information that a deployed system would need to obtain. Its acquisition cost and reliability remain unresolved.

Mercator’s implementation also has an important boundary. Its corridor planning and maintenance are implemented, but its router forwarding hook currently accepts payloads without transmitting them.[^forwarding] Its experimental results support further development of the design. They do not establish a finished Mercator delivery service.

## Using Jacquard as a library

For developers building peer-to-peer mesh systems, Jacquard supplies reusable routing contracts and an environment for evaluating implementations. The reference client combines in-tree engines with an in-memory network, allowing developers to inspect route activation and failure before supplying their own transport implementation. Applications construct topology observations, activate routing objectives, and advance explicit rounds.[^library] A host bridge handles incoming events, logical time, and queued transport sends.

Custom deployments can implement an engine, transport, or device profile against the shared interfaces. A transport adapter describes observed links and carries bytes. The router manages route identity and lifetime. A custom composition connects these responsibilities to the application’s executor and radio stack.

The most immediate use is to investigate a proposed routing design’s operating contract. Developers can vary conditions and inspect the failures that follow. Several engines already invoke transport senders, while production relay behavior still needs application integration. The same experiments can test whether an adaptive policy recognizes those failures and changes behavior soon enough to preserve service.

---

[^jacquard]: [Jacquard source repository](https://github.com/hxrts/jacquard). This post uses the 60-page [routing analysis report](https://hxrts.com/jacquard/reports/router-tuning-report.pdf), with implementation and measurement code pinned to [commit `03810f6`](https://github.com/hxrts/jacquard/commit/03810f6b80e7997a281d07e0205cd6181503e715). Report generation records the source fingerprint, artifact hashes, and seeds in its provenance artifact. The experiments comprise 1,488 routing runs and 2,112 contact-policy runs across seeds 41, 43, 47, and 53.

[^engines]: [Introduction and engine scope](https://github.com/hxrts/jacquard/blob/03810f6b80e7997a281d07e0205cd6181503e715/docs/101_introduction.md). The BATMAN variants differ substantially. Babel permits infeasible fallback, and OLSRv2 implements a simplified protocol. Results concern these implementations and configurations.

[^method]: [Experimental methodology](https://github.com/hxrts/jacquard/blob/03810f6b80e7997a281d07e0205cd6181503e715/docs/307_experimental_methodology.md) and [simulator architecture](https://github.com/hxrts/jacquard/blob/03810f6b80e7997a281d07e0205cd6181503e715/docs/306_simulator_architecture.md). Head-to-head runs use fixed representative configurations, which can differ from calibrated recommendations.

[^fairness]: [Routing analysis report, Table 5, pp. 25–26](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=25). Pathway records two starved objectives in the shared-corridor, asymmetric-demand, and detour-choice families. The named alternatives have 1000 permille minimum per-flow presence and no starved objectives.

[^stale]: [Report, Table 6, p. 27](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=27). The [support evaluator](https://github.com/hxrts/jacquard/blob/03810f6b80e7997a281d07e0205cd6181503e715/crates/simulator/src/experiments/support.rs) checks installed explicit paths or next-hop continuations against directed, usable links. It records preexisting failures separately and scans all later rounds, including later failures. These cumulative unsupported rounds measure exposure after intervention, without attributing every failure to that intervention.

[^scatter-stale]: Connected-route staleness does not apply to Scatter’s deferred-delivery claim. Its 93.3% publication presence describes retained routing claims, not connected paths or delivered messages. The report preserves this distinction in tables, figures, and rankings, with deferred delivery evaluated separately in the contact-policy model.

[^selection]: [Report, mixed-router comparison and Table 15](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=18). The standalone high-loss top tier includes Pathway, Scatter, Mercator, and Pathway with BATMAN Bellman. Their published route shapes provide different kinds of support.

[^mercator]: [Mercator implementation specification](https://github.com/hxrts/jacquard/blob/03810f6b80e7997a281d07e0205cd6181503e715/docs/406_mercator_routing.md). The experiments motivate these mechanisms, but do not isolate each mechanism’s contribution through ablation.

[^diffusion]: [Report, Tables 19–23, pp. 51–60](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=51). The [contact-policy executor](https://github.com/hxrts/jacquard/blob/03810f6b80e7997a281d07e0205cd6181503e715/crates/simulator/src/diffusion/runtime/execution.rs) implements these measurements. Named profiles use different resource budgets. “Viable” and “explosive” describe finite study thresholds, and observer exposure measures do not establish formal privacy.

[^forwarding]: [Mercator runtime](https://github.com/hxrts/jacquard/blob/03810f6b80e7997a281d07e0205cd6181503e715/crates/mercator/src/runtime.rs), `forward_payload_for_router`. The hook ignores the payload and returns success when an active route exists. Its declared capabilities remain connected-only, with hold unsupported.

[^library]: [Client assembly](https://github.com/hxrts/jacquard/blob/03810f6b80e7997a281d07e0205cd6181503e715/docs/503_client_assembly.md) and [custom composition](https://github.com/hxrts/jacquard/blob/03810f6b80e7997a281d07e0205cd6181503e715/docs/507_bringing_it_together.md). The stock builder supports in-tree engines and the in-memory carrier. Custom transports and arbitrary policy implementations require manual composition or builder extensions.
