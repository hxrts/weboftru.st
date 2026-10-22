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

A neuron's disparate responses can become intelligible through its learning history. Ordinary generalization concerns how learned behavior extends beyond training examples. During further training, a mechanism can also acquire new responses and reshape the conditions for its next acquisition. How does one extension make another easier to learn?

In *Neural Networks Are Already Clean*, Nick Cammarata follows a neuron through a retrained InceptionV1 model.[^cammarata] Early in training, its strongest activations come from yellow-flower images, sometimes with dogs. Green objects and dogs without flowers appear among its strongest activations later, followed by broccoli. Cammarata calls this recursive generalization, as related extensions become starting points for further extensions.

Path formation describes how training reshapes circuitry and changes what becomes easier to learn next. For Cammarata, several response categories can belong to a clean neuron when their computational roles or development explain why they occur together. A neuron participates in processes that group some inputs and distinguish others, channeling their effects through downstream connections. The observed sequence motivates this account, while its causal links remain hypothetical.

{% tikz(learning=true, fig_w="620px", caption="<strong>Observed responses.</strong> One neuron's response repertoire changes during training. Dots mark observed response categories, and dotted ovals group responses within the same neuron. Thin arrows schematize possible developmental relationships, motivating the path formation hypothesis without establishing that one response caused or eased the acquisition of another. Equal dot sizes leave response strength and susceptibility unspecified.") %}
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

Explaining that response history requires examining the circuitry that produces the neuron's activity and uses its output. Satrajit Chatterjee's coherent-gradients hypothesis proposes that examples favoring compatible parameter changes reinforce those changes together.[^coherent] Cammarata's circuit-ecology hypothesis proposes that established pathways capture learning signals ahead of competitors built from scratch. As updates through established pathways reduce error on relevant examples, competing pathways may receive weaker gradients for the same task.

A flower-responsive mechanism may already respond weakly to vegetation, animals, or shared textures. When green-object examples activate it, their errors can contribute gradients through its downstream connections. The optimizer could strengthen those responses using compatible gradients and change which later examples activate the mechanism. This intermediate change might lower the effort needed to acquire broccoli responsiveness, opening a route the earlier circuitry did not readily support.

Channeling gradients describes where learning signals pass through the network. Lowered resistance means a particular response requires less learning effort under comparable conditions, such as fewer optimization steps or examples. A response extension can redirect gradients without reducing that effort, since downstream sensitivity and optimizer dynamics also matter. Establishing an advantage requires a controlled comparison, as activation, gradient support, and susceptibility alone do not guarantee acquisition.

{% tikz(learning=true, fig_w="620px", caption="<strong>Proposed mechanism.</strong> An established flower-responsive circuit mechanism may channel learning toward new responses ahead of a competing candidate. Filled circles denote established mechanisms and white circles candidates, with size indicating hypothetical susceptibility to change under a comparable learning signal. Black arrows show proposed developmental dependencies, while the widest points of horizontally aligned grey bands indicate hypothetical learning pressure over each interval. Greater support or susceptibility may lower the effort required for an extension, but neither alone guarantees acquisition.") %}
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

## Same prediction, different learning costs

Cammarata compares InceptionV1 and ConvNeXt neurons trained on the same data, both initially responsive to rapeseed fields.[^cammarata] Images of balls and fruit rank among both neurons' strongest activations early in training. These categories later recede from ConvNeXt's top-activating images. Dogs and broccoli become prominent in InceptionV1's set as field images recede.

These sets show which image categories produce the strongest activations at each checkpoint. Displaced categories may still activate the neuron more weakly. Architecture and learning history both vary here, so the comparison alone cannot establish which inherited pathways caused the divergence. The trajectories motivate investigating how path formation rechannels learning and which extensions can coexist with earlier roles.

Two networks can make the same flower prediction while differing in the additional learning required to acquire broccoli responsiveness. A controlled comparison would hold architecture, new data, and training conditions fixed while varying the inherited pathways. Strengthening a broccoli response could also weaken a flower distinction that downstream processes still need. Retaining both roles might require a separate pathway or further reorganization.

{% tikz(learning=true, fig_w="620px", caption="<strong>Controlled counterfactual.</strong> Identical present predictions can coexist with different costs and routes for subsequent learning. Architecture, new data, and training objective are held fixed while inherited circuit mechanisms differ. Readout boxes show the matched flower prediction, and future labels identify contexts for candidate mechanisms. Circle fill, size, and bands retain the earlier conventions, with dependencies and relative training costs stipulated for this counterfactual.") %}
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
\node[align=center] at (9,-2.3) {Direct reuse\\less training};
\node[readout] at (4.5,-7.6) {Flower prediction};
\node[align=center] at (9,-7.5) {Reorganization\\more training};
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

