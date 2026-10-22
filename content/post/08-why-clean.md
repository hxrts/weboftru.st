+++
title = "Why Are Neural Networks Clean?"
date = 2026-10-20
description = "How inherited neural processes shape subsequent learning."
slug = "why-clean"

[extra]
cover_image = "/images/byte-neuron.png"
cover_caption = "Byte Magazine, August 1979"
+++

## Learning by extension

A neuron's strange associations can become intelligible through its learning history. A network learns by sedimentation and erosion, retaining some distinctions and reshaping others. Each extension can change which further extensions become easier to learn. How does learning organize the conditions for its own continuation?

In *Neural Networks Are Already Clean*, Nick Cammarata follows a neuron through a retrained InceptionV1 model.[^cammarata] Early in training, the neuron responds to yellow flowers, sometimes pictured alongside dogs. It later responds to green objects and dogs pictured without flowers, then extends to broccoli. He calls this recursive generalization, as related extensions become starting points for further extensions.

For Cammarata, cleanliness concerns intelligible organization even when a neuron crosses familiar categories. A neuron participates in a process that groups some inputs together and distinguishes others. Its connections form pathways through which these distinctions change downstream activity. We can build on this account by asking how extensions reshape future learning, and which earlier roles they can preserve.

{% tikz(learning=true, fig_w="620px", caption="<strong>Observed responses.</strong> One neuron's response repertoire changes during training, offering a starting point for investigating its computational role. Dots mark observed response categories, and dotted ovals group responses within the same neuron. Thin arrows schematize proposed relationships between the observed extensions. Equal dot sizes leave response strength and susceptibility unspecified.") %}
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

A process might group views of the same shape together while separating different shapes. Composing such processes can support object recognition, actions, or contextual judgments. Error generates gradients through the participating circuitry, and the optimizer translates them into updates. Satrajit Chatterjee's coherent-gradients hypothesis proposes that examples favoring compatible parameter changes reinforce those changes together.[^coherent]

A flower-responsive mechanism may already respond weakly to vegetation, animals, or shared textures. Compatible gradients could strengthen its contribution on green-object examples and change how subsequent examples modify it. Broccoli responses might then develop through this intermediate extension, a proposed route requiring causal evidence. Activation alone supplies no guarantee of useful learning, since downstream sensitivity, prediction error, and the optimizer shape the update.

Cammarata's circuit-ecology hypothesis proposes that existing pathways capture learning signals ahead of competitors built from scratch. Reducing the remaining error may weaken the gradients available to alternatives. We move from one neuron's responses to interactions among mechanisms, parts of the circuitry with contributions we can trace or test. An extension can change the pathways and sensitivities available to further training, making an already representable response easier to learn.

{% tikz(learning=true, fig_w="620px", caption="<strong>Proposed mechanism.</strong> An established flower-responsive circuit mechanism may support new learning ahead of a competing candidate, with input labels identifying contexts for their proposed later uses. Filled circles denote established mechanisms, white circles candidates, and larger circles greater susceptibility under a comparable learning signal. Black arrows show possible developmental dependencies, while the widest points of horizontally aligned grey bands indicate hypothetical learning pressure over each interval. Sizes and widths indicate hypothetical categories shared with the later mechanism diagrams.") %}
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

## One beginning, different futures

Cammarata compares InceptionV1 and ConvNeXt neurons trained on the same data, both initially responsive to rapeseed fields.[^cammarata] Balls and fruit enter their strongest responses early in training. Those associations later recede from the ConvNeXt neuron's strongest images. Dogs and broccoli become prominent in the InceptionV1 neuron's responses as fields recede.

The images reveal which associations rank among the neuron's strongest responses at each checkpoint. Displaced associations may retain weaker responses. Architecture and learning history both vary here, so the comparison alone cannot establish which inherited pathways caused the divergence. It raises a further question about which extensions can coexist with earlier computational roles.

Strengthening a broccoli response could weaken a flower distinction that downstream processes still need. Retaining both roles might require a separate pathway or further reorganization. Two networks making the same flower prediction could therefore differ in the extensions they can acquire while preserving that performance. Inherited circuitry shapes both the ease of a new development and its compatibility with existing roles.

