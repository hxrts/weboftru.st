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

{% tikz(learning=true, fig_w="620px", caption="<strong>A developmental history.</strong> Observed response categories in one neuron. Arrows suggest developmental links without establishing causation.") %}
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
\developmentaxis{-2.8275}
\responselegend{-4.2775}
\diagramframe{-4.8275}
\end{tikzpicture}
{% end %}

Conventional generalization concerns responses beyond training examples, while Cammarata's recursive generalization describes acquired responses becoming starting points for further learning. Here, path formation describes changes to circuitry that redirect later learning signals. A shared signal can spare downstream detectors from learning the same distinction independently, giving an established pathway a potential advantage over a new one.

## One path leads to another

Cammarata presents a circuit-ecology hypothesis, where established pathways benefit from a head start over their competitors. Gradients from different examples reinforce shared circuitry when they favor compatible parameter updates. As that circuitry reduces prediction error, competing pathways have less remaining error to correct.[^cammarata] The proposed advantage can be explained with learning pressure, the force that training signals exert to change circuitry.

Consider a flower-responsive neuron that also responds weakly to vegetation. Green-object examples could produce compatible gradients that strengthen this response into a green signal for a later broccoli detector. This intermediate acquisition may make broccoli responsiveness easier to learn than it was from the original flower response. The detector's dependence on the green signal gives the earlier mechanism a new computational role.

A synthetic model isolates this mechanism with two readers learning a green-dependent response from competing pathways.[^toy-model] Both feature coefficients and reader weights train: the established route attracts more pressure, which declines as prediction error falls.[^toy-gradients]

{{ tikz(learning=true, source="static/images/clean-toy/competition_gradients.tex", fig_w="620px", caption="<strong>Measured pressure on competing routes.</strong> The established route attracts more learning pressure, which declines as prediction error falls.") }}

Net pressure can conceal opposing reader contributions. Aligned readers reinforce one another; opposed targets can nearly cancel at a shared feature. Connection weights also learn, with stronger signals producing larger read-weight gradients for the same error.

{{ tikz(learning=true, source="static/images/clean-toy/competition_reader_gradients.tex", fig_w="620px", caption="<strong>Where reader pressure comes from.</strong> Aligned readers reinforce a shared feature; opposed readers nearly cancel. Connection gradients also depend on signal strength.") }}

Gradient support alone does not establish lower acquisition cost. That requires fewer optimization steps or examples to reach a specified performance criterion under comparable conditions, with precursor training counted separately.

To test the precursor's contribution, remove the green signal while preserving the flower distinction and other relevant mechanisms, then repeat the same broccoli training. If acquisition takes longer, restoring green should restore the advantage.

## Two paths can represent the same distinction

Cammarata compares InceptionV1 and ConvNeXt neurons that initially respond to rapeseed fields. Field images remain prominent among the ConvNeXt neuron's strongest responses, while dogs and broccoli increasingly displace them in InceptionV1. Displacement from this set does not establish complete loss of responsiveness. The architectures differ, so the comparison cannot isolate the effect of training history.

Consider two networks with the same architecture and flower discrimination, but different learned pathways, under identical subsequent training. In World A, shared circuitry reaches a broccoli target sooner while weakening the flower signal. In World B, a separate route preserves that signal but takes longer to reach the target.

