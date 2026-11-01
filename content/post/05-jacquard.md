+++
title = "Adaptive Mesh Routing"
date = 2025-05-21
description = "Building a mesh routing protocol that adapts to changing connectivity and resource limits."
slug = "jacquard"

[extra]
cover_image = "/images/mesh.png"
cover_alt = "An irregular mesh of black, purple, orange, and green contours on a pale background"
+++

Choosing a peer-to-peer routing algorithm also means choosing assumptions about connectivity and available resources. A protocol may depend on frequent neighbor updates, spare bandwidth, or storage for messages awaiting delivery. These assumptions often remain implicit in its design. Its operating limits can become apparent only after conditions change.

I built Jacquard to make these system contracts and their failure conditions more explicit.[^jacquard] It combines a Rust routing library with a deterministic simulator. The goal is adaptive routing that remains useful as connectivity and resource availability change.

## Comparing routing strategies

Consider two groups of devices joined by an intermittent relay. During a contact window, the relay provides a connected path between them. Between windows, a message may need to remain on a device until another transfer becomes possible. Several conversations may compete for that opportunity.

Routing strategies incur different costs in this situation. Maintaining next-hop tables consumes bandwidth for control traffic, while explicit search spends work constructing paths. Store-carry-forward uses storage and later contacts to move messages across disconnection. Changes in relay availability or resource budgets can make a previously suitable strategy ineffective.

Jacquard compares seven engines spanning proactive next-hop routing, explicit-path search, deferred delivery, and hybrid corridors.[^engines] The proactive group includes BATMAN variants, Babel’s distance-vector approach, and OLSRv2’s link-state approach. Engines propose routes through a shared contract, while a common router manages admission and installed route identities. Each engine states whether it exposes a path, a next hop, a corridor, or an opportunistic-delivery claim.

## Making the contract explicit

A system contract connects a strategy’s operating requirements to the service it can provide. Jacquard makes parts of that relationship explicit through capability declarations, resource limits, and admission checks. An engine uses observed conditions to assess a proposed route. The router assigns an accepted route an identity and a period of validity.

Later observations can undermine the evidence supporting that route. A lost link may require local repair, a different route, or a change of strategy. The engine reports the outcome through an explicit lifecycle. This gives adaptation a defined place to act, although detecting every violated assumption remains an experimental problem.

This distinction also permits honest descriptions of disconnection. Scatter can claim that opportunistic delivery is supportable without publishing a connected path. A corridor engine can distinguish loss of connected support from a decision to retain a message. Applications can make waiting an explicit requirement, and admission checks must preserve its meaning across a change of strategy.

{{ tikz(source="static/images/jacquard/adaptation-findings.tex", fig_w="620px", caption="<strong>Three different disruption responses.</strong> The same disconnection can leave a route claim unsupported, end the claim, or leave a message waiting for another contact. Blue arrows mark a retained route claim. This is a schematic of possible responses, not a measured switching sequence.") }}

## Deterministic routing experiments

The experiments first ask where each strategy’s operating assumptions stop supporting useful routing. A further question is whether observations of changing conditions can guide a better response. Jacquard compares implementations under controlled changes in connectivity, workload, and resource pressure. The scenarios include asymmetric links, partitions, delayed observations, and overloaded relays.

Each experiment runs a scenario across explicit seeds and engine configurations, allowing comparisons across multiple realizations of the same modeled conditions. Tuning sweeps identify operating points before comparative runs hold configurations fixed. Measurements include activation, route presence, recovery, and route changes. Further experiments check the weakest flow, validate installed forwarding evidence, and measure Mercator’s actual message delivery.[^method]

The simulator drives the same router and host integration used by the reference client. Routing state uses integer quantities, explicit logical time, and deterministic ordering. Replaying the same inputs reproduces the modeled execution. This makes a failed transition inspectable, although physical radios and uncontrolled traffic still require separate validation.

## Finding failure conditions

The shared-relay experiments exposed a severe problem with averaging across objectives. Pathway alone gave one flow complete route availability while two others remained entirely unserved. BATMAN Bellman, Mercator, Scatter, and the combined Pathway–BATMAN stack avoided that starvation in the same families.[^fairness] Their minimum per-flow availability reached 100% on the measured fairness window.

A high average concealed a failure to support concurrent requests. An adaptive policy needs to detect that failure even while aggregate availability remains high. Measuring the weakest flow makes neglected requests visible. These shared-relay experiments measure route availability, leaving packet delivery and throughput fairness to separate measurements.

