+++
title = "Jacquard: Adaptive Mesh Routing"
date = 2025-05-21
description = "Building a mesh routing protocol that adapts to changing connectivity and resource limits."
slug = "jacquard"

[extra]
cover_image = "/images/mesh.png"
cover_alt = "An irregular mesh of black, purple, orange, and green contours on a pale background"
+++

Choosing a peer-to-peer routing algorithm also means choosing assumptions about the network. A protocol may depend on frequent neighbor updates, spare bandwidth, or storage for messages awaiting delivery. These requirements often remain implicit in its design. Their consequences become apparent when conditions change.

I built Jacquard to make these system contracts and their failure conditions more explicit.[^jacquard] It combines a Rust routing library with a deterministic simulator. I use it to ask whether a routing policy preserves useful service as connectivity and resource availability change, without someone repeatedly choosing a new configuration. An adaptive policy must preserve delivery while keeping traffic and retained storage within useful limits.

## Choosing the routing baselines

I chose baselines spanning major mesh-routing categories to compare their assumptions about connectivity, information, and resources. The classic protocols represent three approaches to maintaining destination-based forwarding information.[^classic-routing]

- **BATMAN Classic (local, next-hop-oriented)** chooses a neighbor for each destination using the reliability of relayed originator messages. It targets connected meshes with regular advertisements, without reconstructing the full topology or selecting a complete sequence of peers.
- **Babel (distance-vector)** combines neighbors' advertised destination costs with local link costs to choose a next hop. It targets connected wired and wireless meshes with changing link quality, assuming updates can converge.
- **OLSRv2 (link-state)** spreads topology updates through selected relays and computes destination next hops from its topology view. It targets connected mobile meshes with the bandwidth and storage to keep topology information current.

I added two purpose-built baselines to test explicit peer-route search and deferred delivery.[^engines]

- **Pathway** searches observed topology for an explicit peer route, an ordered sequence of peers from sender to recipient. It tests this approach when usable topology information and computation are available.
- **Scatter** retains messages for bounded replication or handoff during contacts. It tests basic store-and-forward behavior across disconnection, where storage and waiting are acceptable.

This collection lets me compare implicit contracts and locate their failure limits. An explicit peer route names the peers to traverse, while a next-hop choice names only a neighbor for a destination. Jacquard gives either forwarding claim an identity and lifetime without making their representations interchangeable.[^route-shapes]

## Strategy selection

I first tried using the existing routing algorithms as layered middleware. The engines operated in priority order, with the fallback engine used only when the preferred engine could not provide a usable forwarding option. Useful switching required shared context about connectivity, evidence freshness, and resources. Encoding that context centrally would have made Jacquard's engine-neutral framework too opinionated.[^strategy]

Next I added Bellman-Ford computation over a gossip-built topology graph to BATMAN's next-hop selection, creating BATMAN Bellman. I wanted to compare locally observed forwarding quality with quality calculated from a wider topology view. The hybrid was more effective in my early forwarding-support tests. It still maps a destination to a neighbor, paying for extra topology information without exposing a Pathway-style peer route.[^hybrid]

I then broadened the simulations across routing engines and operating conditions to locate their implicit contracts and failure limits. Those findings informed Mercator's design. The subsequent delivery study tests that design against the other engines and its own forwarding-mode controls.[^method]

## Measuring service and its cost

My next experiment counted how many simulation rounds an engine advertised connected forwarding even though its selected peer sequence or next-hop decisions could not reach the destination over usable links. In its recovery-window scenario, Pathway averaged nine such rounds per objective after disruption. Mercator recorded zero, while exposing deferred claims during disconnection.[^stale] These forwarding-support results leave application deadline success to be measured.

All seven engines face the same nominal workload, with a base budget of 4 KiB per directed link per round and a 16 KiB engine payload ceiling per node. Recovery counts windows that regain 90% deadline success within two deadlines. Traffic counts actual serialized bytes through the final application deadline, including protocol messages and traffic from unsuccessful deliveries. Peak buffer is the largest engine-owned payload and reassembly footprint, and drain is the maximum observed queue clearance time in rounds after new messages stop.[^joint-metrics]

The classic implementations provide connected forwarding, while Mercator also supplies custody, acknowledgements, and retries. The table compares complete configured delivery systems, so differences include these delivery mechanisms as well as forwarding decisions.[^engines]

