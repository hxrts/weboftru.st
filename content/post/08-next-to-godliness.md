+++
title = "Cleanliness is Next to Godliness"
date = 2026-10-20
description = "How neural networks build coherent structure."
slug = "next-to-godliness"

[extra]
cover_image = "/images/byte-neuron.png"
cover_caption = "Byte Magazine, August 1979"
+++

## Developmental flow

What a neural network learns changes what it can learn next. But what causes a model to develop coherent computational structure in the first place?

In *Neural Networks Are Already Clean*, Nick Cammarata calls networks clean when their mechanisms form useful groupings for downstream readers.[^cammarata] He follows a neuron in a retrained InceptionV1 model whose strongest responses initially come from yellow-flower images, including some with dogs. Green objects and dogs without flowers appear later, followed by broccoli. However, the described sequence leaves the causal links between extensions unresolved.

{% tikz(learning=true, fig_w="620px", caption="<strong>A developmental history.</strong> Cammarata’s observed response categories emerge within one neuron. Arrows suggest developmental links between them, and dotted ovals group responses at successive stages.") %}
\begin{tikzpicture}[learning]
\stageheading{0}{EARLY}{}
\stageheading{4.5}{INTERMEDIATE}{}
\stageheading{9}{LATE}{}
\foreach \x in {0,4.5,9} { \stageoval{\x,0} }
\stacknode[feature]{a}{0}{0}{1}{1}
\stacknode[feature]{b}{4.5}{0}{2}{1}
\stacknode[feature]{c}{4.5}{0}{2}{2}
\stacknode[feature]{d}{9}{0}{3}{1}
\stacknode[feature]{e}{9}{0}{3}{2}
\stacknode[feature]{f}{9}{0}{3}{3}
\leftlabel{0}{Yellow flowers,\\sometimes dogs}
\abovenodelabel{b}{Green objects}
\abovenodelabel{c}{Dogs, no flowers}
\rightstacklabel{0}{3}{1}{Green}
\rightstacklabel{0}{3}{2}{Broccoli}
\rightstacklabel{0}{3}{3}{Dogs}
\begin{pgfonlayer}{background}
\draw[schematic] (a.center) .. controls ($(a.center)+(1.62,0)$) and ($(b.center)+(-1.35,0)$) .. (b.west);
\draw[schematic] (a.center) .. controls ($(a.center)+(1.62,0)$) and ($(c.center)+(-1.35,0)$) .. (c.west);
\draw[schematic] (b.center) .. controls ($(b.center)+(1.62,0)$) and ($(d.center)+(-1.35,0)$) .. (d.west);
\draw[schematic] (b.center) .. controls ($(b.center)+(1.62,0)$) and ($(e.center)+(-1.35,0)$) .. (e.west);
\draw[schematic] (c.center) .. controls ($(c.center)+(1.62,0)$) and ($(f.center)+(-1.35,0)$) .. (f.west);
\end{pgfonlayer}
\developmentaxis{-2.55}
\responselegend{-4}
\diagramframe{-4.55}
\end{tikzpicture}
{% end %}

Conventional generalization concerns responses beyond training examples, while Cammarata's recursive generalization describes acquired responses becoming starting points for further learning. Here, path formation describes changes to circuitry that redirect later learning signals. A shared signal can spare downstream detectors from learning the same distinction independently, giving an established pathway a potential advantage over a new one.

## One path leads to another

Cammarata presents a circuit-ecology hypothesis, where established pathways benefit from a head start over their competitors. Gradients from different examples reinforce shared circuitry when they favor compatible parameter updates. As that circuitry reduces prediction error, competing pathways have less remaining error to correct.[^cammarata] The proposed advantage can be explained with learning pressure, the force that training signals exert to change circuitry.

In the hypothetical pathway below, a flower-responsive neuron also responds weakly to vegetation. Green-object examples could produce compatible gradients that strengthen this response into a green signal for a later broccoli detector. This intermediate acquisition may make broccoli responsiveness easier to learn than it was from the original flower response. The detector's dependence on the green signal gives the earlier mechanism a new computational role.