{% tikz(learning=true, fig_w="620px", caption="<strong>One distinction, different developmental routes.</strong> The shared route reaches the broccoli target sooner, with weaker flower activation. Both routes retain flower discrimination.") %}
\begin{tikzpicture}[learning]
\def\responsemarkerscale{.9}
\def\learningheadinglift{.75}
\stageheading{0}{MATCHED CHECKPOINT}{same flower distinction}
\stageheading{4.5}{RESPONSE EXTENSION}{reshaped pathways}
\stageheading{9}{FURTHER LEARNING}{retention and interference}
\foreach \base in {0,-5.0} {
  \foreach \x in {0,4.5,9} { \stageoval{\x,\base} }
}
\pairedrowlabel{0}{WORLD A}
\pairedrowlabel{-5.0}{WORLD B}
\stacknode[feature,activation=7.4]{a}{0}{-5.0}{3}{1}
\stacknode[feature,activation=7.4]{b}{0}{-5.0}{3}{2}
\stacknode[feature,activation=7.4]{c}{0}{-5.0}{3}{3}
\stacknode[feature,activation=7.4]{g}{0}{0}{3}{1}
\stacknode[feature,activation=7.4]{h}{0}{0}{3}{2}
\stacknode[feature,activation=7.4]{i}{0}{0}{3}{3}
\stacknode[feature,activation=7.4]{d}{4.5}{-5.0}{2}{1}
\stacknode[feature,activation=7.4]{e}{4.5}{-5.0}{2}{2}
\stacknode[feature,activation=7.4]{f}{9}{-5.0}{2}{1}
\stacknode[feature,activation=7.4]{broca}{9}{-5.0}{2}{2}
\stacknode[feature,activation=7.4]{j}{4.5}{0}{2}{1}
\stacknode[feature,activation=7.4]{k}{4.5}{0}{2}{2}
\stacknode[feature,activation=7.4]{l}{9}{0}{2}{1}
\stacknode[feature,activation=7.4]{brocb}{9}{0}{2}{2}
\begin{pgfonlayer}{background}
\foreach \source/\target/\clearance in {a/d/2.4pt,b/e/0pt,c/e/0pt,d/f/2.4pt,e/broca/0pt,g/j/2.4pt,g/k/0pt,i/k/0pt,j/l/2.4pt,j/brocb/0pt} {
  \draw[flow,shorten >=\clearance] (\source.center) .. controls ($(\source.center)+(1.62,0)$) and ($(\target.center)+(-1.35,0)$) .. (\target.west);
}
\end{pgfonlayer}
\leftrowlabel{-5.0}{1.05}{Flower\\1.000}
\leftrowlabel{0}{1.05}{Flower\\1.000}
\abovenodelabel{d}{Flower}
\abovenodelabel{e}{Green}
\abovenodelabel{j}{Flower}
\abovenodelabel{k}{Green}
\begin{scope}[yshift=-3pt]
\aboveannotation{6.75}{0}{Learning broccoli reduces\\activation on flower inputs}
\end{scope}
\belowannotation{6.75}{-5.0}{Flower activation preserved\\at greater cost to this target}
\rightstacklabel{0}{2}{1}{Flower\\0.967}
\rightstacklabel{-5.0}{2}{1}{Flower\\1.000}
\foreach \base in {0,-5.0} {
  \rightstacklabel{\base}{2}{2}{Broccoli}
}
\preparelearningfooter{2.7}
\developmentaxis{\learningaxisy}
\foreach \marked in {a,d,f,g,j,l} { \responsetrait{\marked} }
\node[feature,activation=7.4] at (.3,\learninglegendy) {};
\node[legendlabel] at (.7,\learninglegendy) {Mechanism};
\node[feature,activation=7.4] (flowerkey) at (5.3,\learninglegendy) {};
\responsetrait{flowerkey}
\node[legendlabel] at (5.7,\learninglegendy) {Flower-responsive};
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}

A stricter target can reverse this advantage. Under a shared capacity constraint, strengthening green weakens flower and slows further acquisition, allowing the separate route to become cheaper. The toy realizes both orderings under the same imposed constraint.[^toy-targets]

{{ tikz(learning=true, source="static/images/clean-toy/acquisition_comparison.tex", fig_w="620px", caption="<strong>The acquisition target changes the advantage.</strong> A stricter target reverses the cost advantage. Flower classification remains correct in both cases.") }}

Weaker activation need not erase a distinction: both routes still classify flower inputs correctly. Response magnitude, binary responsiveness, and reader performance are separate measurements.