Delayed information also separates retaining a route claim from maintaining connected support. Pathway kept unsupported connected routes for nine rounds in the recovery-window experiment. Mercator retained claims during disconnection as deferred support, which promises a different service. The table compares publication presence alongside invalid connected-route rounds.[^stale]

| Engine | Routing family | Invalid rounds | Presence |
|---|---|---:|---:|
| BATMAN Classic | Originator gossip | 7 | 73.3% |
| BATMAN Bellman | Topology-based next hop | 1 | 63.3% |
| Babel | Distance vector | 11 | 90.0% |
| OLSRv2 | Link state | 1 | 50.0% |
| Pathway | Explicit path | 9 | 93.3% |
| Scatter | Deferred delivery | N/A[^scatter-stale] | 93.3% |
| Mercator | Hybrid corridor | 0 | 93.3%[^mercator-presence] |

## Choosing among engines

Registering several engines provides options for adaptation. In one high-loss connected scenario, however, the mixed router achieved 87.5% route presence. The best standalone engines reached 91.6% under their representative configurations.[^selection] Having a better option registered did not ensure its selection.

The router can retain an early acceptable route until maintenance or expiry triggers reconsideration. That policy preserves continuity, but it can delay a useful switch. Adaptive routing therefore requires criteria for reconsidering a strategy before its existing route disappears. The current experiments expose that requirement without yet establishing a reliable selection rule.

## Mercator’s adaptive delivery

Mercator responds by maintaining a primary corridor with alternatives, tracking underserved objectives and pressure on heavily used relays.[^mercator] Its payload runtime replans connected paths and, when the application permits holding, retains messages for later contacts. Relays forward messages with bounded storage and retries, while terminal records distinguish delivery from submission. The schematic below uses a three-objective Mercator simulation.[^mercator-topology]

{{ tikz(source="static/images/jacquard/mercator-fields.tex", fig_w="680px", caption="<strong>Routing demands overlap at shared relays.</strong> The ten-node detour-choice simulation has concurrent objectives 1 → 6, 2 → 7, and 3 → 8. Gray lines show the actual topology. Blue arrows illustrate supported corridors, with a pale amber band marking the detour, while overlapping contours suggest competing demands and pressure around relays 4 and 5. Contours are schematic, not measured fields, and the highlighted paths do not reconstruct the run’s selected routes.") }}

The application experiments isolate two mechanisms within the same implementation. Across successive contacts without a simultaneous path, adaptive Mercator delivered all 16 offered messages, compared with none when partition holding was disabled. After a detour became necessary, it delivered 16 of 16, compared with 4 of 16 when forwarding stayed on the initial path. All modes shared the same workload and resource limits.[^delivery]

These results demonstrate adaptive delivery within the tested conditions. They also expose its limits: three quarters of the messages in the successive-contact experiment met the deadline, and none arrived when contact never returned. The trials provide explicit topology observations and use volatile storage. The larger evaluation tests observation exchange and engine-owned discovery, while restart survival and physical radio behavior remain outside its scope.

## Carrying messages across gaps

Disconnection requires a different measure of success. A message can arrive through successive contacts without any simultaneous path between sender and recipient. Jacquard’s separate diffusion experiments measure delivery by a common workload deadline, undelivered targets, latency, and resource costs. Selective forwarding and suppression performed well under several modeled scarcity and congestion conditions.[^diffusion]

Those experiments simulate contact policies rather than executing every engine’s actual forwarding implementation. Unresolved deadlines remain unmeasured, and equivalent application trials across the other engines remain necessary. Some policies also use delivery and cluster information that a deployed system would need to obtain. Its acquisition cost and reliability remain unresolved.

## Using Jacquard as a library

Jacquard gives developers a way to build mesh applications without tying them to one routing strategy. Its shared routing contract lets an application state what it needs while engines determine what the observed network can support. This makes it possible to compare strategies or combine them without rebuilding the application around each engine’s internal model.[^library]

The simulator makes that choice testable before deployment. A developer can model intermittent contacts or an overloaded relay, then examine whether routing still supports the application’s requirements. The same routing implementation runs in these controlled experiments and in a host integration. Connecting it to a deployed network requires adapters that supply link observations and carry messages through the chosen transport.

Jacquard is particularly useful when a network’s operating conditions are expected to change. The simulation environment allows running experiments that help developers identify when a strategy stops meeting their requirements and iterate on that strategy. The key deployment question then becomes whether the system is able to recognize conditions soon enough to act.