{% tikz(learning=true, fig_w="620px", caption="<strong>Earlier learning enables an extension.</strong> In this hypothetical case, an established green signal makes broccoli detection easier to learn than constructing the signal independently. Arrows trace contributions carried forward through training, and grey band width indicates gradient support.") %}
\begin{tikzpicture}[learning]
\stageheading{0}{PAST}{inherited mechanisms}
\stageheading{4.5}{PRESENT}{available mechanisms}
\stageheading{9}{FUTURE}{outcomes and alternatives}
\foreach \x in {0,4.5,9} { \stageoval{\x,0} }
\stacknode[feature,activation=7.4]{a}{0}{0}{2}{1}
\stacknode[potential,activation=7.4]{b}{0}{0}{2}{2}
\stacknode[feature,activation=7.4]{d}{4.5}{0}{2}{1}
\stacknode[potential,activation=7.4]{e}{4.5}{0}{2}{2}
\stacknode[feature,activation=7.4]{f}{9}{0}{4}{1}
\stacknode[feature,activation=7.4]{g}{9}{0}{4}{2}
\stacknode[feature,activation=7.4]{h}{9}{0}{4}{3}
\stacknode[potential,activation=7.4]{i}{9}{0}{4}{4}
\coordinate (ahead) at ($(a.center)+(0.42,0)$);
\coordinate (r1a) at ($(a.center)+(1.62,0)$);
\coordinate (r1b) at ($(d.center)+(-1.35,0)$);
\draw[flow] (a.center) .. controls (r1a) and (r1b) .. (d.west);
\coordinate (bhead) at ($(b.center)+(0.42,0)$);
\coordinate (r2a) at ($(b.center)+(1.62,0)$);
\coordinate (r2b) at ($(e.center)+(-1.35,0)$);
\draw[flow] (b.center) .. controls (r2a) and (r2b) .. (e.west);
\coordinate (djoin) at ($(d.center)+(1.05,0)$);
\draw[line width=.85pt] (d.center) -- (djoin);
\coordinate (dhead) at ($(d.center)+(0.42,0)$);
\coordinate (r3a) at ($(d.center)+(2.292,0)$);
\coordinate (r3b) at ($(f.center)+(-1.035,0)$);
\draw[flow] (djoin) .. controls (r3a) and (r3b) .. (f.west);
\coordinate (r4a) at ($(d.center)+(2.292,0)$);
\coordinate (r4b) at ($(g.center)+(-1.035,0)$);
\draw[flow] (djoin) .. controls (r4a) and (r4b) .. (g.west);
\coordinate (r5a) at ($(d.center)+(2.292,0)$);
\coordinate (r5b) at ($(h.center)+(-1.035,0)$);
\draw[flow] (djoin) .. controls (r5a) and (r5b) .. (h.west);
\coordinate (ehead) at ($(e.center)+(0.42,0)$);
\coordinate (r6a) at ($(e.center)+(1.62,0)$);
\coordinate (r6b) at ($(i.center)+(-1.35,0)$);
\draw[flow] (e.center) .. controls (r6a) and (r6b) .. (i.west);
\begin{pgfonlayer}{background}
  \pressureband{d.center}{r1b}{r1a}{ahead}{6}
  \pressureband{e.center}{r2b}{r2a}{bhead}{2}
  \pressureband{f.center}{r3b}{r3a}{dhead}{6}
  \pressureband{g.center}{r4b}{r4a}{dhead}{4}
  \pressureband{h.center}{r5b}{r5a}{dhead}{2}
  \pressureband{i.center}{r6b}{r6a}{ehead}{2}
\end{pgfonlayer}
\leftlabel{.4}{Flower / green}
\leftlabel{-.4}{Green}
\belowannotation{2.25}{0}{Established green signal\\versus learning from scratch}
\belowannotation{6.75}{0}{Reuse takes fewer steps\\than the independent route}
\rightstacklabel{0}{4}{1}{Green}
\rightstacklabel{0}{4}{2}{Dogs}
\rightstacklabel{0}{4}{3}{Broccoli}
\rightstacklabel{0}{4}{4}{Broccoli}
\abovenodelabel{d}{Green}
\abovenodelabel{e}{Green}
\preparelearningfooter{2.85}
\developmentaxis{\learningaxisy}
\begin{pgfonlayer}{foreground}
  \node[feature,activation=7.4] at (a.center) {};
  \node[potential,activation=7.4] at (b.center) {};
  \node[feature,activation=7.4] at (d.center) {};
  \node[potential,activation=7.4] at (e.center) {};
  \node[feature,activation=7.4] at (f.center) {};
  \node[feature,activation=7.4] at (g.center) {};
  \node[feature,activation=7.4] at (h.center) {};
  \node[potential,activation=7.4] at (i.center) {};