Across a population, some pathways may gain new uses while others lose an earlier response. These changes can offset each other, leaving an aggregate measurement unchanged as the network reorganizes.

## Learning pressure changes roles and responses

A stable average can conceal changes in both contribution and response. Extend the hypothetical flower pathway to two earlier mechanisms, A and B, of which only A is flower-responsive. A contributes three later pathways and B contributes one. Each pathway includes its own learned transformation, so one branch can lose flower responsiveness while the others retain it.

Price's equation separates changes due to differential contribution from changes in inherited traits.[^price] In this example, each later pathway receives one unit of weight attributed to a single earlier mechanism. Let $z$ code flower responsiveness as 1 or 0 under a fixed assay, and let $w$ count attributed later pathways within a declared set of downstream tasks.[^price-accounting] With $\bar w$ the mean weight and $\Delta z$ each ancestor's mean inherited response change, the population mean changes by[^price-weights]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{transmission}}.
```

Weighting A three times and B once raises the initial mean of ½ to ¾. If one of A's three pathways loses the flower response, the final mean returns to ½. Selection contributes +¼ and transmission contributes −¼, revealing opposing changes concealed by the unchanged mean. This preserves the measured fraction of responsive pathways, without establishing that flower discrimination remains available to its readers.

{% tikz(learning=true, preamble="static/images/clean-toy/price_gradient_values.tex", fig_w="620px", caption="<strong>Change concealed by a stable mean.</strong> Selection +¼ and transmission −¼ cancel. Only A₃ receives pressure that reduces flower responsiveness; the middle column isolates reweighting.") %}
\begin{tikzpicture}[learning]
% Slightly smaller markers for the accounting inset and its trait legend.
\tikzset{feature/.append style={minimum size=4.2pt},trait/.append style={minimum size=9pt}}
\stageheading{0}{BASELINE}{50\% flower-responsive}
\stageheading{4.5}{AFTER REWEIGHTING}{75\% flower-responsive}
\stageheading{9}{FINAL POPULATION}{50\% flower-responsive}
\foreach \x in {0,9} { \stageoval{\x,0} }
\stacknode[feature]{a}{0}{0}{2}{1}
\stacknode[feature]{b}{0}{0}{2}{2}
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
\foreach \source/\target/\bandwidth/\halfwidth/\bandsign in {a/g/\FoneBandWidth/\FoneBandHalfWidth/\FoneBandSign,a/h/\FtwoBandWidth/\FtwoBandHalfWidth/\FtwoBandSign,a/i/\GreenBandWidth/\GreenBandHalfWidth/\GreenBandSign,b/j/\TextureBandWidth/\TextureBandHalfWidth/\TextureBandSign} {
  \ifdim\bandwidth>0pt
    \coordinate (pressurestart) at ($(\source.center)+(.42,0)$);
    \coordinate (pressureone) at ($(\source.center)+(3,0)$);
    \coordinate (pressuretwo) at ($(\target.center)+(-3,0)$);
    \ifnum\bandsign>0
      \pressureband{\target.center}{pressuretwo}{pressureone}{pressurestart}{\halfwidth}
    \else
      \suppressband{\target.center}{pressuretwo}{pressureone}{pressurestart}{\halfwidth}
    \fi
  \fi
}
\foreach \source/\target/\clearance in {a/g/4.9pt,a/h/4.9pt,a/i/2.5pt,b/j/2.5pt} {
  \draw[flow,shorten >=\clearance] (\source.center)
    .. controls ($(\source.center)+(3,0)$) and ($(\target.center)+(-3,0)$)
    .. (\target.center);
}
\end{pgfonlayer}
\leftlabel{.5}{A}
\leftlabel{-.5}{B}
\rightstacklabel{0}{4}{1}{A$\mathsf{_1}$}
\rightstacklabel{0}{4}{2}{A$\mathsf{_2}$}
\rightstacklabel{0}{4}{3}{A$\mathsf{_3}$}
\rightstacklabel{0}{4}{4}{B$\mathsf{_1}$}
\foreach \name in {a,c,d,e,g,h} { \responsetrait{\name} }


\belowannotation{2.25}{0}{Selection: +\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}\\Flower pathways\\contribute more}
\belowannotation{6.75}{0}{Transmission: $\mathsf{-}$\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}\\One pathway loses\\flower responsiveness}
\preparelearningfooter{2.65}
% A broken development axis opens into the accounting inset, not a third state.
\draw[line width=.85pt,line cap=round] (0,\learningaxisy) -- (4.45,\learningaxisy);
\draw[flow,line cap=round] (4.55,\learningaxisy) -- (9,\learningaxisy);
\draw[line width=.85pt,line cap=round] (4.375,{\learningaxisy-.15}) -- (4.525,{\learningaxisy+.15});
\draw[line width=.85pt,line cap=round] (4.475,{\learningaxisy-.15}) -- (4.625,{\learningaxisy+.15});
\node[anchor=north] at (4.5,{\learningaxisy-.25}) {Development};
\node[feature] (keyyes) at (.3,\learninglegendy) {};
\responsetrait{keyyes}
\node[legendlabel] at (.7,\learninglegendy) {Flower-responsive};
\node[feature] at (5.3,\learninglegendy) {};
\node[legendlabel] at (5.7,\learninglegendy) {Not flower-responsive};
\node at (4.5,\learningpressurelegendy) {Flower pressure: A$\mathsf{_3}$ $\mathsf{\GreenPressure}$; other branches zero};
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}



These bands measure flower pressure only. A₁ and A₂ retain their flower response while losing their inherited green response; A₃ loses flower responsiveness as it specializes toward green. In the capacity-constrained example, by contrast, flower weakens through the constraint projection rather than a direct flower-loss gradient.

Learning pressure can influence both contributions, but Price selection measures differential weighting under the declared ancestry rule. Following neuron coordinates one-to-one with equal weights would give zero selection despite substantial learning. The decomposition accounts for the measured change without identifying its causes. To understand its computational consequences, the attributed pathways must be traced to their consumers.

## How learning builds understandable structure

The unchanged mean leaves open whether flower signals still reach the readers that need them. Suppose A's two responsive pathways supply flower detectors, while its third supplies a green signal that combines with B's texture signal in a broccoli detector. Trace those inputs, then suppress each pathway in turn and measure reader performance on fixed positive and negative examples. A change in the broccoli detector's behavior when its green input is suppressed tests whether that reader actually uses the signal.

Apply Price within each reader group, comparing its final pathways with the common initial population. Both flower pathways descend from A, so reweighting raises the responsive fraction from ½ to 1, giving selection +½ and transmission zero. Broccoli receives one pathway from each ancestor, so weighting leaves the mean unchanged, while loss of A's response gives transmission −½. Averaging over the two equally sized groups recovers the global +¼ and −¼, accounting for pathway composition rather than changes in reader performance.[^price-readers]

Swap the consumers while retaining the same ancestry and response changes, and the global decomposition stays unchanged. The flower reader now receives the green and texture pathways. Price still accounts for pathway composition, but this does not guarantee that each reader receives useful inputs.

To test how readers shape those inputs, a separate experiment trains pathways and read gains directly from reader errors, without local role targets. Both routing conditions start from the same ancestor copies: A₁, A₂, and A₃ inherit A's flower and green responses; B₁ inherits B's texture response. The panels compare gradients after ten updates under each assignment.

{{ tikz(learning=true, source="static/images/clean-toy/downstream_reader_gradients.tex", fig_w="620px", caption="<strong>Where signals go shapes how they learn.</strong> Coherent and swapped routing at step 10. Bands show pressure on green responses (left) and read gains (right).") }}

With coherent routing, flower-reader errors suppress green in A₁ and A₂, while broccoli-reader errors strengthen it in A₃. Swapping the readers redirects that pressure: the flower reader now suppresses green in A₃ and B₁. Both assignments eventually regain correct classification, though response errors remain larger after the swap. Disruption at a fixed checkpoint need not persist when learning resumes.

## What persists through learning?

Even when the final signals serve the same readers, their ancestry can differ. Instead of A supplying the flower pathways, suppose A supplies only green, while B contributes texture and two pathways that acquire flower responsiveness. Both histories end with two responsive pathways out of four, serving the same declared computational roles.

In the second history, differential contribution favors the initially nonresponsive B, so selection is −¼. Response changes contribute +¼ through transmission, reversing the first history's terms while preserving its final mean. Equivalent signals can therefore serve the same readers even when different ancestral pathways acquired them. This endpoint comparison leaves their availability during training unresolved.

{% tikz(learning=true, fig_w="620px", caption="<strong>The same signals, different ancestry.</strong> Equivalent reader functions can arise from different ancestors, with opposite Price terms.") %}
\begin{tikzpicture}[learning]
\def\learningheadinglift{.75}
\tikzset{feature/.append style={minimum size=4.2pt},trait/.append style={minimum size=9pt},reader/.style={rectangle,draw,fill=white,minimum size=6pt,inner sep=0pt,line width=.65pt}}
\stageheading{0}{BASELINE}{earlier mechanisms}
\stageheading{4.5}{FINAL PATHWAYS}{learned signals}
\stageheading{9}{READERS}{same final checkpoint}
\pairedrowlabel{0}{HISTORY A}
\pairedrowlabel{-5.6}{HISTORY B}
\foreach \base in {0,-5.6} {
  \foreach \x in {0,4.5,9} { \stageoval{\x,\base} }
}
\stacknode[feature]{ua}{0}{0}{2}{1}
\stacknode[feature]{ub}{0}{0}{2}{2}
\stacknode[feature]{u1}{4.5}{0}{4}{1}
\stacknode[feature]{u2}{4.5}{0}{4}{2}
\stacknode[feature]{u3}{4.5}{0}{4}{3}
\stacknode[feature]{u4}{4.5}{0}{4}{4}
\stacknode[reader]{uflower}{9}{0}{2}{1}
\stacknode[reader]{ubroccoli}{9}{0}{2}{2}
\leftrowlabel{0}{.5}{A}
\leftrowlabel{0}{-.5}{B}
\abovenodelabel{u1}{A$\mathsf{_1}$ Flower}
\abovenodelabel{u2}{A$\mathsf{_2}$ Flower}
\abovenodelabel{u3}{A$\mathsf{_3}$ Green}
\abovenodelabel{u4}{B$\mathsf{_1}$ Texture}
\rightstacklabel{0}{2}{1}{Flower\\detectors}
\rightstacklabel{0}{2}{2}{Broccoli\\detector}
\begin{pgfonlayer}{background}
\draw[flow,shorten >=4.9pt] (ua.center) .. controls ($(ua.center)+(1.62,0)$) and ($(u1.center)+(-1.35,0)$) .. (u1.center);
\draw[flow] (u1.center) .. controls ($(u1.center)+(1.62,0)$) and ($(uflower.center)+(-1.35,0)$) .. (uflower.west);
\draw[flow,shorten >=4.9pt] (ua.center) .. controls ($(ua.center)+(1.62,0)$) and ($(u2.center)+(-1.35,0)$) .. (u2.center);
\draw[flow] (u2.center) .. controls ($(u2.center)+(1.62,0)$) and ($(uflower.center)+(-1.35,0)$) .. (uflower.west);
\draw[flow,shorten >=2.5pt] (ua.center) .. controls ($(ua.center)+(1.62,0)$) and ($(u3.center)+(-1.35,0)$) .. (u3.center);
\draw[flow] (u3.center) .. controls ($(u3.center)+(1.62,0)$) and ($(ubroccoli.center)+(-1.35,0)$) .. (ubroccoli.west);
\draw[flow,shorten >=2.5pt] (ub.center) .. controls ($(ub.center)+(1.62,0)$) and ($(u4.center)+(-1.35,0)$) .. (u4.center);
\draw[flow] (u4.center) .. controls ($(u4.center)+(1.62,0)$) and ($(ubroccoli.center)+(-1.35,0)$) .. (ubroccoli.west);
\end{pgfonlayer}
\foreach \name in {ua,u1,u2} { \responsetrait{\name} }
\stacknode[feature]{va}{0}{-5.6}{2}{1}
\stacknode[feature]{vb}{0}{-5.6}{2}{2}
\stacknode[feature]{v1}{4.5}{-5.6}{4}{1}
\stacknode[feature]{v2}{4.5}{-5.6}{4}{2}
\stacknode[feature]{v3}{4.5}{-5.6}{4}{3}
\stacknode[feature]{v4}{4.5}{-5.6}{4}{4}
\stacknode[reader]{vflower}{9}{-5.6}{2}{1}
\stacknode[reader]{vbroccoli}{9}{-5.6}{2}{2}
\leftrowlabel{-5.6}{.5}{A}
\leftrowlabel{-5.6}{-.5}{B}
\abovenodelabel{v1}{B$\mathsf{_1}$ Flower}
\abovenodelabel{v2}{B$\mathsf{_2}$ Flower}
\abovenodelabel{v3}{A$\mathsf{_1}$ Green}
\abovenodelabel{v4}{B$\mathsf{_3}$ Texture}
\rightstacklabel{-5.6}{2}{1}{Flower\\detectors}
\rightstacklabel{-5.6}{2}{2}{Broccoli\\detector}
\begin{pgfonlayer}{background}
\draw[flow,shorten >=4.9pt] (vb.center) .. controls ($(vb.center)+(1.62,0)$) and ($(v1.center)+(-1.35,0)$) .. (v1.center);
\draw[flow] (v1.center) .. controls ($(v1.center)+(1.62,0)$) and ($(vflower.center)+(-1.35,0)$) .. (vflower.west);
\draw[flow,shorten >=4.9pt] (vb.center) .. controls ($(vb.center)+(1.62,0)$) and ($(v2.center)+(-1.35,0)$) .. (v2.center);
\draw[flow] (v2.center) .. controls ($(v2.center)+(1.62,0)$) and ($(vflower.center)+(-1.35,0)$) .. (vflower.west);
\draw[flow,shorten >=2.5pt] (va.center) .. controls ($(va.center)+(1.62,0)$) and ($(v3.center)+(-1.35,0)$) .. (v3.center);
\draw[flow] (v3.center) .. controls ($(v3.center)+(1.62,0)$) and ($(vbroccoli.center)+(-1.35,0)$) .. (vbroccoli.west);
\draw[flow,shorten >=2.5pt] (vb.center) .. controls ($(vb.center)+(1.62,0)$) and ($(v4.center)+(-1.35,0)$) .. (v4.center);
\draw[flow] (v4.center) .. controls ($(v4.center)+(1.62,0)$) and ($(vbroccoli.center)+(-1.35,0)$) .. (vbroccoli.west);
\end{pgfonlayer}
\foreach \name in {va,v1,v2} { \responsetrait{\name} }
\begin{scope}[yshift=-3pt]
\aboveannotation{2.25}{0}{\pricecomponents{+\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}}{$\mathsf{-}$\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}}}
\aboveannotation{6.75}{0}{Flower response retained\\in A-derived pathways}
\end{scope}
\belowannotation{2.25}{-5.6}{\pricecomponents{$\mathsf{-}$\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}}{+\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}}}
\belowannotation{6.75}{-5.6}{Flower response acquired\\in B-derived pathways}
\preparelearningfooter{2.65}
\draw[flow] (.3,\learningaxisy) -- (4.2,\learningaxisy);
\node[anchor=north] at (2.25,{\learningaxisy-.25}) {Training interval};
\draw[flow] (4.8,\learningaxisy) -- (8.7,\learningaxisy);
\node[anchor=north] at (6.75,{\learningaxisy-.25}) {Downstream input};
\node[feature] (keyyes) at (.3,\learninglegendy) {};
\responsetrait{keyyes}
\node[legendlabel] at (.7,\learninglegendy) {Flower-responsive};
\node[feature] at (5.3,\learninglegendy) {};
\node[legendlabel] at (5.7,\learninglegendy) {Not flower-responsive};
\node[reader] at (.3,\learningpressurelegendy) {};
\node[legendlabel] at (.7,\learningpressurelegendy) {Downstream reader};
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}

Continuity requires evaluating the same readers on fixed inputs throughout training. Two histories can reach equivalent functions at different times, and retaining an ancestor's response does not guarantee accurate readers along the way.

A final circuit can show how a flower distinction is computed and used, while leaving its developmental origin unresolved. Following pathways across training identifies which earlier signals contributed to that capability, and Price separates changes in their contribution from changes in their responses. Connecting that history to the readers' dependencies and measured performance reveals where development preserved useful distinctions and where it disrupted them.

Established signals can lower acquisition costs as new readers learn to use them, with the advantage depending on the required performance and interference with existing uses. Those dependencies channel subsequent gradients, which can reinforce shared distinctions when the readers' demands are compatible. This feedback offers a developmental explanation for how Cammarata's recursive generalization can produce mechanisms organized for downstream use. Learning builds the machinery of its own future learning.

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^toy-model]: The synthetic experiments use flower, green, and texture cues. Acquisition trains a green coefficient under a fixed broccoli readout; competition trains both features and readers; downstream learning trains all pathway coordinates and read gains from reader errors; its diagram shows only green-coordinate and read-gain gradients. The Price illustration instead uses prescribed role targets and registered ancestry. These experiments instantiate possible mechanisms, not measurements of Cammarata's neuron.

[^toy-gradients]: Band width encodes the absolute loss derivative, averaged over the interval in the checkpoint diagram. Taper indicates the sign of descent pressure, $-\partial L/\partial\theta$: wide-left increases the parameter, wide-right decreases it. Scales differ between figures and parameter types; zero gradients have no band. Exact intervals, scales, and values are in the [pathway measurements](/images/clean-toy/gradient_band_measurements.csv) and [reader measurements](/images/clean-toy/reader_gradient_band_measurements.csv); the [training trace](/images/clean-toy/downstream_reader_training.csv) records reader performance.

[^toy-targets]: Both routes obey $f^2+g^2\leq1.30^2$ and initially compute the same flower function. The shared route starts with green response 0.8, the separate route at zero. Acquisition requires the plotted positive score and negative scores below 0.10; counts exclude precursor training. Both retain perfect flower classification on all eight binary inputs at decision threshold 0.5. Output scores are not calibrated probabilities.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.

[^price-accounting]: Take equally weighted baseline mechanisms with responses $z_i$ on a fixed flower assay, including fixed controls and a responsiveness criterion. Fix the downstream tasks and ancestry rule before calculating the decomposition. Later pathways include learned transformations whose outputs are measured by the same assay. Ancestry records attributed contributions to those pathways, rather than neuron reproduction.

[^price-weights]: Assign each included later use one unit of credit, divided among its registered ancestors, and exclude unassigned uses from this population. Let $w_i\geq0$ be an ancestor's total credit and $\Delta z_i$ its credit-weighted descendant mean response minus $z_i$, set to zero when $w_i=0$. Expectations and covariance use the baseline population, $\bar w=\mathbb E[w]>0$, and $\Delta\bar z$ is the later attributed-use mean minus the baseline mean.[^price1972][^frank1997]

[^price-readers]: For each reader group, count only descendant credit assigned to pathways serving that group, retaining the full baseline population and its mean. The resulting terms compare the final group with that common baseline, not with an earlier version of the group. Weighting group terms by their shares of total descendant credit recovers the global terms. Here each pathway serves one declared group, and each group contains two pathways.