| Engine | On time | Worst sender | 90% recovery | KiB / timely | Peak buffer | Drain |
|---|---:|---:|---:|---:|---:|---:|
| BATMAN Classic | 53.7% | 38.0% | 144/768 | 636.0 | 0 B | 0 |
| BATMAN Bellman | 43.5% | 26.8% | 135/768 | 1,901.7 | 0 B | 0 |
| Babel | 55.3% | 45.8% | 187/768 | 910.9 | 0 B | 0 |
| OLSRv2 | 54.5% | 46.9% | 185/768 | 589.4 | 0 B | 0 |
| Pathway | 54.3% | 40.1% | 206/768 | 75.6 | 0 B | 0 |
| Scatter | 42.8% | 0.0% | 0/768 | 95.2 | 1,024 B | 62 |
| Mercator | 96.4% | 92.9% | 768/768 | 46.9 | 1,280 B | 11 |

In these configured runs, Scatter's deadline success was 42.8%, compared with 96.4% for Mercator. Worst sender success averaged 0.0% and 92.9%, respectively. Scatter's calibrated forwarding thresholds require an advantage in storage allowance or relay headroom for non-recipient peers. Equal relay resources provide no positive gradient, and the single shared transport also restricts dense-mode forwarding.[^scatter]

One sender has direct recipient contacts; the other needs intermediate relays. Scatter can retain the distant sender's messages without identifying a qualifying relay, leaving them waiting despite available forwarding opportunities. Retention alone therefore does not ensure progress. This is a limitation of the configured policy, not evidence that store-and-forward generally performs poorly.

## Testing delivery as conditions change

Every engine stays alive through connected, interrupted, constrained, and recovered conditions. Some phases combine reduced bandwidth, packet loss, disappearing shortcuts, and relays refusing new custody. Queues and routing state survive each transition. A message succeeds only when its recipient accepts it by its deadline.[^method]

Hosts learn local contacts, then exchange bounded advertisements for remote links and storage availability. These advertisements compete with payloads for link capacity and can be delayed, lost, or reordered. Discovery can therefore delay delivery after connectivity returns.

Development runs select the best-performing of eight Mercator baseline configurations before the executable and evaluation manifest are frozen. The 15,744-run matrix covers two topology families, three network sizes, and resource and workload sweeps. Fresh seeds test variation within previously studied families. Paired comparisons share external conditions and count rejected submissions among offered messages.[^contract]

## Mercator's adaptive delivery

BATMAN Classic adapts its preferred neighbor as reachability observations change. Babel exchanges destination costs, while OLSRv2 derives next hops from disseminated topology. BATMAN Bellman adds graph-based computation but still selects a neighbor, and Pathway searches for explicit peer sequences. Mercator brings supported forwarding alternatives and bounded message custody into the same engine, allowing it to reconsider both where a message should move and whether it should wait.[^route-shapes][^mercator]

Mercator groups a primary peer sequence and bounded alternatives into a **corridor**, using recent evidence and estimated relay pressure. A corridor preserves alternative continuations, giving forwarding more flexibility than a single selected peer route.[^route-shapes]

{{ tikz(source="static/images/jacquard/mercator-fields.tex", fig_w="680px", caption="<strong>Routing demands overlap at shared relays.</strong> The ten-node detour-choice simulation has concurrent objectives 1 → 6, 2 → 7, and 3 → 8. Gray lines show the actual topology. Blue arrows illustrate supported corridors, with a pale amber band marking the detour, while overlapping contours suggest competing demands and pressure around relays 4 and 5. Contours are schematic, not measured fields, and the highlighted paths do not reconstruct the run’s selected routes.") }}

If the primary sequence loses support, Mercator can replace it with an alternative whose evidence remains valid. If none remains supported, it withdraws the connected-forwarding claim. Permitted custody can keep the delivery attempt active without asserting that a connected route exists.[^mercator]

For example, a message may reach a relay just before the network partitions. The relay can retain it, within storage and lifetime limits, until a usable contact appears. The delivery objective persists while the available means of reaching the recipient change.

Bounded queries fill gaps in topology knowledge, while acknowledged custody transfers and returns let messages move between relays. Recent recipient acknowledgements temporarily discourage blind exploration and returns, while known fresh alternatives remain usable. Buffer, transmission, and lifetime limits bound the work spent pursuing delivery.[^mercator] These mechanisms draw on established opportunistic routing and delay-tolerant networking ideas; Mercator combines them around an evidence-qualified corridor and delivery lifecycle.

