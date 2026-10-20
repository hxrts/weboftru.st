+++
title = "Why Are Neural Networks Clean?"
date = 2026-10-20
description = "On selection, inheritance, and the evolutionary organization of neural circuits."
slug = "why-clean"
draft = true
+++

*On selection, inheritance, and the evolutionary organization of neural circuits.*

## The organization of learning

A neural network is a history of learning made operational. Every gradient update acts on circuitry shaped by earlier training. Its organization therefore invites a developmental explanation. Why do some mechanisms become foundations for later computations, while others remain isolated solutions?

In *Neural Networks Are Already Clean*, Nick Cammarata presents an atlas of surprisingly organized neural mechanisms.[^cammarata] His vision models contain related computations for animal faces, fur, dog faces, and particular breeds. In larger models, neurons associated with pale, wavy, and head-side ears feed a more specialized hanging-ear neuron. This branching organization gives us a concrete aspect of neural “cleanliness” to explain.

Ordinary training objectives reward predictive performance. Reusable dog-ear machinery receives credit through its contribution to that performance, yet it can become a foundation for further specialization. An evolutionary perspective suggests a mechanism for this developmental advantage. Learning modifies inherited circuitry, and the resulting structure shapes opportunities for subsequent learning.

## Learning changes the machinery that learns

Evolutionary theory distinguishes the generation of variation from the selection of variants for continuation. In neural training, the loss function and data distribution determine which errors matter. Gradients and optimizers translate these errors into parameter updates, while architecture and existing weights shape the available directions of change. Satrajit Chatterjee's coherent-gradients hypothesis proposes that aligned gradients reinforce changes benefiting several examples at once.[^coherent]

Consider an ear detector useful for distinguishing several dog breeds. When examples from those breeds support similar parameter changes, their gradients reinforce one another across training updates. A detector specific to one breed may receive useful reinforcement less often, giving the shared mechanism an advantage. This advantage depends on gradient alignment, since signals from different examples can also conflict or cancel.

A reliable detector can offer downstream computations an easier route to reducing error than developing ear sensitivity independently. New consumers create further routes for learning signals to reach the detector, potentially reinforcing its shared role. As this pathway reduces relevant errors, the gradients supporting redundant alternatives may weaken. **Reuse can become self-reinforcing**, with early discoveries shaping competition among later learning pathways.

## What previous learning makes possible

Now imagine training introduces finer breed distinctions into a network with an established ear detector. A new classifier might learn to read that signal by adjusting a few downstream connections, while an independent detector could require coordinated changes across several layers. The existing pathway already supplies sensitivity to relevant visual structure, allowing subsequent updates to concentrate on its use in a new decision. This offers a plausible optimization advantage for reuse, conditional on the signal being suitable and accessible to the new classifier.

The dog-ear family in Cammarata's larger ConvNeXt models illustrates such computational dependencies.[^cammarata] A specialized hanging-ear response draws on more general mechanisms. These connections motivate a developmental hypothesis, while establishing its history requires observations across training checkpoints. Comparing models at different scales reveals organization without tracing that history directly.

Imagine two equally accurate breed classifiers, one with shared ear-processing circuitry and the other with separate mechanisms for each breed. Under matched training conditions, the shared network might learn a new breed faster by extending its detector. This counterfactual prediction depends on shared visual structure between old and new breeds. **Equal present accuracy can conceal different capacities for future learning**, because inherited organization changes the work needed to reach a new solution.

## The Price equation: selection and transmission

George Price introduced an identity separating change through differential weighting from change during transmission.[^price] Here, $z$ is an ancestor's measured trait and $w$ its descendant weight. The change $\Delta z$ is its descendants' mean trait minus its own. The two terms distinguish selection from changes within lineages, including refinement and recombination.[^price1972][^frank1997]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{transmission}}.
```

Suppose we identify circuits consistently across training checkpoints and measure $z$ as the breadth of downstream computations supported by their outputs. Circuit ancestry is a proposed measurement framework, and consuming an earlier circuit's output alone does not establish descent. An explicit correspondence across checkpoints must account for every descendant, including circuits formed through splitting or combination. Let $w$ count descendant units attributed to each ancestor, allowing fractional attribution for shared ancestry, and let $\bar z$ denote mean breadth across units.

An increase in mean reuse can arise because already broad ear circuits leave more descendants, or because descendants acquire a broader range of consumers than their ancestors. The first history produces positive selection through greater representation of reusable circuitry, while the second produces positive transmission through changes within lineages. Distinguishing them requires tracking both the relative continuation of broad and narrow circuits and the changing breadth of their descendants. Specialization can contribute negatively through transmission, and one equally weighted descendant per circuit makes the selection term vanish.

## Branching, reuse, and interference

In the proposed mechanism, reinforcing gradients establish shared ear-sensitive circuitry for later breed decisions to recruit. New consumers supply learning signals and opportunities for further specialization. Under an explicit lineage model, preferential continuation could preserve broadly useful mechanisms, while changes within their descendants extend their range of uses. The Price equation distinguishes these developmental histories, while the gradient hypothesis proposes how training might favor them.

Two breed classifiers may benefit from incompatible changes to a shared ear detector, creating interference through their common dependency. Branching could accommodate those demands by preserving broadly useful distinctions in the detector and absorbing breed-specific adjustments into separate downstream pathways. This division would give branching a second advantage: new computations could reuse an established signal while specializing its interpretation for different decisions. The outcome remains conditional, since interference can also produce forgetting or duplication instead of compatible extensions.

Under this hypothesis, circuits with stronger aligned gradient support should acquire new consumers more often under comparable conditions. Perturbing an established detector should sometimes alter later breed specialization, even after restoring present accuracy. Checkpoint studies and controlled interventions could distinguish this mechanism from alternatives involving architecture or data structure. The possibility worth investigating is that **learning builds the machinery of its own future learning**, with each solution changing the conditions for the next.

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^coherent]: Chatterjee, S. (2020). [*Coherent Gradients: An Approach to Understanding Generalization in Gradient Descent-based Optimization*](https://arxiv.org/abs/2002.10657).

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.
