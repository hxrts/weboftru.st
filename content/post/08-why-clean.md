+++
title = "Why are Neural Networks Clean?"
date = 2026-10-18
description = "On recursive generalization, heritable circuits, and the structure that makes future learning possible."
slug = "why-clean"
draft = true
+++

*On recursive generalization, heritable circuits, and the structure that makes future learning possible.*

Nick Cammarata’s [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/) argues that neural representations may be more coherent than they appear. New capabilities often develop by extending existing circuits rather than constructing entirely separate ones. Neural circuits have developmental histories. Established mechanisms attract learning signals and become foundations for further learning.

This raises a more fundamental question. **What makes a representation valuable beyond the function it performs today?** A mathematical perspective suggests that a representation’s importance lies partly in what it currently computes. More deeply, it lies in what its existence makes possible to learn next, tying neural learning to heredity, selection, and the geometry of future possibilities.

## A feature is a distinction, not a noun

A neuron is better understood by the distinction it makes available than by the category it names. What can downstream mechanisms do differently because it exists? Suppose a network compresses internal states into a representation. That representation is sufficient for a downstream computation precisely when everything the computation needs can be recovered from it.

Mathematically, if the representation is $q$ and the downstream computation is $f$, sufficiency means that there exists some $\bar f$ such that

$$
f=\bar f\circ q.
$$

This is called *quotient descent*. Two internal states can look identical through $q$ and still require different treatment downstream. A representation that fails to distinguish them has erased something important. The key is that sufficiency is **relative to what consumes the representation**.

A neuron responding to both cats and cars may look polysemantic against human labels, yet be perfectly coherent if its downstream consumers care about pointed shapes.

Instead of a uniquely correct dictionary of concepts, we can ask which distinctions a network preserves, which computations consume them, and which transformations respect them. But should we consider only today's computations, or also those that might emerge through future learning?

## Two networks can do the same thing and learn differently

Consider a tiny two-layer linear network:

$$
f_{a,b}(x)=abx.
$$

Its function depends only on the product $ab$, so the weights $(1,1)$ and $(2,\frac12)$ implement identical input-output behavior. Yet gradient descent generally updates these parameterizations differently. The change in output depends on $ab$ and on $a^2+b^2$, the sensitivity to parameter changes.

For this model under squared-error gradient descent, the two quantities

$$
u=ab,\qquad s=a^2+b^2
$$

form an exact closed dynamical system. Together they predict subsequent learning under the declared family of training objectives. The current output $u$ alone is not.

**Two representations can be functionally equivalent while being inequivalent under learning.** The geometry of current behavior is not necessarily the geometry of future learning. A representation may discard distinctions irrelevant to every current output, only for them to matter when the network meets new training. A complete theory must distinguish sufficiency for what a network currently computes from sufficiency for how it can subsequently change.

## Retained circuits can change the space of possibilities

Cammarata’s recursive generalization suggests networks frequently extend existing circuits rather than construct unrelated alternatives. There are two fundamentally different ways this could help learning.

The first is straightforward, since an existing circuit already receives useful gradients and has established readers. The second is deeper, because **the presence of an existing circuit changes which new solutions can be constructed at all.**

Suppose learning capability C requires two components, A and B, neither sufficient alone. Retaining A enables the construction of B, which opens the path to C. A gains value from the future it makes accessible, not from its present function.

Formally, starting from an inventory of retained structures, iterated construction rules yield an *accessible closure* that contains everything constructible from that inventory. Different inventories can compute identical outputs while having different closures. **Learning can change not only a model’s position within a fixed space of possibilities, but the space of possibilities available to its future learning process.**

Retained representations act as scaffolds, prerequisites, and reusable constructors, with value that appears only in later generations of learning.

## The Price equation: selection, inheritance, and novelty

The Price equation, George Price’s 1970 covariance identity, decomposes the change in a population’s mean trait into selection and transmission:

```math
\Delta\bar z = \underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}} + \underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{transmission}}.
```

Here $w$ is descendant weighting, $z$ a trait, and $\Delta z$ the change between parents and descendants. For neural learning this distinguishes circuits gaining influence, inherited circuits changing function, and new structures entering the population.

Selection and transmission act in sequence.

{% tikz(fig_w="520px") %}
\usetikzlibrary{arrows.meta,decorations.markings}
\begin{tikzpicture}[
    x=1cm, y=1cm,
    >={Stealth[length=4pt,width=3pt]},
    every node/.style={font=\rmfamily\footnotesize},
  ]
  \node[draw, minimum width=1.2cm, minimum height=0.7cm] (p) at (0,0) {parents $\bar z$};
  \node[draw, minimum width=1.2cm, minimum height=0.7cm] (s) at (2.5,0) {selected};
  \node[draw, minimum width=1.2cm, minimum height=0.7cm] (o) at (5.0,0) {descendant $\bar z+\Delta\bar z$};
  \draw[->] (p.east) -- node[above] {selection} (s.west);
  \draw[->] (s.east) -- node[above] {transmission} (o.west);
\end{tikzpicture}
{% end %}

Crucially, the Price equation prescribes no winner and no learning algorithm. It is an accounting identity, and that is what makes it useful. It tells us which distinctions must be retained to explain a given population change.