{% tikz(learning=true, fig_w="620px", caption="<strong>Controlled counterfactual.</strong> Different inherited circuit mechanisms may offer different routes to learning despite identical present predictions, with architecture, new data, and training objective held fixed. Readout boxes show the matched flower prediction, while future input labels identify contexts in which candidate mechanisms would act. Circle fill, size, and grey bands follow the mechanism diagram, with susceptibility and pressure varying independently. This is a controlled counterfactual with stipulated developmental dependencies and magnitudes, distinct from the observed architecture comparison.") %}
\begin{tikzpicture}[learning]
\node[time] at (0,3) {PAST};
\node at (0,2.60) {inherited mechanisms};
\node[time] at (4.5,3) {PRESENT};
\node at (4.5,2.60) {available mechanisms};
\node[time] at (9,3) {FUTURE};
\node at (9,2.60) {candidate mechanisms};
\foreach \base in {0,-5.2} {
  \foreach \x in {0,4.5,9} { \stageoval{\x,\base} }
}
\node[emphasis] at (2.25,1.53) {History A};
\node[emphasis] at (2.25,-3.05) {History B};
\stacknode[feature,susceptibility=7.4]{a}{0}{0}{1}{1}
\stacknode[feature,susceptibility=4.6]{b}{4.5}{0}{2}{1}
\stacknode[feature,susceptibility=10]{c}{4.5}{0}{2}{2}
\stacknode[feature,susceptibility=7.4]{d}{9}{0}{3}{1}
\stacknode[feature,susceptibility=4.6]{e}{9}{0}{3}{2}
\stacknode[feature,susceptibility=10]{f}{9}{0}{3}{3}
\stacknode[feature,susceptibility=4.6]{g}{0}{-5.2}{2}{1}
\stacknode[feature,susceptibility=10]{h}{0}{-5.2}{2}{2}
\stacknode[feature,susceptibility=7.4]{i}{4.5}{-5.2}{3}{1}
\stacknode[feature,susceptibility=10]{j}{4.5}{-5.2}{3}{2}
\stacknode[feature,susceptibility=4.6]{k}{4.5}{-5.2}{3}{3}
\stacknode[feature,susceptibility=10]{l}{9}{-5.2}{3}{1}
\stacknode[feature,susceptibility=7.4]{m}{9}{-5.2}{3}{2}
\stacknode[feature,susceptibility=4.6]{n}{9}{-5.2}{3}{3}
\coordinate (ajoin) at ($(a.center)+(1.05,0)$);
\draw[line width=.85pt] (a.center) -- (ajoin);
\coordinate (ahead) at ($(a.center)+(0.42,0)$);
\coordinate (r1a) at ($(a.center)+(2.292,0)$);
\coordinate (r1b) at ($(b.center)+(-1.035,0)$);
\draw[flow] (ajoin) .. controls (r1a) and (r1b) .. (b.west);
\coordinate (r2a) at ($(a.center)+(2.292,0)$);
\coordinate (r2b) at ($(c.center)+(-1.035,0)$);
\draw[flow] (ajoin) .. controls (r2a) and (r2b) .. (c.west);
\coordinate (bjoin) at ($(b.center)+(1.05,0)$);
\draw[line width=.85pt] (b.center) -- (bjoin);
\coordinate (bhead) at ($(b.center)+(0.42,0)$);
\coordinate (r3a) at ($(b.center)+(2.292,0)$);
\coordinate (r3b) at ($(d.center)+(-1.035,0)$);
\draw[flow] (bjoin) .. controls (r3a) and (r3b) .. (d.west);
\coordinate (r4a) at ($(b.center)+(2.292,0)$);
\coordinate (r4b) at ($(e.center)+(-1.035,0)$);
\draw[flow] (bjoin) .. controls (r4a) and (r4b) .. (e.west);
\coordinate (chead) at ($(c.center)+(0.42,0)$);
\coordinate (r5a) at ($(c.center)+(1.62,0)$);
\coordinate (r5b) at ($(f.center)+(-1.35,0)$);
\draw[flow] (c.center) .. controls (r5a) and (r5b) .. (f.west);
\coordinate (gjoin) at ($(g.center)+(1.05,0)$);
\draw[line width=.85pt] (g.center) -- (gjoin);
\coordinate (ghead) at ($(g.center)+(0.42,0)$);
\coordinate (r6a) at ($(g.center)+(2.292,0)$);
\coordinate (r6b) at ($(i.center)+(-1.035,0)$);
\draw[flow] (gjoin) .. controls (r6a) and (r6b) .. (i.west);
\coordinate (r7a) at ($(g.center)+(2.292,0)$);
\coordinate (r7b) at ($(j.center)+(-1.035,0)$);
\draw[flow] (gjoin) .. controls (r7a) and (r7b) .. (j.west);
\coordinate (hhead) at ($(h.center)+(0.42,0)$);
\coordinate (r8a) at ($(h.center)+(1.62,0)$);
\coordinate (r8b) at ($(k.center)+(-1.35,0)$);
\draw[flow] (h.center) .. controls (r8a) and (r8b) .. (k.west);
\coordinate (jhead) at ($(j.center)+(0.42,0)$);
\coordinate (r9a) at ($(j.center)+(1.62,0)$);
\coordinate (r9b) at ($(m.center)+(-1.35,0)$);
\draw[flow] (j.center) .. controls (r9a) and (r9b) .. (m.west);
\begin{pgfonlayer}{background}
  \pressureband{b.center}{r1b}{r1a}{ahead}{6}
  \pressureband{c.center}{r2b}{r2a}{ahead}{2}
  \pressureband{d.center}{r3b}{r3a}{bhead}{6}
  \pressureband{e.center}{r4b}{r4a}{bhead}{4}
  \pressureband{f.center}{r5b}{r5a}{chead}{2}
  \pressureband{i.center}{r6b}{r6a}{ghead}{2}
  \pressureband{j.center}{r7b}{r7a}{ghead}{6}
  \pressureband{k.center}{r8b}{r8a}{hhead}{4}
  \pressureband{m.center}{r9b}{r9a}{jhead}{4}
