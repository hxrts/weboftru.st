+++
title = "Why Are Neural Networks Clean?"
date = 2026-10-20
description = "How inherited neural processes shape subsequent learning."
slug = "why-clean"

[extra]
cover_image = "/images/byte-neuron.png"
cover_caption = "Byte Magazine, August 1979"
+++

## Learning forms pathways

What a neural network learns can change what it learns next. Each acquisition modifies circuitry that later training can build on, making certain features easier or harder to acquire.

In *Neural Networks Are Already Clean*, Nick Cammarata tracks one such developmental history in a retrained InceptionV1 model.[^cammarata] A neuron initially responds most strongly to yellow-flower images that may or may not contain dogs. As training continues, the neuron responds strongly to green objects, dogs pictured without flowers, and eventually broccoli.

Cammarata calls this "recursive generalization." As a neuron learns to respond to related inputs, the features it detects can provide a basis for learning others. He interprets neurons through the distinctions they draw for downstream computation, even when their responses cross familiar categories.[^cammarata] Cleanliness, in this account, means that varied responses have an intelligible computational role and developmental history.

Features are the learned patterns or distinctions that neural mechanisms implement. I use path formation to describe how training reshapes circuitry and changes what becomes easier to learn next. An acquired feature can change how later learning signals reach and modify that circuitry, making another feature easier to acquire. The flower timeline motivates this account, while its causal links remain hypothetical.

{% tikz(learning=true, fig_w="620px", caption="<strong>Observed responses.</strong> Response categories follow Cammarata's timeline, and dotted ovals group them within one neuron. Equal-sized dots identify categories without encoding activation magnitude, and thin arrows show potential developmental links.") %}
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
\leftlabel{0}{Yellow flowers\\sometimes dogs}
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

## Why familiar pathways get a head start

Explaining the flower neuron's changing responses requires examining the circuitry that determines its activation and uses its output. Cammarata's circuit-ecology hypothesis proposes that established pathways capture learning signals ahead of competitors built from scratch. In his account, improvements through established pathways reduce error and can weaken competing pathways' learning signals for the same task.[^cammarata]

The path formation account developed here starts with a flower-responsive mechanism that also responds weakly to vegetation, animals, or shared textures. When green-object examples activate it, the training loss can produce gradients through its downstream connections. Compatible gradients could strengthen its green response, providing an input for a later broccoli detector. In the illustrated case, reusing and modifying that circuitry requires fewer training steps than learning the signal anew.

Channeling gradients describes where learning signals pass through the network. Lowered resistance means fewer optimization steps or examples under comparable conditions. Strong activation or gradient support alone does not establish that a feature takes less training to learn.

{% tikz(learning=true, fig_w="620px", caption="<strong>Proposed mechanism.</strong> In this hypothetical case, reusing a green signal takes fewer training steps than learning it anew. Arrows trace contributions that training can modify, while filled and white circles distinguish established mechanisms from unrealized alternatives. Uniform node sizes leave activation unspecified. Grey band width represents gradient support, with taper indicating reinforcement rather than change over time.") %}
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
\leftlabel{.4}{Flower / green\\pathway}
\leftlabel{-.4}{Independent\\green pathway}
\belowannotation{2.25}{0}{Established green\\signal is reused}
\belowannotation{6.75}{0}{Reuse takes fewer steps\\than the independent route}
\rightstacklabel{0}{4}{1}{Green}
\rightstacklabel{0}{4}{2}{Dogs}
\rightstacklabel{0}{4}{3}{Broccoli}
\rightstacklabel{0}{4}{4}{Broccoli}
\abovenodelabel{d}{Green signal}
\abovenodelabel{e}{Green from scratch}
\developmentaxis{-3.4}
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
\statuslegend{-4.85}
\pressuremagnitudelegend{-5.65}
\diagramframe{-6.25}
\end{tikzpicture}
{% end %}

## Same output, different learning cost

Cammarata compares InceptionV1 and ConvNeXt neurons that initially respond to rapeseed fields but develop different sets of strongest responses.[^cammarata] These shifts need not erase responsiveness to earlier categories. Architecture and learning history both differ, so the comparison motivates a question about later learning costs without isolating their cause.

