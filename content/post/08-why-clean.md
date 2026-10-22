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

A neuron's disparate responses can become intelligible through its learning history. In the usual sense, generalization is a model’s ability to produce appropriate outputs on examples beyond those it was trained on. During further training, a mechanism can also acquire new responses and reshape the conditions for its next acquisition. How does one extension make another easier to learn?

In *Neural Networks Are Already Clean*, Nick Cammarata follows a neuron through a retrained InceptionV1 model.[^cammarata] Early in training, its strongest activations come from yellow-flower images which may or may not contain dogs. Green objects and dogs without flowers appear among its strongest activations later, followed by broccoli. Related extensions become starting points for further extension, which Cammarata terms "recursive generalization."

Cammarata interprets neurons through the distinctions they draw for downstream computation, even when their responses cross familiar categories.[^cammarata] These distinctions contribute to processes that group some inputs and separate others. I use path formation to describe how training reshapes circuitry and changes what becomes easier to learn next. The flower timeline motivates this account, while its causal links remain hypothetical.

{% tikz(learning=true, fig_w="620px", caption="<strong>Observed responses.</strong> Response categories follow Cammarata's timeline, and dotted ovals group them within one neuron. Thin arrows show potential developmental links.") %}
\begin{tikzpicture}[learning]
\node[time] at (0,2.45) {EARLY};
\node[time] at (4.5,2.45) {INTERMEDIATE};
\node[time] at (9,2.45) {LATE};
\foreach \x in {0,4.5,9} { \stageoval{\x,0} }
\stacknode[feature]{a}{0}{0}{1}{1}
\stacknode[feature]{b}{4.5}{0}{2}{1}
\stacknode[feature]{c}{4.5}{0}{2}{2}
\stacknode[feature]{d}{9}{0}{3}{1}
\stacknode[feature]{e}{9}{0}{3}{2}
\stacknode[feature]{f}{9}{0}{3}{3}
\leftlabel{0}{Yellow f{}lowers\\sometimes dogs}
\halolabel{above=5pt}{b}{Green objects}
\halolabel{below=5pt,align=center}{c}{Dogs\\without f{}lowers}
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
\draw[flow,line cap=round] (0,-2.65) -- (9,-2.65);
\node at (4.5,-3.15) {Development};
\pgfresetboundingbox
\path[use as bounding box] (-1.6,-3.55) rectangle (11.2,2.9);
\end{tikzpicture}
{% end %}

## Why familiar pathways get a head start

Explaining the flower neuron's changing responses requires examining the circuitry that determines its activation and uses its output. Cammarata's circuit-ecology hypothesis proposes that established pathways capture learning signals ahead of competitors built from scratch. In his account, improvements through established pathways reduce error and can weaken competing pathways' learning signals for the same task.[^cammarata]

The path formation account developed here starts with a flower-responsive mechanism that also responds weakly to vegetation, animals, or shared textures. When green-object examples activate it, the training loss can produce gradients through its downstream connections. The optimizer could strengthen those responses using compatible gradients and change which later examples activate the mechanism. This intermediate change can lower the effort needed to acquire broccoli responsiveness, opening a route the earlier circuitry did not readily support.

Channeling gradients describes where learning signals pass through the network. Lowered resistance means fewer optimization steps or examples under comparable conditions, which redirecting gradients alone need not achieve.

Activation measures its response to an input, while training susceptibility describes how much comparable parameter updates change those responses. Strong activation need not imply high susceptibility, and neither alone establishes a learning advantage. Establishing that advantage requires a controlled comparison.