The trait need not be present-day accuracy. It might measure whether a mechanism supports a future computation or how much work adaptation requires. These are distinct traits with no common fitness score.

**A representation sufficient for the population’s current average behavior need not be sufficient to preserve the population’s selection and transmission dynamics.**

## Selection can be invisible today and decisive tomorrow

Consider two observable classes, A and B. A secretly mixes mechanisms of selection weight 1 and 3 while B keeps weight 2. Both occupy half the population with mean weight 2, and after one round the observable proportions are unchanged. Yet within A the weight-3 mechanisms have grown, raising its mean to 2½, so in the next generation A grows to 5/9.

**Selection was invisible at the level of current observations, yet it changed the future observable dynamics.** This illustrates why present behavioral equivalence does not imply equivalence under future learning.

A representation can erase distinctions with no immediate observable consequence that still shape a response to later pressure. The question is can we characterize the erased information?

## The hidden geometry of selection

In continuous-time population selection, the rate of change of a trait’s mean is its covariance with the selection field. This is Fisher’s fundamental theorem in continuous-time form, generalized by Price to arbitrary traits:

$$
\frac{d}{dt}\mathbb E[z] =
\operatorname{Cov}(f,z).
$$

When the population is compressed into observable classes, the selection field splits into a component visible at the class level and one varying within classes. Under the Fisher–Rao geometry these components are orthogonal, so the squared magnitude of the hidden component is exactly

$$
\mathbb E[\operatorname{Var}(f\mid q)].
$$

This is the average selection variance concealed within the representation’s equivalence classes. Hidden variation may not affect present motion, yet it determines how motion changes. Under fixed exponential selection, conditional fitness variance sets the rate at which a class’s effective fitness changes.

The hidden distinctions can therefore appear as the *curvature* of the population’s future response, and the decomposition is compositional. The variance lost by a coarse representation is the sum of what was lost at each stage.

Hidden variance is not automatically useful. But it is real dynamical structure that a present-day behavioral description fails to capture, and a circuit’s internal variation may be invisible to current consumers yet consequential for how later circuits form.

## Robustness belongs to populations, not isolated features

Evolutionary theory also reveals a gap between maximizing individual mechanisms and preserving a system’s ability to adapt. Suppose a future capability requires both mechanisms A and B.

If descendants are independently sampled with equal probabilities of A and B, the chance of retaining both is one half. A transmission process that always retains one of each preserves the capability with certainty. Both processes keep identical individual proportions but differ completely in collective robustness. Their difference lies in **joint inheritance structure**, not in average fitness.

This matters when representations are complementary, since selecting each mechanism independently by current usefulness can destroy combinations that matter later. In a finite population undergoing independent replacement, every generation carries a nonzero probability of losing a required complementary type. Even adaptive selection cannot guarantee its preservation. Protecting a retained copy or preserving a bundle alters that result.

The relevant object of learning may not be an individual feature or a distribution of feature strengths. It may be an organized population of complementary capabilities whose collective structure determines what remains possible.

## Does preserving future learning require remembering everything?

If a representation must preserve all possible future responses to selection and transmission, must it retain every detail of the underlying population? Under finite, explicitly specified models, the answer is surprisingly often no.

For a finite hereditary type space with declared selection and transmission laws and protected observable traits, one can construct the coarsest representation preserving the separate Price terms under every permitted continuation. Infinitely many action sequences are possible, yet the equivalence conditions reduce to a finite-dimensional algebraic construction.

A related result applies under continuously varying selection pressure. The first derivative gives the immediate Price response, and higher derivatives give its change under further pressure. Under the relevant finite-type assumptions, the entire hierarchy admits a finite defining signature.

**Preserving all future selection responses does not necessarily mean remembering the complete past. It means retaining the distinctions that future selection and transmission can reveal.** This is not a claim that arbitrary networks admit small, finite implementations.

Rather, it establishes future-learning sufficiency as a mathematically well-defined goal with exact solutions in restricted settings. It also reads coherent features as stable compressions of distinctions that remain equivalent under a particular family of future transformations.

## Clean circuits may be distinctions that survived

None of this proves that real networks always organize into clean, human-legible circuits, or that gradient descent prefers reusable features. Cammarata’s observations are empirical, and the connection to actual architectures remains open, yet together they suggest a different way to understand the organization interpretability research uncovers.

A clean circuit is a distinction, not a noun. It matters because what consumes it can do something different, and sufficiency is relative to its consumers. Evolution gives this claim its fullest reading, expanding the consumer set to future learning itself. A feature survives when later generations keep depending on the distinctions it makes.

This is what the Price equation tracks when the trait is a distinction. Selection retains some distinctions while dissolving others, and the hidden variance a representation erases is exactly what future selection could still reveal. Robustness then belongs to distinctions in bundles, to the joint inheritance structure that keeps complementary distinctions available for later construction. And we need not remember everything, because a finite defining signature preserves the distinctions that future selection can expose.

**The deepest object of learning may not be any particular representation, but the structured capacity a network builds to continue learning.** A circuit may be useful today, and more valuable because other circuits grow from it. It is the visible trace of distinctions that kept paying off. The possibility opened by *Neural Networks Are Already Clean* is that representations look organized because existing structure organizes the creation of new structure, and that the nouns we find were distinctions all along.