Scatter also retains messages across disconnection, so waiting alone does not distinguish Mercator. Scatter chooses opportunistic replication and handoff from local peer scores without maintaining a topology graph or corridor. Mercator combines discovered peer sequences and supported alternatives with acknowledged custody transfers, using connected forwarding when supported and permitted holding when it is not.[^engines][^mercator]

Adaptive Mercator delivered 96.4% of offered messages by their deadline, compared with 94.0% for the fixed-peer-route policy selected on development runs. The paired difference was 2.3 percentage points, with a 95% confidence interval of 2.0 to 2.6 points. Under resource pressure, the rates were 86.6% and 79.9%. During contact gaps, they were 92.3% and 89.9%.[^contract]

{{ tikz(source="static/images/jacquard/adaptation-findings.tex", fig_w="620px", caption="<strong>Deadline success by operating condition.</strong> Points average deadline success for messages created in each condition, equally across six nominal cells and 64 paired seeds. Shading marks changing conditions. Recovered combines both recovery periods.") }}

Connected-only mode, which disables deferred holding, gave 72.1% deadline success. Fixed-peer-route mode, which retains each message's first selected peer sequence, gave 94.4%. These ablations compare forwarding modes with matched retry and lifetime settings, including differences in holding, exploration, and replacement of the selected peer sequence.[^delivery]

The fixed-peer-route control still discovers an initial peer sequence and uses acknowledged custody transfers, retries, fragmentation, and resource limits. Its 94.4% success shows that this combination already provides much of Mercator's nominal delivery performance. Adaptation adds a smaller nominal gain, with larger gains under particular contact patterns. Because the modes change several mechanisms together, their differences do not isolate the contribution of holding or corridor selection alone.[^delivery]

Scatter's parameters were calibrated through simulation, but its carrier-selection policy still stalls when equally provisioned relays offer no score advantage. Mercator's stronger results here show the value of combining informed forwarding with bounded custody under these conditions. The comparison exposes a limit of the calibrated Scatter policy, rather than establishing a general limit of diffusion.

## When is adaptive routing worth it?

Waiting on a well-chosen peer sequence can handle some interruptions. Adaptation becomes useful when the available continuations change during a message's lifetime. In cyclic-contact trials, adaptive Mercator met 97.8% of deadlines, compared with 82.4% for the fixed-peer-route control.[^contract]

That flexibility has costs. Burst trials were nearly tied at 97.4% and 97.3%, with the paired interval for the difference including zero. In one low-bandwidth grid setting, adaptation lost 8.3 percentage points.[^contract] Discovery and state maintenance can consume resources without producing enough additional timely deliveries.

I would therefore start with effective forwarding and bounded custody, then replay the intended workload to test whether adaptation earns its traffic and storage costs through better deadline success and recovery. These comparisons evaluate the complete adaptive policy, not the contribution of each mechanism. Recovery is not uniform: a saved development case missed its target because one message arrived a round late.[^boundary] Unknown-peer discovery, restart survival, and physical-radio validation remain outside these simulations.

## Using Jacquard as a library

The reference client assembles engines behind a host bridge for incoming events, logical time, and queued sends. Applications submit objectives through common interfaces. Mercator and Scatter expose recipient delivery records, while connected engines supply forwarding choices for application relays. Custom transports can reuse this assembly.[^library]

Developers can set evaluation deadlines and resource limits in the simulator, then replay expected network conditions. They can inspect rejected requests, stale forwarding evidence, queued messages, and failed recovery. Saved configurations and seeds make failures reproducible.

Give Jacquard a try if you're trying to understand the the system contract of an existing mesh routing protocol, or if you're engineering your own protocol for a desired set of conditions.

---