{% tikz(learning=true, fig_w="620px", caption="<strong>Proposed mechanism.</strong> This hypothetical illustration applies Cammarata's circuit-ecology hypothesis to a possible flower-to-broccoli pathway. Filled circles denote established mechanisms and white circles candidates, with size indicating hypothetical susceptibility of its responses to comparable training updates. Black arrows show developmental dependencies, while grey band width indicates hypothetical reinforcing gradient support. Neither size nor width measures activation strength, and neither alone guarantees acquisition.") %}
\begin{tikzpicture}[learning]
\node[time] at (0,3) {PAST};
\node at (0,2.60) {inherited mechanisms};
\node[time] at (4.5,3) {PRESENT};
\node at (4.5,2.60) {available mechanisms};
\node[time] at (9,3) {FUTURE};
\node at (9,2.60) {candidate mechanisms};
\foreach \x in {0,4.5,9} { \stageoval{\x,0} }
\stacknode[feature,susceptibility=7.4]{a}{0}{0}{2}{1}
\stacknode[feature,susceptibility=10]{b}{0}{0}{2}{2}
\stacknode[feature,susceptibility=4.6]{d}{4.5}{0}{2}{1}
\stacknode[feature,susceptibility=10]{e}{4.5}{0}{2}{2}
\stacknode[feature,susceptibility=7.4]{f}{9}{0}{4}{1}
\stacknode[feature,susceptibility=4.6]{g}{9}{0}{4}{2}
\stacknode[feature,susceptibility=10]{h}{9}{0}{4}{3}
\stacknode[feature,susceptibility=7.4]{i}{9}{0}{4}{4}
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
\node[align=center] at (2.25,1.55) {Flower / green\\pathway};
\node[align=center,text=black!65] at (6.75,1.55) {Reinforcing\\shared signals};
\node[align=center] at (2.25,-1.95) {Independent\\green pathway};
\node[align=center,text=black!65] at (6.75,-1.95) {Less shared\\support};
\rightstacklabel{0}{4}{1}{Green}
\rightstacklabel{0}{4}{2}{Dogs}
\rightstacklabel{0}{4}{3}{Broccoli}
\rightstacklabel{0}{4}{4}{Green}
\learningaxis{-3.90}
\begin{pgfonlayer}{foreground}
  \node[feature,susceptibility=7.4] at (a.center) {};
  \node[potential,susceptibility=10] at (b.center) {};
  \node[feature,susceptibility=4.6] at (d.center) {};
  \node[potential,susceptibility=10] at (e.center) {};
  \node[potential,susceptibility=7.4] at (f.center) {};
  \node[potential,susceptibility=4.6] at (g.center) {};
  \node[potential,susceptibility=10] at (h.center) {};
  \node[potential,susceptibility=7.4] at (i.center) {};
\end{pgfonlayer}
\learninglegend{-5.05}
\pgfresetboundingbox
\path[use as bounding box] (-1.6,-6.15) rectangle (11.2,3.45);
\end{tikzpicture}
{% end %}

## Same output, different learning cost

Cammarata compares InceptionV1 and ConvNeXt neurons trained on the same data, both initially responsive to rapeseed fields.[^cammarata] Images of balls and fruit rank among both neurons' strongest activations early in training. These categories later recede from ConvNeXt's top-activating images. Dogs and broccoli become prominent in InceptionV1's set as field images recede.

These sets show which image categories produce the strongest activations at each checkpoint. Displaced categories may still activate the neuron more weakly. Architecture and learning history both vary here, so the comparison alone cannot establish which inherited pathways caused the divergence. These observations motivate a separate question about how path formation affects compatibility between later extensions and earlier roles.

Consider two networks that produce identical outputs on flower images but differ in the cost of acquiring broccoli responsiveness. The networks share the same layers and possible connections but have different learned weights. Both receive the same subsequent examples under the same optimization procedure.

In World A, acquiring broccoli responsiveness through the flower mechanism could reduce activation on flower inputs. World B illustrates a separate route that could preserve both roles but require more training.