Consider two networks that produce identical outputs on flower images but differ in the cost of learning a broccoli feature. The networks share the same layers and possible connections but have different learned weights. Both receive the same subsequent examples under the same optimization procedure.

In World A, learning the broccoli feature through the flower mechanism could reduce activation on flower inputs and compromise computations that depend on that signal. World B illustrates a separate route that could preserve both roles but require more training.

{% tikz(learning=true, fig_w="620px", caption="<strong>Controlled counterfactual.</strong> With matched initial outputs and subsequent training conditions, different learned weights permit different learning routes and costs. Shared modification weakens the flower signal in World A, while a separate route preserves it in World B at greater assumed training cost. Arrows trace contributions carried forward through training, and all nodes are established within these hypothetical histories. Asterisks identify flower mechanisms, whose sizes alone encode activation on a fixed assay.") %}
\begin{tikzpicture}[learning]
\stageheading{0}{MATCHED CHECKPOINT}{inherited mechanisms}
\stageheading{4.5}{RESPONSE EXTENSION}{reshaped pathways}
\stageheading{9}{FURTHER LEARNING}{retention and interference}
\foreach \base in {0,-5.4} {
  \foreach \x in {0,4.5,9} { \stageoval{\x,\base} }
}
\node[emphasis,anchor=east] at (-1.8,0) {WORLD A};
\node[emphasis,anchor=east] at (-1.8,-5.4) {WORLD B};
\def\learningpitch{.9}
\stacknode[feature,activation=10]{a}{0}{-5.4}{3}{1}
\stacknode[feature,activation=7.4]{b}{0}{-5.4}{3}{2}
\stacknode[feature,activation=7.4]{c}{0}{-5.4}{3}{3}
\stacknode[feature,activation=10]{g}{0}{0}{3}{1}
\stacknode[feature,activation=7.4]{h}{0}{0}{3}{2}
\stacknode[feature,activation=7.4]{i}{0}{0}{3}{3}
\def\learningpitch{.8}
\stacknode[feature,activation=10]{d}{4.5}{-5.4}{2}{1}
\stacknode[feature,activation=7.4]{e}{4.5}{-5.4}{2}{2}
\stacknode[feature,activation=10]{f}{9}{-5.4}{2}{1}
\stacknode[feature,activation=7.4]{broca}{9}{-5.4}{2}{2}
\stacknode[feature,activation=10]{j}{4.5}{0}{2}{1}
\stacknode[feature,activation=7.4]{k}{4.5}{0}{2}{2}
\stacknode[feature,activation=6.2]{l}{9}{0}{2}{1}
\stacknode[feature,activation=7.4]{brocb}{9}{0}{2}{2}
\begin{pgfonlayer}{background}
\foreach \source/\target in {a/d,b/e,c/e,d/f,e/broca,g/j,g/k,i/k,j/l,j/brocb} {
  \draw[flow] (\source.center) .. controls ($(\source.center)+(1.62,0)$) and ($(\target.center)+(-1.35,0)$) .. (\target.west);
}
\end{pgfonlayer}
\leftrowlabel{-5.4}{.9}{Flower}
\leftrowlabel{0}{.9}{Flower}
\abovenodelabel{d}{Flower}
\abovenodelabel{e}{Green}
\abovenodelabel{j}{Flower}
\abovenodelabel{k}{Green}
\belowannotation{6.75}{0}{Shared modification\\reduces flower activation}
\belowannotation{6.75}{-5.4}{Separate route preserves both\\roles with more training}
\rightstacklabel{0}{2}{1}{Flower\\reduced activation}
\rightstacklabel{-5.4}{2}{1}{Flower\\activation preserved}
\foreach \base in {0,-5.4} {
  \rightstacklabel{\base}{2}{2}{Broccoli}
}
\developmentaxis{-8.8}
\begin{pgfonlayer}{foreground}
  \node[feature,activation=10] (flowerkey) at (5.3,-10.25) {};
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
\activationlegend{-10.25}{6.2}
\node[anchor=west] at (6,-10.25) {Flower response};
\diagramframe{-11.5}
\end{tikzpicture}
{% end %}

## Contribution and feature change