\end{pgfonlayer}
\node[readout] at (4.5,-2.3) {Flower prediction};
\node[align=center] at (9,-2.3) {Direct reuse};
\node[readout] at (4.5,-7.6) {Flower prediction};
\node[align=center] at (9,-7.5) {Further\\reorganization};
\node[align=center] at (0,-7.5) {Distinct\\history};
\foreach \base in {0,-5.2} {
  \rightstacklabel{\base}{3}{1}{Green}
  \rightstacklabel{\base}{3}{2}{Dogs}
  \rightstacklabel{\base}{3}{3}{Broccoli}
}
\learningaxis{-9.45}
\begin{pgfonlayer}{foreground}
  \node[feature,susceptibility=7.4] at (a.center) {};
  \node[feature,susceptibility=4.6] at (b.center) {};
  \node[feature,susceptibility=10] at (c.center) {};
  \node[potential,susceptibility=7.4] at (d.center) {};
  \node[potential,susceptibility=4.6] at (e.center) {};
  \node[potential,susceptibility=10] at (f.center) {};
  \node[feature,susceptibility=4.6] at (g.center) {};
  \node[feature,susceptibility=10] at (h.center) {};
  \node[feature,susceptibility=7.4] at (i.center) {};
  \node[feature,susceptibility=10] at (j.center) {};
  \node[feature,susceptibility=4.6] at (k.center) {};
  \node[potential,susceptibility=10] at (l.center) {};
  \node[potential,susceptibility=7.4] at (m.center) {};
  \node[potential,susceptibility=4.6] at (n.center) {};
\end{pgfonlayer}
\learninglegend{-10.60}
\pgfresetboundingbox
\path[use as bounding box] (-1.6,-11.70) rectangle (11.2,3.45);
\end{tikzpicture}
{% end %}

## Selection and variation