{% tikz(learning=true, fig_w="620px", caption="<strong>Controlled counterfactual.</strong> The worlds have matched circuit components and identical network outputs at the initial checkpoint, but different learned weights. Both receive the same subsequent examples and optimization procedure. World A illustrates interference from shared modification, while World B illustrates how a separate route could preserve the flower role during broccoli acquisition. Arrows show hypothetical developmental dependencies, asterisks mark flower-responsive mechanisms, and sizes indicate susceptibility of responses to training updates, with activation changes labeled separately, pressure unspecified, and learning-cost differences hypothetical.") %}
\begin{tikzpicture}[learning]
\node[time] at (0,3) {MATCHED CHECKPOINT};
\node at (0,2.60) {inherited mechanisms};
\node[time] at (4.5,3) {RESPONSE EXTENSION};
\node at (4.5,2.60) {reshaped pathways};
\node[time] at (9,3) {FURTHER LEARNING};
\node at (9,2.60) {retention and interference};
\foreach \base in {0,-5.2} {
  \foreach \x in {0,4.5,9} { \stageoval{\x,\base} }
}
\node[emphasis] at (2.25,1.53) {World A};
\node[emphasis] at (2.25,-3.05) {World B};
\def\learningpitch{.9}
\stacknode[feature,susceptibility=6.2]{a}{0}{-5.2}{3}{1}
\stacknode[feature,susceptibility=10]{b}{0}{-5.2}{3}{2}
\stacknode[feature,susceptibility=7.4]{c}{0}{-5.2}{3}{3}
\stacknode[feature,susceptibility=8]{g}{0}{0}{3}{1}
\stacknode[feature,susceptibility=10]{h}{0}{0}{3}{2}
\stacknode[feature,susceptibility=4.6]{i}{0}{0}{3}{3}
\def\learningpitch{.8}
\stacknode[feature,susceptibility=6.2]{d}{4.5}{-5.2}{2}{1}
\stacknode[feature,susceptibility=10]{e}{4.5}{-5.2}{2}{2}
\stacknode[feature,susceptibility=6.2]{f}{9}{-5.2}{2}{1}
\stacknode[potential,susceptibility=10]{broca}{9}{-5.2}{2}{2}
\stacknode[feature,susceptibility=8]{j}{4.5}{0}{2}{1}
\stacknode[feature,susceptibility=4.6]{k}{4.5}{0}{2}{2}
\stacknode[feature,susceptibility=8]{l}{9}{0}{2}{1}
\stacknode[potential,susceptibility=4.6]{brocb}{9}{0}{2}{2}
\begin{pgfonlayer}{background}
\foreach \source/\target in {a/d,b/e,c/e,d/f,e/broca,g/j,g/k,i/k,j/l,j/brocb} {
  \draw[flow] (\source.center) .. controls ($(\source.center)+(1.62,0)$) and ($(\target.center)+(-1.35,0)$) .. (\target.west);
}
\end{pgfonlayer}
\halolabel{above=5pt}{a}{Flower}
\halolabel{above=5pt}{g}{Flower}
\halolabel{above=5pt}{d}{Flower}
\halolabel{below=5pt}{e}{Green}
\halolabel{above=5pt}{j}{Flower}
\halolabel{below=5pt}{k}{Green}
\halolabel{align=center}{6.75,1.15}{Shared modification}
\halolabel{align=center}{6.75,-6.35}{Separate route\\preserves both roles}
\node[align=center] at (9,-2.3) {Broccoli acquired};
\node[align=center] at (9,-7.5) {Both roles retained\\more training};
\rightstacklabel{0}{2}{1}{Flower\\reduced activation}
\rightstacklabel{-5.2}{2}{1}{Flower\\activation preserved}
\foreach \base in {0,-5.2} {
  \rightstacklabel{\base}{2}{2}{Broccoli}
}
\developmentaxis{-9.45}
\begin{pgfonlayer}{foreground}
  \node[feature,susceptibility=7.4] (flowerkey) at (5.3,-11.8) {};
  \foreach \marked in {a,d,f,g,j,l,flowerkey} {
    \draw[white,line width=.6pt,line cap=round] ($(\marked.center)+(-1.4pt,0)$) -- ($(\marked.center)+(1.4pt,0)$);
    \draw[white,line width=.6pt,line cap=round] ($(\marked.center)+(-.7pt,-1.2pt)$) -- ($(\marked.center)+(.7pt,1.2pt)$);
    \draw[white,line width=.6pt,line cap=round] ($(\marked.center)+(-.7pt,1.2pt)$) -- ($(\marked.center)+(.7pt,-1.2pt)$);
  }