\end{pgfonlayer}
\node[feature,activation=7.4] at (.3,\learninglegendy) {};
\node[legendlabel] at (.7,\learninglegendy) {Established mechanism};
\pressurekey{5}{\learninglegendy}{1}
\node[legendlabel] at (5.7,\learninglegendy) {Learning pressure (band width)};
\node[potential,activation=7.4] at (.3,\learningpressurelegendy) {};
\node[legendlabel] at (.7,\learningpressurelegendy) {Unrealized alternative};
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}

Routing learning signals and reducing acquisition cost are distinct claims. Lowered resistance means fewer optimization steps or examples for a specified acquisition under comparable training conditions. Strong activation or gradient support alone does not establish lower cost. Other routes may realize the same distinction with different consequences for later learning.

## Two paths can represent the same distinction

Cammarata compares InceptionV1 and ConvNeXt neurons that initially respond to rapeseed fields. Field images remain prominent among the ConvNeXt neuron's strongest responses, while dogs and broccoli increasingly displace them in InceptionV1. Displacement from this set does not establish complete loss of responsiveness. The architectures differ, so the comparison cannot isolate the effect of training history.

Consider a controlled counterfactual in which two networks with the same architecture distinguish the same flower inputs from nonflower inputs. Different learned weights implement that distinction through different pathways, under identical subsequent training conditions. In World A, shared circuitry makes broccoli acquisition cheaper, but modifying it weakens the flower signal used by existing consumers. In World B, a separate route preserves both roles at greater training cost.

{% tikz(learning=true, fig_w="620px", caption="<strong>One distinction, different developmental routes.</strong> In this controlled counterfactual, different learned pathways implement the same initial flower distinction. Broccoli learning weakens flower activation in World A, while a separate route preserves it at greater training cost in World B. Columns mark developmental milestones, and flower-node sizes measure activation on a fixed assay.") %}
\begin{tikzpicture}[learning]
\def\learningheadinglift{.75}
\stageheading{0}{MATCHED CHECKPOINT}{same flower distinction}
\stageheading{4.5}{RESPONSE EXTENSION}{reshaped pathways}
\stageheading{9}{FURTHER LEARNING}{retention and interference}
\foreach \base in {0,-4.6} {
  \foreach \x in {0,4.5,9} { \stageoval{\x,\base} }
}
\node[emphasis,anchor=east] at (-1.8,0) {WORLD A};
\node[emphasis,anchor=east] at (-1.8,-4.6) {WORLD B};
\def\learningpitch{.9}
\stacknode[feature,activation=10]{a}{0}{-4.6}{3}{1}
\stacknode[feature,activation=7.4]{b}{0}{-4.6}{3}{2}
\stacknode[feature,activation=7.4]{c}{0}{-4.6}{3}{3}
\stacknode[feature,activation=10]{g}{0}{0}{3}{1}
\stacknode[feature,activation=7.4]{h}{0}{0}{3}{2}
\stacknode[feature,activation=7.4]{i}{0}{0}{3}{3}
\def\learningpitch{.8}
\stacknode[feature,activation=10]{d}{4.5}{-4.6}{2}{1}
\stacknode[feature,activation=7.4]{e}{4.5}{-4.6}{2}{2}
\stacknode[feature,activation=10]{f}{9}{-4.6}{2}{1}
\stacknode[feature,activation=7.4]{broca}{9}{-4.6}{2}{2}
\stacknode[feature,activation=10]{j}{4.5}{0}{2}{1}
\stacknode[feature,activation=7.4]{k}{4.5}{0}{2}{2}
\stacknode[feature,activation=6.2]{l}{9}{0}{2}{1}
\stacknode[feature,activation=7.4]{brocb}{9}{0}{2}{2}
\begin{pgfonlayer}{background}
\foreach \source/\target in {a/d,b/e,c/e,d/f,e/broca,g/j,g/k,i/k,j/l,j/brocb} {
  \draw[flow] (\source.center) .. controls ($(\source.center)+(1.62,0)$) and ($(\target.center)+(-1.35,0)$) .. (\target.west);
}
\end{pgfonlayer}
\leftrowlabel{-4.6}{.9}{Flower}
\leftrowlabel{0}{.9}{Flower}
\abovenodelabel{d}{Flower}
\abovenodelabel{e}{Green}
\abovenodelabel{j}{Flower}
\abovenodelabel{k}{Green}
\begin{scope}[yshift=-3pt]
\aboveannotation{6.75}{0}{Learning broccoli reduces\\activation on flower inputs}
\end{scope}
\belowannotation{6.75}{-4.6}{Flower activation preserved\\at greater training cost}
\rightstacklabel{0}{2}{1}{Flower}
\rightstacklabel{-4.6}{2}{1}{Flower}
\foreach \base in {0,-4.6} {
  \rightstacklabel{\base}{2}{2}{Broccoli}
}
\preparelearningfooter{2.7}
\developmentaxis{\learningaxisy}
\begin{pgfonlayer}{foreground}
  \node[feature,activation=10] (flowerkey) at (5.3,\learninglegendy) {};
  \foreach \marked in {a,d,f,g,j,l,flowerkey} {
    % Scale both the asterisk span and stroke to the actual node diameter.
    \draw let \p1=($(\marked.east)-(\marked.west)$),
      \n1={.23*veclen(\x1,\y1)},
      \n2={.5*\n1}, \n3={.866*\n1},
      \n4={.085*veclen(\x1,\y1)}
      in [white,line width=\n4,line cap=round]
      ($(\marked.center)+(-\n1,0)$) -- ($(\marked.center)+(\n1,0)$)
      ($(\marked.center)+(-\n2,-\n3)$) -- ($(\marked.center)+(\n2,\n3)$)
      ($(\marked.center)+(-\n2,\n3)$) -- ($(\marked.center)+(\n2,-\n3)$);
  }