A newly responsive mechanism may gain downstream recruitment that alters the gradients it receives during further training. For a population of attributed uses, George Price's identity separates differential recruitment from response change, here called variation (the standard transmission term).[^price] Let $z_i$ measure an earlier mechanism's response on a fixed image assay and $w_i$ its attributed descendant weight. For each earlier mechanism, $\Delta z_i$ is its descendants' mean response minus its own, and $\Delta\bar z$ is the change in the population mean.[^price1972][^frank1997]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{variation}}.
```

For the tracked flower neuron, $z$ could indicate responsiveness to dogs without flowers, using a fixed image assay and response threshold throughout training. Under an equally weighted correspondence between neuron coordinates at successive checkpoints, $w=1$ and the selection term is zero. Changes in their dog responsiveness would enter entirely through variation. This assay tracks one aspect of the process, while interventions would test the responses' effects on downstream activity during inference.

To study inheritance through downstream use, we could register flower-related mechanisms and fix the task set and causal attribution rule before calculating the decomposition. Inheritance here describes earlier mechanisms contributing to later computations, with descendant weights measuring attributed use. Each later record would carry an assay response and a weight under fixed rules for inclusion, shared credit, and newly formed routes. This accounting separates recruitment from response change, while establishing their proposed feedback requires evidence about the training dynamics.

{% tikz(learning=true, fig_w="620px", caption="<strong>Accounting decomposition.</strong> Differential recruitment and acquired dog responsiveness contribute separately to the change in the attributed-use population. Every filled dot is an instantiated mechanism or use record, and an outer ring marks dog responsiveness on the fixed assay. Arrows stipulate attribution, while reweighting holds baseline responses fixed. Percentages show the proportion responding to dogs, rather than population size. Selection measures differential recruitment; variation measures response change within inherited uses, rather than diversity in the final population. The middle column is an accounting step that reweights baseline traits while holding their values fixed, rather than an intermediate training checkpoint.") %}
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

## Learning through inheritance

The hypothetical accounting separates two changes in dog responsiveness. Differential recruitment raises its share from one half to three quarters, and acquired responsiveness supplies the remaining quarter through variation. Across training, these changes could reinforce each other as new responses attract recruitment and recruitment alters further learning. Price makes their contributions separately measurable under a declared correspondence, while the feedback remains a causal hypothesis.

Which inherited distinctions make a later extension easier to acquire while preserving the roles already built upon them? We could intervene on a learned green-object pathway while matching current flower performance and subsequent training conditions. A change in where or how quickly broccoli responsiveness develops would support its proposed role as a developmental stepping stone. Matching flower performance would control one relevant behavior, while broader effects of the intervention would still need assessment.

Cleanliness, in this view, concerns how intelligible distinctions develop, combine, and support further learning. Earlier extensions can reshape the learning signals a mechanism receives and the roles it can sustain together. Following that history could explain both the associations visible in a trained network and the routes through which they became learnable. Learning builds the machinery of its own future learning.

{% tikz(learning=true, fig_w="620px", caption="<strong>Learning through inheritance.</strong> Circuit mechanisms can acquire new roles and change their responses, reshaping the pathways available to subsequent learning. Their extensions may require reorganization to preserve earlier computational roles. Filled circles denote established mechanisms and white circles candidates, with larger circles indicating greater susceptibility to change. Black arrows show proposed developmental dependencies, including multiple inherited mechanisms supporting one candidate, while input labels name possible response contexts. Grey bands retain the earlier figures' illustrative learning-pressure scale within this hypothetical account of circuit development.") %}
\begin{tikzpicture}[learning]
\node[time] at (0,3) {PAST};
\node at (0,2.60) {inherited mechanisms};
\node[time] at (4.5,3) {PRESENT};
\node at (4.5,2.60) {recruited and reshaped};
\node[time] at (9,3) {FUTURE};
\node at (9,2.60) {further composition};
\foreach \x in {0,4.5,9} { \stageoval{\x,0} }
\stacknode[feature,susceptibility=7.4]{a}{0}{0}{2}{1}
\stacknode[feature,susceptibility=10]{b}{0}{0}{2}{2}
\stacknode[feature,susceptibility=4.6]{c}{4.5}{0}{3}{1}
\stacknode[feature,susceptibility=7.4]{d}{4.5}{0}{3}{2}
\stacknode[feature,susceptibility=10]{e}{4.5}{0}{3}{3}
\stacknode[potential,susceptibility=7.4]{f}{9}{0}{4}{1}
\stacknode[potential,susceptibility=4.6]{g}{9}{0}{4}{2}
\stacknode[potential,susceptibility=10]{h}{9}{0}{4}{3}
\stacknode[potential,susceptibility=7.4]{i}{9}{0}{4}{4}
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
  \pressureband{c.center}{r1b}{r1a}{ahead}{6}
  \pressureband{d.center}{r2b}{r1a}{ahead}{4}
  \pressureband{e.center}{r3b}{r3a}{bhead}{2}
  \pressureband{f.center}{r4b}{r4a}{chead}{6}
  \pressureband{g.center}{r5b}{r4a}{chead}{2}
  \pressureband{h.center}{r6b}{r6a}{dhead}{4}
  \pressureband{h.center}{r6b}{r7a}{ehead}{2}
  \pressureband{i.center}{r8b}{r7a}{ehead}{4}
  \draw[flow] (a.center) .. controls (r1a) and (r1b) .. (c.west);
  \draw[flow] (a.center) .. controls (r1a) and (r2b) .. (d.west);
  \draw[flow] (b.center) .. controls (r3a) and (r3b) .. (e.west);
  \draw[flow] (c.center) .. controls (r4a) and (r4b) .. (f.west);
  \draw[flow] (c.center) .. controls (r4a) and (r5b) .. (g.west);
  \draw[flow] (d.center) .. controls (r6a) and (r6b) .. (h.west);
  \draw[flow] (e.center) .. controls (r7a) and (r6b) .. (h.west);
  \draw[flow] (e.center) .. controls (r7a) and (r8b) .. (i.west);
\end{pgfonlayer}
\node[align=center] at (2.25,1.85) {Recruit existing\\mechanisms};
\node[align=center] at (6.75,2.05) {Reuse and\\compose};
\node[align=center] at (2.25,-2.65) {Responses change\\as roles develop};
\node[align=center] at (6.75,-2.65) {Extensions reshape\\further learning};
\rightstacklabel{0}{4}{1}{Green}
\rightstacklabel{0}{4}{2}{Dogs}
\rightstacklabel{0}{4}{3}{Broccoli}
\rightstacklabel{0}{4}{4}{Other\\contexts}
\learningaxis{-4.35}
\learninglegend{-5.5}
\pgfresetboundingbox
\path[use as bounding box] (-1.6,-6.7) rectangle (11.2,3.45);
\end{tikzpicture}
{% end %}

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^coherent]: Chatterjee, S. (2020). [*Coherent Gradients: An Approach to Understanding Generalization in Gradient Descent-based Optimization*](https://arxiv.org/abs/2002.10657).

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.