\end{pgfonlayer}
\learninglegend{-10.60}
\node[anchor=west] at (5.6,-11.8) {Flower-responsive mechanism};
\pgfresetboundingbox
\path[use as bounding box] (-1.6,-12.3) rectangle (12.6,3.45);
\end{tikzpicture}
{% end %}

## Recruitment and response change

How might a useful new response change recruitment of its mechanism and redirect further learning? Under a specified correspondence, I apply George Price's identity to separate recruitment from response change (variation, the standard transmission term).[^price] Over equally weighted baseline mechanisms, $z_i$ measures activation on a fixed assay, $w_i\geq0$ an attributed descendant weight, and $\Delta z_i$ the credit-weighted descendant mean minus $z_i$ (set to zero when $w_i=0$). Expectation and covariance use this baseline with $\bar w=\mathbb E[w]>0$, and $\Delta\bar z$ measures the change from the baseline mean response to the later attributed-use mean.[^price1972][^frank1997]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{variation}}.
```

For a population of neurons followed by coordinate across checkpoints, let a fixed image assay and threshold measure dog responsiveness without flowers. This trait measures activation above the assay threshold, not susceptibility to training. Each neuron has one equally weighted continuation, so $w_i=1$ and selection is zero. All response change enters variation, while gradient competition remains a separate causal hypothesis.

For a downstream-use construction, fix baseline flower-related mechanisms, the task set, and a causal attribution rule. Include only later uses assigned a registered ancestor, excluding unassigned routes from this population. Split each included use's unit credit among its ancestors, summing an ancestor's credits for $w_i$ and using the same credits for its descendants' mean assay response. Inheritance here measures contributions to later computation, while path formation and lowered resistance remain proposed causes of recruitment and response change.

{% tikz(learning=true, fig_w="620px", caption="<strong>Accounting decomposition.</strong> The population, attribution, and percentages are illustrative, not measurements from the tracked neuron. Filled dots are instantiated mechanisms or use records, with an outer ring marking dog responsiveness on the fixed assay. Arrows stipulate attribution, and percentages show the proportion responding to dogs. The middle column reweights fixed baseline traits as an accounting step rather than a training checkpoint, while variation measures response change within inherited uses rather than final diversity.") %}
\begin{tikzpicture}[learning]
\node[time] at (0,3) {BASELINE};
\node at (0,2.6) {50\% dog-responsive};
\node[time] at (4.5,3) {AFTER RECRUITMENT};
\node at (4.5,2.6) {75\% dog-responsive};
\node[time] at (9,3) {AFTER VARIATION};
\node at (9,2.6) {100\% dog-responsive};
\foreach \x in {0,4.5,9} { \stageoval{\x,0} }
\stacknode[feature]{a}{0}{0}{2}{1}
\stacknode[feature]{b}{0}{0}{2}{2}
\stacknode[feature]{c}{4.5}{0}{4}{1}
\stacknode[feature]{d}{4.5}{0}{4}{2}
\stacknode[feature]{e}{4.5}{0}{4}{3}
\stacknode[feature]{f}{4.5}{0}{4}{4}
\stacknode[feature]{g}{9}{0}{4}{1}
\stacknode[feature]{h}{9}{0}{4}{2}
\stacknode[feature]{i}{9}{0}{4}{3}
\stacknode[feature]{j}{9}{0}{4}{4}
\begin{pgfonlayer}{background}
\draw[flow] (a.center) .. controls ($(a.center)+(1.6,0)$) and ($(c.center)+(-1.4,0)$) .. ($(c.west)+(-2.7pt,0)$);
\draw[flow] (a.center) .. controls ($(a.center)+(1.6,0)$) and ($(d.center)+(-1.4,0)$) .. ($(d.west)+(-2.7pt,0)$);
\draw[flow] (a.center) .. controls ($(a.center)+(1.6,0)$) and ($(e.center)+(-1.4,0)$) .. ($(e.west)+(-2.7pt,0)$);
\draw[flow] (b.center) .. controls ($(b.center)+(1.6,0)$) and ($(f.center)+(-1.4,0)$) .. (f.west);
\draw[flow] (c.center) -- ($(g.west)+(-2.7pt,0)$);
\draw[flow] (d.center) -- ($(h.west)+(-2.7pt,0)$);
\draw[flow] (e.center) -- ($(i.west)+(-2.7pt,0)$);
\draw[flow] (f.center) -- ($(j.west)+(-2.7pt,0)$);
\end{pgfonlayer}
\foreach \name in {a,c,d,e,g,h,i,j} { \dogtrait{\name} }


\node[align=center] at (2.25,-2.45) {Trait share grows by \textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}\\through differential recruitment};
\node[align=center] at (6.75,-2.45) {\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4} of the population\\acquires trait via variation};
\node[feature] (keyyes) at (1.2,-3.45) {};
\dogtrait{keyyes}
\node[anchor=west] at (1.5,-3.45) {Responds to dogs};
\node[feature] at (6,-3.45) {};
\node[anchor=west] at (6.3,-3.45) {No dog response};
\pgfresetboundingbox
\path[use as bounding box] (-1.6,-4) rectangle (10.6,3.45);
\end{tikzpicture}
{% end %}

## How disparate responses become intelligible

In the illustration, three later uses inherit dog responsiveness and one does not, raising the responsive share from 50% to 75% through recruitment. Acquired responsiveness in the fourth use brings it to 100%, so each term contributes 25 percentage points. The proposed feedback links new responses to recruitment that may redirect gradients and lower the effort of another acquisition. Repeated recruitment and modification could produce branching and recombining pathways.

Sharing a pathway can also create interference between its computational roles. Learning green and texture cues for broccoli could reduce activation on flower inputs in shared circuitry. Lowered resistance is therefore specific to an acquisition and its training conditions. Preserving an earlier role may require new circuitry even when another response becomes easier to learn.

Ordinary generalization concerns a model’s outputs on examples beyond its training data. Locally understandable extensions can accumulate into responses that appear unrelated when their history is hidden. The path formation hypothesis could explain the coherence of Cammarata's recursive generalization through the learning advantages created by acquired pathways. Learning builds the machinery of its own future learning.

{% tikz(learning=true, fig_w="620px", caption="<strong>Tracing developmental connections.</strong> A hypothetical history links field contexts to green and dog responses, while green patterns and clustered textures support broccoli. Filled and white circles mark illustrative established and candidate mechanisms, and opposite band tapers indicate training effects that increase or decrease activation on the named inputs. These bands represent proposed effects of updates, not immediate excitation or inhibition. Uniform sizes and widths leave training susceptibility and pressure magnitude unspecified, while black arrows show developmental dependencies.") %}
\begin{tikzpicture}[learning]
\node[time] at (0,3) {PAST};
\node at (0,2.60) {inherited mechanisms};
\node[time] at (4.5,3) {PRESENT};
\node at (4.5,2.60) {recruited and reshaped};
\node[time] at (9,3) {FUTURE};
\node at (9,2.60) {further composition};
\foreach \x in {0,4.5,9} { \stageoval{\x,0} }
\stacknode[feature,susceptibility=7.4]{a}{0}{0}{2}{1}
\stacknode[feature,susceptibility=7.4]{b}{0}{0}{2}{2}
\def\learningpitch{.9}
\stacknode[feature,susceptibility=7.4]{c}{4.5}{0}{3}{1}
\stacknode[feature,susceptibility=7.4]{d}{4.5}{0}{3}{2}
\stacknode[feature,susceptibility=7.4]{e}{4.5}{0}{3}{3}
\def\learningpitch{.8}
\stacknode[potential,susceptibility=7.4]{f}{9}{0}{4}{1}
\stacknode[potential,susceptibility=7.4]{g}{9}{0}{4}{2}
\stacknode[potential,susceptibility=7.4]{h}{9}{0}{4}{3}
\stacknode[feature,susceptibility=7.4]{i}{9}{0}{4}{4}
\coordinate (ahead) at ($(a.center)+(0.42,0)$);
\coordinate (bhead) at ($(b.center)+(0.42,0)$);
\coordinate (r1a) at ($(a.center)+(1.62,0)$);
\coordinate (r1b) at ($(c.center)+(-1.35,0)$);
\coordinate (r2b) at ($(d.center)+(-1.35,0)$);
\coordinate (r3a) at ($(b.center)+(1.62,0)$);
\coordinate (r3b) at ($(e.center)+(-1.35,0)$);
\coordinate (chead) at ($(c.center)+(0.42,0)$);
\coordinate (dhead) at ($(d.center)+(0.42,0)$);
\coordinate (ehead) at ($(e.center)+(0.42,0)$);
\coordinate (r4a) at ($(c.center)+(1.62,0)$);
\coordinate (r4b) at ($(f.center)+(-1.35,0)$);
\coordinate (r5b) at ($(g.center)+(-1.35,0)$);
\coordinate (r6a) at ($(d.center)+(1.62,0)$);
\coordinate (r6b) at ($(h.center)+(-1.35,0)$);
\coordinate (r7a) at ($(e.center)+(1.62,0)$);
\coordinate (r8b) at ($(i.center)+(-1.35,0)$);
\begin{pgfonlayer}{background}
  \pressureband{c.center}{r1b}{r1a}{ahead}{4}
  \pressureband{d.center}{r2b}{r1a}{ahead}{4}
  \pressureband{e.center}{r3b}{r3a}{bhead}{4}
  \pressureband{f.center}{r4b}{r4a}{chead}{4}
  \pressureband{g.center}{r5b}{r4a}{chead}{4}
  \pressureband{h.center}{r6b}{r6a}{dhead}{4}
  \pressureband{h.center}{r6b}{r7a}{ehead}{4}
  \suppressband{i.center}{r8b}{r6a}{dhead}{4}
  \draw[flow] (a.center) .. controls (r1a) and (r1b) .. (c.west);
  \draw[flow] (a.center) .. controls (r1a) and (r2b) .. (d.west);
  \draw[flow] (b.center) .. controls (r3a) and (r3b) .. (e.west);
  \draw[flow] (c.center) .. controls (r4a) and (r4b) .. (f.west);
  \draw[flow] (c.center) .. controls (r4a) and (r5b) .. (g.west);
  \draw[flow] (d.center) .. controls (r6a) and (r6b) .. (h.west);
  \draw[flow] (e.center) .. controls (r7a) and (r6b) .. (h.west);
  \draw[flow] (d.center) .. controls (r6a) and (r8b) .. (i.west);
\end{pgfonlayer}
\leftlabel{.4}{Flower cues}
\leftlabel{-.4}{Texture cues}
\halolabel{above=5pt}{c}{Field contexts}
\halolabel{above=5pt}{d}{Green patterns}
\halolabel{above=5pt}{e}{Clustered texture}
\node[align=center] at (2.25,1.85) {Develop shared\\distinctions};
\node[align=center] at (6.75,2.05) {Contextual\\extensions};
\node[align=center] at (2.25,-2.65) {Extend visual\\responses};
\node[align=center] at (6.75,-2.65) {Training can reduce\\earlier activations};
\rightstacklabel{0}{4}{1}{Green}
\rightstacklabel{0}{4}{2}{Dogs}
\rightstacklabel{0}{4}{3}{Broccoli}
\rightstacklabel{0}{4}{4}{Flowers\\reduced activation}
\developmentaxis{-4.35}
\node[feature,susceptibility=7.4] at (.3,-5.5) {};
\node[anchor=west] at (.6,-5.5) {Established mechanism};
\node[potential,susceptibility=7.4] at (5.3,-5.5) {};
\node[anchor=west] at (5.6,-5.5) {Candidate mechanism};
\pressuresignlegend{-6.3}
\pgfresetboundingbox
\path[use as bounding box] (-2.8,-6.85) rectangle (12.6,3.45);
\end{tikzpicture}
{% end %}

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.