\end{pgfonlayer}
\activationlegend{\learninglegendy}{6.2}
\node[legendlabel] at (5.7,\learninglegendy) {Flower response};
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}

The present flower distinction leaves its developmental route unresolved. A single pathway's history also leaves open how learning redistributes computational roles across the network. How much change comes from mechanisms gaining new uses, and how much comes from changes in what they detect?

## Learning pressure changes roles and responses

Dog responsiveness can become more prevalent because responsive mechanisms gain downstream uses, because inherited mechanisms acquire the response, or both. Price's equation separates these contributions under a declared rule attributing later uses to earlier mechanisms.[^price] For a baseline population of flower-related mechanisms, $z$ measures responsiveness to dogs without flowers on a fixed assay, and $w$ measures attributed downstream use.[^price-accounting] With $\bar w$ the mean weight and $\Delta z$ the response change averaged over each mechanism's attributed later uses, the population mean changes by[^price-weights]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{transmission}}.
```

Selection measures the shift due to differential descendant weighting, while transmission measures inherited trait change, including variation acquired through training. In the illustration, greater attributed use of dog-responsive mechanisms raises the mean from ½ to ¾, and acquired responsiveness in another use brings it to 1. Each term contributes ¼, though opposing contributions could conceal substantial change behind a stable mean. Following each neuron one-to-one gives equal weights, so selection is zero even during substantial learning.

{% tikz(learning=true, fig_w="620px", caption="<strong>Contribution and trait change.</strong> Differential contribution and acquired dog responsiveness each add ¼ to the population mean. Arrows attribute later uses to earlier mechanisms, while the middle inset isolates reweighting. Rings mark dog responsiveness, coded as 1 when present and 0 otherwise. Grey bands depict hypothetical reinforcing learning pressure.") %}
\begin{tikzpicture}[learning]
% Slightly smaller markers for the accounting inset and its trait legend.
\tikzset{feature/.append style={minimum size=4.2pt},trait/.append style={minimum size=9pt}}
\stageheading{0}{BASELINE}{50\% dog-responsive}
\stageheading{4.5}{AFTER REWEIGHTING}{75\% dog-responsive}
\stageheading{9}{FINAL POPULATION}{100\% dog-responsive}
\foreach \x in {0,9} { \stageoval{\x,0} }
\def\learningpitch{.9}
\stacknode[feature]{a}{0}{0}{2}{1}
\stacknode[feature]{b}{0}{0}{2}{2}
\def\learningpitch{.8}
\stacknode[feature]{g}{9}{0}{4}{1}
\stacknode[feature]{h}{9}{0}{4}{2}
\stacknode[feature]{i}{9}{0}{4}{3}
\stacknode[feature]{j}{9}{0}{4}{4}
% The open inset samples the midpoint of each continuous developmental path.
\node[feature] (c) at ($(a.center)!.5!(g.center)$) {};
\node[feature] (d) at ($(a.center)!.5!(h.center)$) {};
\node[feature] (e) at ($(a.center)!.5!(i.center)$) {};
\node[feature] (f) at ($(b.center)!.5!(j.center)$) {};
\begin{pgfonlayer}{background}
% Bands span the whole training interval; the middle markers are accounting only.
\foreach \source/\target in {a/g,a/h,a/i,b/j} {
  \coordinate (pressurestart) at ($(\source.center)+(.42,0)$);
  \coordinate (pressureone) at ($(\source.center)+(3,0)$);
  \coordinate (pressuretwo) at ($(\target.center)+(-3,0)$);
  \pressureband{\target.center}{pressuretwo}{pressureone}{pressurestart}{4}
}
\foreach \source/\target in {a/g,a/h,a/i,b/j} {
  \draw[flow,shorten >=4.9pt] (\source.center)
    .. controls ($(\source.center)+(3,0)$) and ($(\target.center)+(-3,0)$)
    .. (\target.center);
}
\end{pgfonlayer}
\foreach \name in {a,c,d,e,g,h,i,j} { \dogtrait{\name} }


\belowannotation{2.25}{0}{Selection +\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}\\Dog-responsive mechanisms\\contribute more}
\belowannotation{6.75}{0}{Transmission +\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}\\Inherited use acquires\\dog-responsiveness}
\preparelearningfooter{2.65}
% A broken development axis opens into the accounting inset, not a third state.
\draw[line width=.85pt,line cap=round] (0,\learningaxisy) -- (4.45,\learningaxisy);
\draw[flow,line cap=round] (4.55,\learningaxisy) -- (9,\learningaxisy);
\draw[line width=.85pt,line cap=round] (4.375,{\learningaxisy-.15}) -- (4.525,{\learningaxisy+.15});
\draw[line width=.85pt,line cap=round] (4.475,{\learningaxisy-.15}) -- (4.625,{\learningaxisy+.15});
\node[anchor=north] at (4.5,{\learningaxisy-.25}) {Development};
\node[feature] (keyyes) at (.3,\learninglegendy) {};
\dogtrait{keyyes}
\node[legendlabel] at (.7,\learninglegendy) {Responds to dogs};
\pressurekey{5}{\learninglegendy}{1}
\node[legendlabel] at (5.7,\learninglegendy) {Learning pressure (reinforcing)};
\node[feature] at (.3,\learningpressurelegendy) {};
\node[legendlabel] at (.7,\learningpressurelegendy) {No dog response};
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}

The grey bands illustrate training pressure that could change attributed use or inherited responses. Different gradient processes can produce identical Price terms, even in networks with different opportunities for subsequent learning. Tracing the contributing pathways can identify which signals later circuits use and how training changed those signals.

## How learning builds understandable structure

In the proposed flower history, existing green and texture signals make a broccoli detector cheaper to learn. Several detectors may come to use the same green signal, giving the contributing mechanism additional computational roles. Gradients from consumers with compatible learning objectives can reinforce the shared distinction. Conflicting demands may weaken the flower signal or favor separate pathways.

Price accounting separates changes in attributed use from changes in inherited responses. Tracing the green and texture inputs across training checkpoints shows how the broccoli detector comes to use those signals. A pathway may help during acquisition and later become unnecessary, so its absence from the finished circuit does not rule out a developmental role. Interventions during training can test whether the pathway helped the detector develop.

{% tikz(learning=true, fig_w="620px", caption="<strong>Mechanisms organized for downstream use.</strong> In this hypothetical history, a green signal becomes a retained input to two consumers, with texture also contributing to broccoli detection. Compatible consumer demands reinforce the shared signal, while shared updates weaken flower activation. Node size tracks flower activation on a fixed assay.") %}
\begin{tikzpicture}[learning]
\def\learningheadinglift{.75}
\stageheading{0}{PAST}{inherited mechanisms}
\stageheading{4.5}{PRESENT}{shared signals}
\stageheading{9}{FUTURE}{downstream use}
\foreach \x in {0,4.5,9} { \stageoval{\x,0} }
\stacknode[feature,activation=10]{a}{0}{0}{2}{1}
\stacknode[feature,activation=7.4]{b}{0}{0}{2}{2}
\def\learningpitch{1.0}
\stacknode[feature,activation=7.4]{green}{4.5}{0}{3}{1}
\stacknode[feature,activation=7.4]{texture}{4.5}{0}{3}{2}
\stacknode[feature,activation=10]{flower}{4.5}{0}{3}{3}
\stacknode[feature,activation=7.4]{consumer}{9}{0}{3}{1}
\stacknode[feature,activation=7.4]{broccoli}{9}{0}{3}{2}
\stacknode[feature,activation=4.6]{laterflower}{9}{0}{3}{3}
\coordinate (ahead) at ($(a.center)+(.42,0)$);
\coordinate (bhead) at ($(b.center)+(.42,0)$);
\coordinate (greenhead) at ($(green.center)+(.42,0)$);
\coordinate (texturehead) at ($(texture.center)+(.42,0)$);
\coordinate (flowerhead) at ($(flower.center)+(.42,0)$);
\coordinate (ag) at ($(a.center)+(1.62,0)$);
\coordinate (ga) at ($(green.center)+(-1.35,0)$);
\coordinate (bt) at ($(b.center)+(1.62,0)$);
\coordinate (tb) at ($(texture.center)+(-1.35,0)$);
\coordinate (fa) at ($(flower.center)+(-1.35,0)$);
\coordinate (greenjoin) at ($(green.center)+(1.05,0)$);
\coordinate (gb) at ($(green.center)+(2.292,0)$);
\coordinate (tg) at ($(texture.center)+(1.62,0)$);
\coordinate (gc) at ($(consumer.center)+(-1.35,0)$);
\coordinate (bg) at ($(broccoli.center)+(-1.35,0)$);
\coordinate (fl) at ($(flower.center)+(1.62,0)$);
\coordinate (lf) at ($(laterflower.center)+(-1.35,0)$);
\begin{pgfonlayer}{background}
  \pressureband{green.center}{ga}{ag}{ahead}{4}
  \pressureband{texture.center}{tb}{bt}{bhead}{4}
  \pressureband{flower.center}{fa}{ag}{ahead}{4}
  \pressureband{consumer.center}{gc}{gb}{greenhead}{4}
  \pressureband{broccoli.center}{bg}{gb}{greenhead}{4}
  \pressureband{broccoli.center}{bg}{tg}{texturehead}{4}
  \suppressband{laterflower.center}{lf}{fl}{flowerhead}{4}
  \draw[flow] (a.center) .. controls (ag) and (ga) .. (green.west);
  \draw[flow] (a.center) .. controls (ag) and (fa) .. (flower.west);
  \draw[flow] (b.center) .. controls (bt) and (tb) .. (texture.west);
  \draw[line width=.85pt] (green.center) -- (greenjoin);
  \draw[flow] (greenjoin) .. controls (gb) and (gc) .. (consumer.west);
  \draw[flow] (greenjoin) .. controls (gb) and (bg) .. (broccoli.west);
  \draw[flow] (texture.center) .. controls (tg) and (bg) .. (broccoli.west);
  \draw[flow] (flower.center) .. controls (fl) and (lf) .. (laterflower.west);
\end{pgfonlayer}
\leftlabel{.4}{Flower}
\leftlabel{-.4}{Texture cues}
\abovenodelabel{green}{Green patterns}
\abovenodelabel{texture}{Clustered texture}
\abovenodelabel{flower}{Flower}
\rightstacklabel{0}{3}{1}{Green-object\\detector}
\rightstacklabel{0}{3}{2}{Broccoli\\detector}
\rightstacklabel{0}{3}{3}{Flower}
\begin{scope}[yshift=-3pt]
\aboveannotation{6.75}{0}{Both retain the\\green signal as input}
\end{scope}
\belowannotation{2.25}{0}{Compatible demands reinforce\\the shared signal}
\belowannotation{6.75}{0}{Shared updates weaken\\the earlier flower signal}
\preparelearningfooter{2.75}
\developmentaxis{\learningaxisy}
\activationlegend{\learninglegendy}{4.6}
\trainingeffectlegend{\learninglegendy}
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}

On this account, training favors established distinctions when they reduce the cost of acquiring new computations. Cammarata's recursive generalization can then be understood as a trace of how mechanisms become organized for downstream use. Learning builds the machinery of its own future learning.

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.

[^price-accounting]: Take equally weighted baseline flower-related mechanisms with fixed assay responses $z_i$, fixing the downstream tasks and ancestry rule before calculating the decomposition. Ancestry records how earlier mechanisms contribute to later computations.

[^price-weights]: Assign each included later use one unit of credit, divided among its registered ancestors, and exclude unassigned uses from this population. Let $w_i\geq0$ be an ancestor's total credit and $\Delta z_i$ its credit-weighted descendant mean response minus $z_i$, set to zero when $w_i=0$. Expectations and covariance use the baseline population, $\bar w=\mathbb E[w]>0$, and $\Delta\bar z$ is the later attributed-use mean minus the baseline mean.[^price1972][^frank1997]