Later computations can build on an inherited feature while training changes what that feature detects. Price's equation separates changes in its relative contribution from changes in a measured trait, such as the implementing mechanism’s response to dog images.[^price] Applying it requires a population of mechanisms carrying those features and a rule connecting their earlier and later uses. The two terms are selection and variation, with variation naming the equation's standard transmission term.

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{variation}}.
```

Here, $z$ measures a mechanism's response on a fixed set of test images, $w$ weights its contribution to later computations, and $\Delta z$ measures how that response changes in its later uses. The selection term captures how differences in contribution shift the average measured trait, while variation captures changes in that trait as features develop.[^price-accounting]

Consider tracking the same neurons across training checkpoints, testing whether each responds to dogs without flowers. If every neuron has one equally weighted continuation, then $w_i=1$ and selection is zero. Every response change enters variation, even if competing gradients helped cause it.

To measure differences in contribution, follow how later computations draw on earlier flower-related mechanisms. Fix the tasks and attribution rule first, then divide credit for each later use among the mechanisms that support it. A mechanism's total credit determines its weight, and the same credits weight the responses measured in its later uses. This tracks computational inheritance rather than neuron reproduction.

The choice of population and trait determines what the equation can reveal. Path formation may explain how inherited features develop and change their contributions, while Price's equation separates the resulting changes in the measured trait.

In the illustration below, three later uses inherit dog responsiveness and one does not, raising the responsive share from 50% to 75% through differences in attributed contribution. Acquired responsiveness in the fourth use brings it to 100%, so each term contributes 25 percentage points.

{% tikz(learning=true, fig_w="620px", caption="<strong>Accounting decomposition.</strong> This illustrative population separates differential contribution from trait change. Arrows specify attribution, filled dots represent mechanisms or their later uses, and rings mark dog responsiveness on a fixed assay. The middle markers show reweighting alone, with the axis break distinguishing this accounting step from a training checkpoint. Variation measures acquired responsiveness, even though the final population is more uniform.") %}
\begin{tikzpicture}[learning]
% Slightly smaller markers for the accounting inset and its trait legend.
\tikzset{feature/.append style={minimum size=4.2pt},trait/.append style={minimum size=9pt}}
\stageheading{0}{BASELINE}{50\% dog-responsive}
\stageheading{4.5}{AFTER REWEIGHTING}{75\% dog-responsive}
\stageheading{9}{LATER POPULATION}{100\% dog-responsive}
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
\foreach \source/\target in {a/g,a/h,a/i,b/j} {
  \draw[flow,shorten >=4.9pt] (\source.center)
    .. controls ($(\source.center)+(3,0)$) and ($(\target.center)+(-3,0)$)
    .. (\target.center);
}
\end{pgfonlayer}
\foreach \name in {a,c,d,e,g,h,i,j} { \dogtrait{\name} }


\belowannotation{2.25}{0}{Selection: +\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}\\through differential contribution}
\belowannotation{6.75}{0}{Variation: +\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}\\acquired dog response}
% A broken development axis opens into the accounting inset, not a third state.
\draw[line width=.85pt,line cap=round] (0,-3.4) -- (4.45,-3.4);
\draw[flow,line cap=round] (4.55,-3.4) -- (9,-3.4);
\draw[line width=.85pt,line cap=round] (4.375,-3.55) -- (4.525,-3.25);
\draw[line width=.85pt,line cap=round] (4.475,-3.55) -- (4.625,-3.25);
\node[anchor=north] at (4.5,-3.65) {Development};
\traitlegend{-4.85}
\diagramframe{-5.25}
\end{tikzpicture}
{% end %}

## How disparate responses become intelligible

As features develop, their mechanisms may contribute to more computations, redirecting gradients and lowering the effort of another acquisition. Successive modifications can open further learning opportunities, producing branching and recombining pathways.

Sharing a pathway can also create interference between its computational roles. A broccoli detector could consume green and texture signals supported by circuitry that also carries the flower response. Updates improving those signals could reduce activation on flower inputs. Lowered resistance is specific to an acquisition, and preserving an earlier role may require new circuitry even when another feature becomes easier to learn.

Cleanliness can emerge from the way learning builds on existing distinctions. Responses that appear unrelated in a trained network may follow intelligible developmental paths. Path formation offers an explanation for Cammarata's recursive generalization, in which each acquired feature can reshape the conditions for learning the next. Learning builds the machinery of its own future learning.

{% tikz(learning=true, fig_w="620px", caption="<strong>Tracing developmental connections.</strong> In this hypothetical history, broccoli learning builds on green and texture signals while updates to shared circuitry weaken the flower response. Arrows trace developmental contributions, and filled nodes mark established mechanisms. Only flower node sizes encode activation on a fixed assay. Grey tapers distinguish reinforcing and suppressing training effects, with pressure magnitude and its change over time unspecified.") %}
\begin{tikzpicture}[learning]
\stageheading{0}{PAST}{inherited mechanisms}
\stageheading{4.5}{PRESENT}{shared signals}
\stageheading{9}{FUTURE}{reuse and interference}
\foreach \x in {0,4.5,9} { \stageoval{\x,0} }
\stacknode[feature,activation=10]{a}{0}{0}{2}{1}
\stacknode[feature,activation=7.4]{b}{0}{0}{2}{2}
\def\learningpitch{.9}
\stacknode[feature,activation=7.4]{green}{4.5}{0}{3}{1}
\stacknode[feature,activation=7.4]{texture}{4.5}{0}{3}{2}
\stacknode[feature,activation=10]{flower}{4.5}{0}{3}{3}
\def\learningpitch{.8}
\stacknode[feature,activation=7.4]{broccoli}{9}{0}{2}{1}
\stacknode[feature,activation=4.6]{laterflower}{9}{0}{2}{2}
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
\coordinate (gb) at ($(green.center)+(1.62,0)$);
\coordinate (tg) at ($(texture.center)+(1.62,0)$);
\coordinate (bg) at ($(broccoli.center)+(-1.35,0)$);
\coordinate (fl) at ($(flower.center)+(1.62,0)$);
\coordinate (lf) at ($(laterflower.center)+(-1.35,0)$);
\begin{pgfonlayer}{background}
  \pressureband{green.center}{ga}{ag}{ahead}{4}
  \pressureband{texture.center}{tb}{bt}{bhead}{4}
  \pressureband{flower.center}{fa}{ag}{ahead}{4}
  \pressureband{broccoli.center}{bg}{gb}{greenhead}{4}
  \pressureband{broccoli.center}{bg}{tg}{texturehead}{4}
  \suppressband{laterflower.center}{lf}{fl}{flowerhead}{4}
  \draw[flow] (a.center) .. controls (ag) and (ga) .. (green.west);
  \draw[flow] (a.center) .. controls (ag) and (fa) .. (flower.west);
  \draw[flow] (b.center) .. controls (bt) and (tb) .. (texture.west);
  \draw[flow] (green.center) .. controls (gb) and (bg) .. (broccoli.west);
  \draw[flow] (texture.center) .. controls (tg) and (bg) .. (broccoli.west);
  \draw[flow] (flower.center) .. controls (fl) and (lf) .. (laterflower.west);
\end{pgfonlayer}
\leftlabel{.4}{Flower response}
\leftlabel{-.4}{Texture cues}
\abovenodelabel{green}{Green patterns}
\abovenodelabel{texture}{Clustered texture}
\abovenodelabel{flower}{Flower}
\rightstacklabel{0}{2}{1}{Broccoli}
\rightstacklabel{0}{2}{2}{Flower}
\belowannotation{2.25}{0}{Shared signals support\\broccoli learning}
\belowannotation{6.75}{0}{Training weakens\\the flower response}
\developmentaxis{-3.4}
\activationlegend{-4.85}{4.6}
\trainingeffectlegend{-4.85}
\diagramframe{-6.15}
\end{tikzpicture}
{% end %}

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.

[^price-accounting]: Take equally weighted baseline mechanisms with fixed assay responses $z_i$. Assign each included later use one unit of credit, divided among its registered ancestors, and exclude unassigned uses from this population. Let $w_i\geq0$ be an ancestor's total credit and $\Delta z_i$ its credit-weighted descendant mean response minus $z_i$, set to zero when $w_i=0$. Expectations and covariance use the baseline population, $\bar w=\mathbb E[w]>0$, and $\Delta\bar z$ is the later attributed-use mean minus the baseline mean.[^price1972][^frank1997]