[^jacquard]: [Jacquard source repository](https://github.com/hxrts/jacquard) and [routing analysis report](https://hxrts.com/jacquard/reports/router-tuning-report.pdf). Report provenance binds the archived runtime source, frozen executable, configurations, raw artifact hashes, and seed reserve. The report includes routing and contact-policy experiments, delivery ablations, and the changing-regime evaluation described here.

[^classic-routing]: [BATMAN implementations](https://github.com/hxrts/jacquard/blob/main/docs/401_batman_routing.md), [Babel specification, RFC 8966](https://www.rfc-editor.org/rfc/rfc8966.html), and [OLSRv2 specification, RFC 7181](https://www.rfc-editor.org/rfc/rfc7181.html). These categories distinguish routing knowledge and computation, rather than mutually exclusive forwarding mechanisms. The operating assumptions summarized here describe intended uses, not delivery guarantees under arbitrary changes.

[^engines]: [Engine scope](https://github.com/hxrts/jacquard/blob/main/docs/101_introduction.md), [Pathway](https://github.com/hxrts/jacquard/blob/main/docs/404_pathway_routing.md), and [Scatter](https://github.com/hxrts/jacquard/blob/main/docs/405_scatter_routing.md). Results concern these implementations and representative configurations, rather than an optimum over each protocol's parameters. Babel permits infeasible fallback, and OLSRv2 implements a simplified protocol. The connected engines share a bounded application relay without added custody, acknowledgements, or retries.

[^route-shapes]: [Engine forwarding representations](https://github.com/hxrts/jacquard/blob/main/docs/303_routing_engines.md) and [forwarding snapshots](https://github.com/hxrts/jacquard/blob/main/crates/core/src/routing/forwarding.rs). Pathway exposes `ExplicitPath`; both BATMAN engines, Babel, and OLSRv2 expose `NextHopOnly`. Mercator exposes `CorridorEnvelope`, storing primary and alternative peer sequences internally. Scatter is `Opaque`: its deferred-delivery claim promises neither a stable next hop nor an explicit peer sequence.

[^strategy]: [Mixed-router analysis](https://hxrts.com/jacquard/reports/router-tuning-report.pdf) and [router middleware](https://github.com/hxrts/jacquard/blob/main/crates/router/src/middleware.rs). The reported mixed stack gathers candidates across engines and publishes one canonical routing record per objective. An accepted claim remains in use until maintenance or expiry requires reconsideration, so the other engines can remain fallback choices despite changing conditions.

[^hybrid]: [BATMAN Bellman implementation](https://github.com/hxrts/jacquard/blob/main/docs/401_batman_routing.md) and [routing analysis](https://hxrts.com/jacquard/reports/router-tuning-report.pdf). Bellman-Ford runs locally over a gossip-merged topology graph, while the router-facing result remains a next-hop decision. The early tests concerned published forwarding support and convergence. The later deadline-delivery study uses a different workload and outcome, so those early results do not establish general superiority.

[^scatter]: Non-recipient [peer scores](https://github.com/hxrts/jacquard/blob/main/crates/scatter/src/support.rs) use available storage and relay headroom. Positive thresholds discourage transfers without an advantage, while direct recipients receive a separate bonus. The [forwarding reducer](https://github.com/hxrts/jacquard/blob/main/crates/scatter/src/runtime.rs) also gates dense-mode non-recipient transfers on transport diversity. The [nominal scenario](https://github.com/hxrts/jacquard/blob/main/crates/simulator/src/adaptation/scenario.rs) gives one sender direct recipient contacts and requires the other to relay. The [calibration corpus](https://github.com/hxrts/jacquard/blob/main/analysis/text.md) includes routing-profile and diffusion-policy comparisons. The deadline study exposes a failure condition of the calibrated Scatter policy; it does not establish a general limit of diffusion.

[^stale]: [Routing analysis report, recovery-window experiment](https://hxrts.com/jacquard/reports/router-tuning-report.pdf) and [support evaluator](https://github.com/hxrts/jacquard/blob/main/crates/simulator/src/experiments/support.rs). Installed peer sequences and corridor alternatives, or diagnostic chains reconstructed from next-hop decisions, are checked against directed, usable links. Reconstructing a chain for measurement does not mean a next-hop engine stores an explicit peer route. The count accumulates unsupported rounds after disruption, which need not be consecutive or involve the same route. Deferred-delivery claims are recorded separately, so Mercator's zero does not mean it maintained connectivity throughout the partition.

[^joint-metrics]: [Common-service protocol and measurement definitions](https://github.com/hxrts/jacquard/blob/main/docs/308_adaptive_delivery_evaluation.md). The table covers six nominal cells across eight-, sixteen-, and thirty-two-node networks in two topology families, with 64 seeds per cell and 384 runs per engine. On time averages success among all offered messages in each run, equally across cells and seeds. Worst sender first takes the lower of the two sender fractions within each run, then averages those values, so different path lengths prevent interpreting it as intrinsic fairness.

    Recovery counts assessed windows reaching 90% deadline success within 64 rounds, using a complete deadline-wide creation cohort. Traffic is actual serialized link KiB through the final application deadline per on-time recipient delivery, pooling traffic from failed runs too. It includes observations, protocol messages, payloads, retransmissions, and acknowledgements. Undefined denominators and unassessed exposure remain explicit in the report exports.

    Peak buffer is the largest engine-owned payload and partial-reassembly footprint on any node. Drain is the maximum observed time to clear retained payload queues after workload admission stops, in rounds. Expiry can clear a queue without delivering its messages. Host mailboxes, capture queues, control state, carrier queues, and allocator overhead are excluded, so zero retention does not mean zero total memory.

[^method]: [Experimental methodology](https://github.com/hxrts/jacquard/blob/main/docs/307_experimental_methodology.md) and [simulator architecture](https://github.com/hxrts/jacquard/blob/main/docs/306_simulator_architecture.md). Two senders offer 128-byte messages every eight rounds under nominal load, with 32-round application deadlines. All engines share the application contract, finite host queues, provisioned capabilities, and independent directed carriers. Routing engines consume observations without access to the scorer's global topology.

    Constrained phases quarter the base link budget and set every third relay's new-custody allowance to zero. Peers and services are provisioned in advance. Local contact detection is supplied by the host, and custody state is volatile.

[^contract]: [Evaluation contract](https://github.com/hxrts/jacquard/blob/main/docs/308_adaptive_delivery_evaluation.md) and [report exporter](https://github.com/hxrts/jacquard/blob/main/analysis/adaptation_document.py). Baseline selection uses 128 development runs, followed by a frozen comparison on seeds 9001 through 9064. The primary interval resamples 64 paired seed clusters across six nominal cells. Phase, resource-grid, and workload contrasts are exploratory and do not establish simultaneous superiority across all conditions.

    The 8.3-point deficit occurs with eight nodes, a 256-byte base link budget, 16 KiB payload ceilings, and an eight-round observation-delay base.

    The nominal contract includes stable and changing-phase success targets, positive paired improvement, stable noninferiority, a stable attempted-traffic cost ceiling, baseline-relative recovery, and zero duplicate deliveries or storage-ceiling violations. Its recovery test requires the first deadline-wide creation cohort after each recovery to reach at least the initial connected-phase success rate minus five percentage points, with its deadlines resolved within two deadlines of recovery starting. That criterion remains separate from the table's common 90% recovery target. Failed or unassessed gates remain failures of the complete contract.

[^mercator]: [Mercator implementation specification](https://github.com/hxrts/jacquard/blob/main/docs/406_mercator_routing.md). Engine-owned discovery, bounded exploration, custody return, acknowledgement clocks, and broker-pressure accounting are evaluated together. Recent recipient acknowledgements discourage speculative movement away from that contact and outrank older remote-link evidence until their validity expires. These preferences were developed on excluded seeds before the frozen comparison, which assumes aligned logical clocks for expiry across nodes.

[^delivery]: The same six nominal cells include connected-only and fixed-peer-route Mercator ablations with the adaptive mode's two-round retry interval and 64-round lifetime. The fixed-peer-route mode, named `FixedPath` in code, [selects an initial peer sequence](https://github.com/hxrts/jacquard/blob/main/crates/mercator/src/delivery/planning.rs) and retains it and permits waiting, while omitting adaptive exploration, custody returns, and replacement after an unresponsive next hop. The selected fixed baseline in the plot uses a two-round retry interval and a 32-round lifetime, chosen on development runs. [Delivery evaluation contract](https://github.com/hxrts/jacquard/blob/main/docs/308_adaptive_delivery_evaluation.md).

[^boundary]: [Saved recovery fixtures](https://github.com/hxrts/jacquard/blob/main/analysis/fixtures/adaptive_delivery_failures.json) and [evaluation contract](https://github.com/hxrts/jacquard/blob/main/docs/308_adaptive_delivery_evaluation.md). A replay of two-cluster seed 5055 with the frozen executable exactly reproduces the development ledger. A message created at round 584 has deadline 616 and arrives at 617. This known failure remains excluded from the independent seed sample and bounds any claim of uniform recovery.

[^library]: [Client assembly guide](https://github.com/hxrts/jacquard/blob/main/docs/503_client_assembly.md), [reference client](https://github.com/hxrts/jacquard/blob/main/docs/407_reference_client.md), and [running experiments](https://github.com/hxrts/jacquard/blob/main/docs/502_running_experiments.md). Hosts supply transport and time through explicit interfaces, keeping current time separate from evidence freshness. Application deadlines are evaluation criteria, while message lifetime separately bounds retained work.