## Recruitment and response change

How might a useful new response change recruitment of its mechanism and redirect further learning? George Price's identity separates recruitment from response change (variation, the standard transmission term) under a specified correspondence.[^price] Over equally weighted baseline mechanisms, $z_i$ is a response on a fixed assay, $w_i\geq0$ an attributed descendant weight, and $\Delta z_i$ the credit-weighted descendant mean minus $z_i$ (set to zero when $w_i=0$). Expectation and covariance use this baseline with $\bar w=\mathbb E[w]>0$, and $\Delta\bar z$ measures the change from the baseline mean response to the later attributed-use mean.[^price1972][^frank1997]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{variation}}.
```

For a population of neurons followed by coordinate across checkpoints, let a fixed image assay and threshold measure dog responsiveness without flowers. The flower neuron would be one member of this population. Each neuron has one equally weighted continuation, so $w_i=1$ and selection is zero. All response change enters variation, while gradient competition remains a separate causal hypothesis.

For downstream-use inheritance, fix baseline flower-related mechanisms, the task set, and a causal attribution rule. Include only later uses assigned a registered ancestor, excluding unassigned routes from this population. Split each included use's unit credit among its ancestors, summing an ancestor's credits for $w_i$ and using the same credits for its descendants' mean assay response. Inheritance here measures contributions to later computation, while path formation and lowered resistance remain proposed causes of recruitment and response change.

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

In the illustration, three later uses inherit dog responsiveness and one does not, raising the responsive share from 50% to 75% through recruitment. Acquired responsiveness in the fourth use brings it to 100%, so each term contributes 25 percentage points. During training, new responses may attract recruitment that redirects gradients and lowers the effort of another acquisition. Repeated recruitment and modification could produce branching and recombining pathways.

Sharing a pathway can also create interference between its computational roles. A new downstream role may reinforce a useful distinction or redirect learning away from an earlier one. Lowered resistance is therefore specific to an acquisition and its training conditions. Preserving an earlier role may require new circuitry even when another response becomes easier to learn.

Ordinary generalization describes learned behavior beyond its training examples. Locally understandable extensions can accumulate into responses that appear unrelated when their history is hidden. Cleanliness could therefore reflect the path formation behind Cammarata's recursive generalization, as acquired pathways can make further responses easier to learn. Learning builds the machinery of its own future learning.

{% tikz(learning=true, fig_w="620px", caption="<strong>Tracing developmental connections.</strong> One possible history links shared field contexts to green and dog responses, while green patterns and clustered textures jointly support a broccoli response. These hypothetical intermediate mechanisms illustrate how locally related acquisitions could produce disparate responses, without identifying the actual circuitry in Cammarata's neuron. Filled and white circles denote established and candidate mechanisms, with size indicating susceptibility under a comparable learning signal. Grey bands retain the hypothetical learning-pressure scale, and black arrows show proposed developmental dependencies.") %}
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
\def\learningpitch{.9}
\stacknode[feature,susceptibility=4.6]{c}{4.5}{0}{3}{1}
\stacknode[feature,susceptibility=7.4]{d}{4.5}{0}{3}{2}
\stacknode[feature,susceptibility=10]{e}{4.5}{0}{3}{3}
\def\learningpitch{.8}
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
\leftlabel{.4}{Flower cues}
\leftlabel{-.4}{Texture cues}
\halolabel{above=5pt}{c}{Field contexts}
\halolabel{above=5pt}{d}{Green patterns}
\halolabel{above=5pt}{e}{Clustered texture}
\node[align=center] at (2.25,1.85) {Develop shared\\distinctions};
\node[align=center] at (6.75,2.05) {Contextual\\extensions};
\node[align=center] at (2.25,-2.65) {Extend visual\\responses};
\node[align=center] at (6.75,-2.65) {Combine green\\and texture cues};
\rightstacklabel{0}{4}{1}{Green}
\rightstacklabel{0}{4}{2}{Dogs}
\rightstacklabel{0}{4}{3}{Broccoli}
\rightstacklabel{0}{4}{4}{Other\\contexts}
\learningaxis{-4.35}
\learninglegend{-5.5}
\pgfresetboundingbox
\path[use as bounding box] (-2.8,-6.7) rectangle (11.2,3.45);
\end{tikzpicture}
{% end %}

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^coherent]: Chatterjee, S. (2020). [*Coherent Gradients: An Approach to Understanding Generalization in Gradient Descent-based Optimization*](https://arxiv.org/abs/2002.10657).

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.