---

[^jacquard]: [Jacquard source repository](https://github.com/hxrts/jacquard). This post uses the [routing analysis report](https://hxrts.com/jacquard/reports/router-tuning-report.pdf) and the implementation in the repository. Report generation records the source fingerprint, artifact hashes, and seeds in its provenance artifact. The experiments comprise 1,488 routing runs, 2,112 contact-policy runs, and 96 actual Mercator delivery runs across seeds 41, 43, 47, and 53.

[^engines]: [Introduction and engine scope](https://github.com/hxrts/jacquard/blob/main/docs/101_introduction.md). The BATMAN variants differ substantially. Babel permits infeasible fallback, and OLSRv2 implements a simplified protocol. Results concern these implementations and configurations.

[^method]: [Experimental methodology](https://github.com/hxrts/jacquard/blob/main/docs/307_experimental_methodology.md) and [simulator architecture](https://github.com/hxrts/jacquard/blob/main/docs/306_simulator_architecture.md). Head-to-head runs use fixed representative configurations, which can differ from calibrated recommendations.

[^fairness]: [Routing analysis report, Table 5, pp. 25–26](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=25). Pathway records two starved objectives in the shared-corridor, asymmetric-demand, and detour-choice families. The named alternatives have 1000 permille minimum per-flow presence and no starved objectives.

[^stale]: [Report, Table 6, p. 27](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=27). The [support evaluator](https://github.com/hxrts/jacquard/blob/main/crates/simulator/src/experiments/support.rs) checks installed explicit paths or next-hop continuations against directed, usable links. It records preexisting failures separately and scans all later rounds, including later failures. These cumulative unsupported rounds measure exposure after intervention, without attributing every failure to that intervention.

[^scatter-stale]: Connected-route staleness does not apply to Scatter’s deferred-delivery claim. Its 93.3% publication presence describes retained routing claims, not connected paths or delivered messages. The report preserves this distinction in tables, figures, and rankings, with deferred delivery evaluated separately in the contact-policy model.

[^mercator-presence]: Mercator’s publication presence includes deferred claims during partitions. Its zero invalid connected-route rounds do not mean it maintained a connected path throughout the run.

[^selection]: [Report, mixed-router comparison, p. 19](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=19) and [standalone comparison, Table 15, p. 46](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=46). The standalone high-loss top tier includes Pathway, Scatter, Mercator, and Pathway with BATMAN Bellman. Their published route shapes provide different kinds of support.

[^mercator]: [Mercator implementation specification](https://github.com/hxrts/jacquard/blob/main/docs/406_mercator_routing.md). The delivery trials isolate holding and path reconsideration. Broker-pressure accounting and the remaining mechanisms are evaluated together.

[^mercator-topology]: [Detour-choice topology and scenario](https://github.com/hxrts/jacquard/blob/main/crates/simulator/src/experiments/comparison.rs). The `head-to-head-multi-flow-detour-choice` Mercator run with seed 41 in `local/run-0004` records three objectives, 100% minimum per-objective route presence, 84 connected-support objective-rounds, and zero invalid-support rounds. The scenario degrades link 4–5 at round 9, limits relay 5 at round 12, and degrades link 9–10 at round 18. These are route-support measurements, rather than packet-delivery results.

[^diffusion]: [Report, Tables 19–23, pp. 51–60](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=51). The [contact-policy executor](https://github.com/hxrts/jacquard/blob/main/crates/simulator/src/diffusion/runtime/execution.rs) implements these measurements. Named profiles use different resource budgets. “Viable” and “explosive” describe finite study thresholds, and observer exposure measures do not establish formal privacy.

[^delivery]: [Report, Table 24](https://hxrts.com/jacquard/reports/router-tuning-report.pdf#page=61) and [application delivery trials](https://github.com/hxrts/jacquard/tree/main/crates/simulator/src/delivery). Eight four-node scenarios use four seeds, four messages per run, a 12-round application deadline, and a 48-round observation window. The carrier enforces directed connectivity, seeded loss, MTU, and byte limits. These ablations compare Mercator modes, not all seven engines.

[^library]: [Client assembly](https://github.com/hxrts/jacquard/blob/main/docs/503_client_assembly.md) and [custom composition](https://github.com/hxrts/jacquard/blob/main/docs/507_bringing_it_together.md). The stock builder supports the in-tree engines. Custom transport drivers can use `build_with_driver`, while the host bridge retains ownership of ingress and logical time.
