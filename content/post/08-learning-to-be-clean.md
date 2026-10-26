+++
title = "Learning to Be Clean"
date = 2026-10-20
description = "How neural networks build coherent structure."
slug = "learning-to-be-clean"
aliases = ["/post/next-to-godliness/"]

[extra]
cover_image = "/images/byte-neuron.png"
cover_caption = "Byte Magazine, August 1979"
+++

## Developmental flow

What a neural network learns changes what it can learn next. A useful pathway can become a starting point for further learning, but its history explains only part of how the network develops. How do these individual developments produce an organized computational system?

In *Neural Networks Are Already Clean*, Nick Cammarata explains what he means by cleanliness.

> When I say neural networks are already clean, I mean something deeper than neuron monosemanticity, although even by that standard, I think things look much better than the field expects. I mean that a network’s parts are built to be read, and built upon, by its downstream readers.[^cammarata]

Following a mechanism through training offers a way to investigate how it becomes useful to those readers. Cammarata follows a neuron in a retrained InceptionV1 model whose strongest responses initially come from yellow-flower images, some with dogs. Green objects and dogs without flowers appear later, followed by broccoli. The observed sequence motivates his developmental explanation, while leaving the causal links between specific responses open.

{% tikz(learning=true, fig_w="620px", caption="<strong>A developmental history.</strong> A schematic of the response sequence Cammarata reports. Arrows suggest links between responses without establishing causation.") %}
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

Cammarata calls the branching of responses across related inputs "recursive generalization." His proposed explanation is that existing mechanisms give related learning a head start.

I use *path formation* to examine how those acquisitions change later learning opportunities. The synthetic experiments below connect two views of development. Tracing particular pathways supplies histories whose causal relationships can be tested, while Price accounting separates changes in their relative representation from changes in inherited responses. Explaining how learning produces useful organization requires connecting these population changes to the mechanisms that cause them.

## One path leads to another

In Cammarata's circuit-ecology hypothesis, established mechanisms and their readers can learn related tasks faster than competitors starting fresh. Capturing the remaining error gives them an advantage that can compound through further reuse. He proposes this race as an explanation for recursive generalization.[^cammarata]

The analysis here makes one part of that hypothesis explicit through learning pressure, measured as the direction and strength of the negative loss gradient on a parameter. Gradients from different examples reinforce shared circuitry when they favor compatible updates. As prediction error falls, the learning signals available to competing pathways can weaken.

Applied to the flower example, this suggests a possible mechanism. A flower-responsive neuron might also respond weakly to vegetation. Green-object examples could produce compatible gradients that strengthen this response into a green signal for a later broccoli detector. This intermediate acquisition may make broccoli responsiveness easier to learn than it was from the original flower response.

A broccoli detector that uses the green signal would give the earlier mechanism a new computational role. This is the causal interpretation explored below, rather than a measured dependency in Cammarata's flower neuron.

I built flower-toy to explore these relationships using flower, green, and texture cues.[^toy-model] Controlled changes to circuitry and training isolate acquisition cost, inheritance, and downstream learning. Each experiment has its own initialization and training conditions, chosen to examine a consequence of the proposed mechanism.

In the first experiment, I trained two readers on a green-dependent response from competing pathways. Both feature coefficients and reader weights train. The established route attracts more pressure, which declines as prediction error falls.[^toy-gradients]

{{ tikz(learning=true, source="static/images/flower-toy/competition_gradients.tex", fig_w="620px", caption="<strong>Measured pressure on competing routes.</strong> The established route attracts more learning pressure, which declines as prediction error falls.") }}

Aligned readers reinforce one another, while the net pressure of opposed targets may cancel at a shared feature, concealing reader contributions.

The weights carrying signals to downstream readers also learn. For the same prediction error, a stronger input creates greater learning pressure to change how strongly the reader uses that signal.

{{ tikz(learning=true, source="static/images/flower-toy/competition_reader_gradients.tex", fig_w="620px", caption="<strong>Where reader pressure comes from.</strong> Readers can exert reinforcing or opposing pressures on a shared feature. Weak net pressure can conceal strong competing contributions. Band taper distinguishes pressure to increase a parameter from pressure to decrease it.") }}

An established green signal can reduce how much new learning broccoli detection requires. The advantage comes from a useful distinction that earlier training has already supplied, allowing the subsequent detector to build on it. This gives a candidate explanation for one developmental route, whose advantage depends on the training conditions.

## Two paths can represent the same distinction

Cammarata compares neurons in InceptionV1 and ConvNeXt that initially respond to yellow-flower fields. The ConvNeXt neuron stays focused on fields, while the InceptionV1 neuron's strongest responses shift toward dogs and broccoli. To examine how learned pathways affect later acquisition, I compared two toy networks under matched training conditions.

The two toy networks share an architecture and flower discrimination but have different learned pathways. Both receive identical subsequent training. In World A, shared circuitry reaches a broccoli target earlier in training at the expense of weakening the flower signal. In World B, a separate route preserves that signal but requires training an entirely new route to the target.

{% tikz(learning=true, fig_w="620px", caption="<strong>One distinction, different developmental routes.</strong> The shared route reaches the broccoli target earlier in training, but shows weaker flower activation. Both routes retain flower discrimination.") %}
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
\leftrowlabel{-5.0}{1.05}{Flower\\1.00}
\leftrowlabel{0}{1.05}{Flower\\1.00}
\abovenodelabel{d}{Flower}
\abovenodelabel{e}{Green}
\abovenodelabel{j}{Flower}
\abovenodelabel{k}{Green}
\begin{scope}[yshift=-3pt]
\aboveannotation{6.75}{0}{Learning broccoli reduces\\activation on flower inputs}
\end{scope}
\belowannotation{6.75}{-5.0}{Flower activation preserved\\at greater training cost}
\rightstacklabel{0}{2}{1}{Flower\\0.97}
\rightstacklabel{-5.0}{2}{1}{Flower\\1.00}
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

A distinction can persist despite weaker activation. Both routes preserve flower classification, but the weaker signal may affect other downstream uses.

Following either route explains a particular acquisition, but does not establish how widely such routes contribute across a network. Some pathways can gain new uses while others lose responsiveness. To connect these local developments to population change, their relative representation and inherited responses must be measured separately.

## How roles and responses change

Across inherited pathways, an unchanged average can conceal a redistribution of the mechanisms supplying a distinction. How much change comes from ancestors supplying more pathways, and how much comes from inherited responses changing?

In the synthetic flower model, $\mathsf{A}$ initially responds to flowers, while $\mathsf{B}$ supplies texture without responding to flowers on the same assay. Three later pathways descend from $\mathsf{A}$ and one from $\mathsf{B}$. Two of $\mathsf{A}$'s descendants retain flower responsiveness, while the third specializes toward green and loses its flower response.

The flower-responsive share stays at ½, even though $\mathsf{A}$ now supplies ¾ of the pathways. Its increased representation is offset by a change in what one descendant detects. I specified the ancestry and local response targets in this experiment, then trained the descendants to fit those targets.

Price accounting has previously been applied to evolutionary algorithms and neural learning.[^price-learning] Here, I use it to measure how differential representation and response change contribute to the population mean. The equation separates selection, change due to differential contribution, from variation, change in inherited responses.[^price][^price-variation]

Let $z$ record flower responsiveness on a fixed assay and $w$ count the later pathways attributed to each earlier mechanism.[^price-accounting] With $\bar w$ the average descendant count and $\Delta z$ each mechanism's average inherited response change, the population mean changes by[^price-weights]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{variation}}.
```

Weighting the initial responses by $\mathsf{A}$'s three pathways and $\mathsf{B}$'s one raises the responsive share from ½ to ¾, giving selection +¼. Losing the response in one of $\mathsf{A}$'s pathways subtracts ¼ through variation. Preferential contribution from flower-responsive ancestry therefore offsets inherited response loss, leaving the overall share unchanged.

{% tikz(learning=true, preamble="static/images/flower-toy/price_gradient_values.tex", fig_w="620px", caption="<strong>Controlled construction. Change concealed by a stable mean.</strong> Selection +¼ offsets variation −¼. The open middle column isolates reweighting under the stipulated ancestry. Bands show measured flower pressure, −0.029 on A₃ and zero on the other pathways.") %}
\begin{tikzpicture}[learning]
% Slightly smaller markers for the accounting inset and its trait legend.
\tikzset{feature/.append style={minimum size=4.2pt},trait/.append style={minimum size=9pt}}
\stageheading{0}{BASELINE}{50\% flower-responsive}
\stageheading{4.5}{REWEIGHTING}{calculation, 75\% responsive}
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


\belowannotation{2.25}{0}{Selection: +\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}\\Flower ancestry\\supplies more pathways}
\belowannotation{6.75}{0}{Variation: $\mathsf{-}$\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}\\One pathway loses\\flower responsiveness}
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
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}

Each pathway counts once, so selection measures the share of attributed pathway uses. Three nearly unused pathways still outweigh one heavily used pathway in this calculation. Functional influence requires additional evidence about reader gains or the effect of removing a signal. A contribution-weighted analysis would need a declared, nonnegative attribution rule supported by those measurements.

The positive selection term shows that initially flower-responsive mechanisms gain representation, while negative variation shows that their descendants lose some responsiveness. These are separate outcomes for a developmental explanation to account for, even when the mean stays fixed. The stipulated ancestry illustrates this distinction without establishing why one mechanism gains more uses.

A model of training dynamics supplies the causal explanation. Direct learning pressure and competition for shared capacity can each weaken an earlier response.[^toy-roles] Price records the resulting inherited change, while its selection term measures differential representation under the declared ancestry rule. The gradient measurements and the Price terms describe different aspects of development.

Connecting these views requires locating population changes within actual computational relationships. Does the flower signal reach its readers through retained responsiveness or through newly acquired responses?

## How learning builds understandable structure

Tracing pathways to their readers gives the population accounting a computational interpretation. The same global terms can conceal different inheritance within the computations a network serves. To examine what it misses, I constructed two histories with three descendants of $\mathsf{A}$ and one of $\mathsf{B}$. Both finish with two flower pathways, a green pathway, and a texture pathway supplying identical readers.

In History I, two $\mathsf{A}$ descendants retain flower responsiveness, its third supplies green, and $\mathsf{B}$ supplies texture. In History II, one $\mathsf{A}$ descendant retains flower responsiveness and a $\mathsf{B}$ descendant acquires it. The other two $\mathsf{A}$ descendants learn green and texture. Training fits the same prescribed role targets in both histories, preserving the broccoli reader's required signals as well as the flower outputs.

Their global Price terms are identical, selection +¼ and variation −¼. Final reader outputs also agree on all eight toy inputs. Tracing ancestry into each reader group reveals what those matches conceal.[^price-readers]

| Reader group | History | Selection | Variation | Responsive share |
|---|---|---|---|---|
| Flower | I | +½ | 0 | 1 |
| Broccoli | I | 0 | −½ | 0 |
| Flower | II | 0 | +½ | 1 |
| Broccoli | II | +½ | −1 | 0 |

Each group is compared with the full initial population. Averaging the equally sized groups recovers the global terms in either history. History I supplies flower readers entirely through retained responsiveness, while History II combines retention with acquisition from a previously nonresponsive ancestor. The final responsive shares alone hide this difference.

{% tikz(learning=true, fig_w="620px", caption="<strong>Controlled construction. Matched outputs, different inherited roles.</strong> Both histories have three A descendants, one B descendant, and equivalent final reader outputs. Flower-reader Price terms distinguish retention from acquisition through B. Ancestry and role targets are declared.") %}
\begin{tikzpicture}[learning]
\def\learningheadinglift{.75}
\tikzset{feature/.append style={minimum size=4.2pt},trait/.append style={minimum size=9pt},reader/.style={rectangle,draw,fill=white,minimum size=6pt,inner sep=0pt,line width=.65pt}}
\stageheading{0}{BASELINE}{earlier mechanisms}
\stageheading{4.5}{FINAL PATHWAYS}{learned signals}
\stageheading{9}{READERS}{equivalent final functions}
\pairedrowlabel{0}{HISTORY I}
\pairedrowlabel{-5.6}{HISTORY II}
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
\abovenodelabel{v1}{A$\mathsf{_1}$ Flower}
\abovenodelabel{v2}{B$\mathsf{_1}$ Flower}
\abovenodelabel{v3}{A$\mathsf{_2}$ Green}
\abovenodelabel{v4}{A$\mathsf{_3}$ Texture}
\rightstacklabel{-5.6}{2}{1}{Flower\\detectors}
\rightstacklabel{-5.6}{2}{2}{Broccoli\\detector}
\begin{pgfonlayer}{background}
\draw[flow,shorten >=4.9pt] (va.center) .. controls ($(va.center)+(1.62,0)$) and ($(v1.center)+(-1.35,0)$) .. (v1.center);
\draw[flow] (v1.center) .. controls ($(v1.center)+(1.62,0)$) and ($(vflower.center)+(-1.35,0)$) .. (vflower.west);
\draw[flow,shorten >=4.9pt] (vb.center) .. controls ($(vb.center)+(1.62,0)$) and ($(v2.center)+(-1.35,0)$) .. (v2.center);
\draw[flow] (v2.center) .. controls ($(v2.center)+(1.62,0)$) and ($(vflower.center)+(-1.35,0)$) .. (vflower.west);
\draw[flow,shorten >=2.5pt] (va.center) .. controls ($(va.center)+(1.62,0)$) and ($(v3.center)+(-1.35,0)$) .. (v3.center);
\draw[flow] (v3.center) .. controls ($(v3.center)+(1.62,0)$) and ($(vbroccoli.center)+(-1.35,0)$) .. (vbroccoli.west);
\draw[flow,shorten >=2.5pt] (va.center) .. controls ($(va.center)+(1.62,0)$) and ($(v4.center)+(-1.35,0)$) .. (v4.center);
\draw[flow] (v4.center) .. controls ($(v4.center)+(1.62,0)$) and ($(vbroccoli.center)+(-1.35,0)$) .. (vbroccoli.west);
\end{pgfonlayer}
\foreach \name in {va,v1,v2} { \responsetrait{\name} }
\begin{scope}[yshift=-3pt]
\aboveannotation{2.25}{0}{Global\\\pricecomponents{+\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}}{$\mathsf{-}$\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}}}
\aboveannotation{6.75}{0}{Flower readers\\Selection: +\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{2}\\Variation: 0}
\end{scope}
\belowannotation{2.25}{-5.6}{Global\\\pricecomponents{+\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}}{$\mathsf{-}$\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{4}}}
\belowannotation{6.75}{-5.6}{Flower readers\\Selection: 0\\Variation: +\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{2}}
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
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}

Dependency tracing identifies which ancestral pathways supply each reader. Conditioning Price on those relationships quantifies how differential representation and inherited response change contribute within each reader group. The combined analysis distinguishes retention from new acquisition where global accounting and final outputs agree. A causal explanation must then account for the measured pattern of retention and acquisition within each group.

The matched histories establish what the accounting distinguishes under prescribed ancestry. To connect that accounting to a causal learning process, I also trained two persistent routes whose responses and allocation to readers change together. Each reader learns nonnegative routing shares that sum to one, starting with equal shares. The broccoli reader combines its routed signal with a fixed texture input.[^toy-routing]

Here the population weights measure routing allocation, replacing the unit pathway counts above. The trait is continuous flower contrast, so it can become negative or exceed one. Selection measures changing allocation to the initially flower-responsive route, while variation measures changes in the routes' flower responses. Both are calculated from the same trajectory as the reader gradients.

{{ tikz(learning=true, source="static/images/flower-toy/learned_routing.tex", learning_centers="0 9", fig_w="620px", caption="<strong>Reader pressure with learned and frozen routing.</strong> Reader errors modify shared flower responses and, when routing learns, their allocation. Bands show applied descent directions at update 10, with frozen routing receiving no updates. Feature and logit bands use separate scales, shared across conditions. The fixed texture input to broccoli is omitted.") }}

The table accounts for flower-contrast change after 800 updates with learned routing, relative to the initial mean of 0.50. The global row weights both reader groups equally, with values rounded to two decimal places.

| Reader group | Selection | Variation | Final mean flower contrast |
|---|---|---|---|
| Flower | +0.22 | +0.19 | 0.91 |
| Broccoli | −0.23 | −0.11 | 0.16 |
| Global | −0.01 | +0.04 | 0.54 |

After 800 updates, the flower reader assigns about 72% of its routing share to the initially flower-responsive route, while broccoli assigns about 27%. Their opposing allocation changes nearly cancel globally. Freezing the routing shares at one half forces selection to zero and leaves broccoli classification at 75%, compared with 100% when routing learns. Within this model, allowing reader-specific allocation improves computation, and Price quantifies how that allocation develops alongside the responses.

Removing the initial green response changes both contributions, while restoring it reproduces the intact trajectory. Removal actually lowers final response error in this joint-learning setting. The precursor advantage in the earlier acquisition experiment therefore depends on what is being learned and how readers compete for shared signals. The intervention identifies an effect of the precursor, and the decomposition locates its consequences in allocation and response change.

A separate experiment confirms that exchanging fixed reader assignments redirects learning pressure on their input pathways.[^toy-reader-training]

These experiments connect reader demands to changes in allocation and signals. Price measures those developments, while interventions identify effects of particular learning conditions. Following these relationships through time raises a further question about whether a capability remains available throughout the changes.

## What learning carries forward

Ancestral retention and continuous availability are different properties. The original history retains flower responsiveness in $\mathsf{A}$ descendants. A history in which $\mathsf{B}$ supplies both flower pathways instead reverses the global terms to selection −¼ and variation +¼, while reaching equivalent reader outputs. Neither endpoint comparison establishes whether flower discrimination remained available throughout learning.

To distinguish continuous availability from recovery, I changed the order in which two pathways acquire and lose flower responsiveness. Two pathways supply a fixed flower reader, which averages their flower signals. Initially $\mathsf{A}$ responds and $\mathsf{B}$ does not. Both schedules train $\mathsf{B}$ to acquire the response and $\mathsf{A}$ to lose it, with identical targets and update budgets.[^toy-continuity]

In the continuous handoff, $\mathsf{B}$ learns first, so the reader retains flower discrimination as $\mathsf{A}$ changes. Reversing the order interrupts discrimination before $\mathsf{B}$ restores it. The schedules end with identical pathway parameters and reader outputs, with zero selection and zero net variation under one-to-one ancestry. Only the recorded reader trajectory distinguishes uninterrupted availability from recovery.

{{ tikz(learning=true, source="static/images/flower-toy/handoff_continuity.tex", fig_w="620px", caption="<strong>Equivalent endpoints, different continuity.</strong> A fixed reader averages the two pathways' flower signals. During the handoff, B acquires the response while A still supplies it. Reversing the order leaves neither responsive at the intermediate checkpoint. Lines below track correct flower classification at every update. Matching final computations and Price terms conceal this interruption.") }}

Continuity belongs to the evolving computation that supplies the reader. A trait can be lost by one lineage while its role remains available through another, or that role can disappear before being reacquired. Endpoint Price accounting separates inherited changes, while longitudinal reader measurements establish which of these developments occurred.

Different histories do not necessarily leave different learning opportunities. These schedules converge on identical full states, so identical subsequent training would produce identical updates. The earlier acquisition experiments show how retained differences in circuitry can change later learning costs. History matters through the structure it leaves available and the capabilities it maintains along the way.

The examples bring causal development and population change into the same explanation. Price separates differential representation from inherited response change, including changes that cancel in the mean. Tracing computational dependencies locates those changes within reader relationships, while controlled comparisons establish how those relationships affect learning. Following them over time distinguishes continuous availability from recovery, even when endpoint computations and accounting agree.

I see this combination as a way to investigate the organization Cammarata describes. A pathway history can suggest how a useful distinction formed, and population accounting measures how that distinction spreads or changes across inherited pathways. Connecting those measurements to causal evidence would explain how particular acquisitions produce mechanisms that downstream computations can read and build upon. The synthetic experiments establish what these views can distinguish together, providing questions to investigate in real neural development.

Learning builds the machinery of its own future learning.

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^toy-model]: The [flower-toy model and experiments](https://github.com/hxrts/flower-toy) were constructed for this post. They use flower, green, and texture cues. Acquisition trains a green coefficient under a fixed broccoli readout, while competition trains features and readers. Downstream learning trains pathway coordinates and read gains from reader errors, but plots only green-coordinate and read-gain gradients.

    The Price illustration prescribes role targets and ancestry. These models demonstrate possible mechanisms, not measurements of Cammarata's neuron.

[^toy-gradients]: Band width encodes the absolute loss derivative, averaged over checkpoint intervals. Taper shows the sign of learning pressure $-\partial L/\partial\theta$, with a wide left end increasing the parameter and a wide right end decreasing it. Scales vary by figure and parameter type, and zero gradients have no band. Intervals, scales, and values appear in the [pathway](/images/flower-toy/gradient_band_measurements.csv) and [reader measurements](/images/flower-toy/reader_gradient_band_measurements.csv), with reader performance in the [training trace](/images/flower-toy/downstream_reader_training.csv).

[^toy-targets]: Both routes obey $f^2+g^2\leq1.30^2$ and start with the same flower function. Initial green responses are 0.8 for the shared route and zero for the separate route. Acquisition requires the specified positive score and negative scores below 0.10, and step counts exclude precursor training. Both routes classify all eight binary inputs correctly at threshold 0.5. Scores are not calibrated probabilities.

[^price-learning]: Bassett, J. K., Potter, M. A., and De Jong, K. A. (2004), [*Looking Under the EA Hood with Price’s Equation*](https://www.cs.york.ac.uk/rts/docs/GECCO_2004/Conference%20proceedings/papers/3102/31020914.pdf), uses Price-based decompositions to analyze evolutionary algorithms. Fernando, C., Szathmáry, E., and Husbands, P. (2012), [*Selectionist and Evolutionary Approaches to Brain Function*](https://doi.org/10.3389/fncom.2012.00024), discusses Price accounting for neuronal groups and synaptic selection, including its limits as a description of dynamics. Frank, S. A. (2025), [*The Price Equation Reveals a Universal Force–Metric–Bias Law of Algorithmic Learning and Natural Selection*](https://stevefrank.org/reprints-pdf/25FMB.pdf), develops connections to optimization methods including SGD and Adam. This post applies established accounting to attributed pathway uses and their downstream readers, without claiming priority for that application.

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^price-variation]: The second Price term is conventionally called transmission. Here, variation denotes weighted mean change in inherited traits, including response acquisition or loss. It means neither statistical variance nor necessarily random change.

[^price-accounting]: Use equally weighted baseline mechanisms with binary responses $z_i\in\{0,1\}$, fixing the flower assay, controls, responsiveness criterion, downstream tasks, and ancestry rule. Measure later pathway outputs under the same assay. Ancestry attributes contributions to these pathways rather than neuron reproduction.

[^price-weights]: Each later pathway in the example has one ancestor and unit weight. Generally, divide each later use's unit credit among its registered ancestors, excluding unassigned uses. Let $w_i\geq0$ be total ancestral credit and $\Delta z_i$ the credit-weighted descendant mean response minus $z_i$, set to zero when $w_i=0$. Expectations and covariance use the baseline population, with $\bar w=\mathbb E[w]>0$ and $\Delta\bar z$ the later attributed-use mean minus the baseline mean.[^price1972][^frank1997]

    One-to-one neuron tracking with equal descendant weights gives zero selection, placing all measured response change under variation.

[^toy-roles]: The Price illustration measures flower pressure. $\mathsf{A_1}$ and $\mathsf{A_2}$ retain flower while losing green, and $\mathsf{A_3}$ loses flower as it specializes toward green. In the capacity-constrained model, projection onto the constraint weakens flower without a direct flower-loss gradient.

[^price-readers]: For each reader group, count only its pathways' descendant credit while retaining the full baseline population. Group terms compare final inputs with that common baseline, and weighting by each group's share of descendant credit recovers the global terms. Each pathway serves one group, with two pathways per group.

    The [matched-history accounting](/images/flower-toy/matched_reader_inheritance.csv) uses the binary flower assay. Numerical exports call variation "transmission."

[^toy-routing]: The [routing trajectories](/images/flower-toy/learned_routing_trajectories.csv), [Price terms](/images/flower-toy/learned_routing_price.csv), and [reader pressures](/images/flower-toy/learned_routing_pressure.csv) come from one joint-learning experiment. Route A starts with flower coefficient 1 and green coefficient 0.8, while route B starts at zero. Softmax routing shares start at ½ for each reader. All route coordinates and routing logits learn from mean half-squared reader error at learning rate 0.15 for 800 updates. Broccoli multiplies its mixture by the fixed texture cue. These routing shares measure allocation, not ablation-based importance or neuron reproduction. The [band measurements](/images/flower-toy/learned_routing_bands.csv) record gradient magnitudes and display scales at update 10, using 200 points per gradient unit for flower responses and 3000 for routing logits. Frozen logits have no applied update and therefore no band.

    For normalized baseline masses $p_i$ and later masses $q_i$, weighted Price selection is $\sum_i(q_i-p_i)z_i$ and variation is $\sum_i q_i(z'_i-z_i)$. Their sum is the change in the allocation-weighted mean flower contrast. Equivalently, descendant weights are $w_i=q_i/p_i$ with expectations under $p_i$. Exports include comparisons with initialization and with the preceding checkpoint. Reader groups have equal total mass. The removal condition zeros only A's initial green coefficient, rescue restores it before training, and the frozen-routing control holds both readers' shares at ½. All conditions use the same inputs, reader targets, update budget, and learning rate.

[^toy-reader-training]: The [fixed-routing experiment](/images/flower-toy/downstream_reader_training.csv) starts both assignments from identical ancestor copies. $\mathsf{A_1}$, $\mathsf{A_2}$, and $\mathsf{A_3}$ inherit flower and green responses, while $\mathsf{B_1}$ inherits texture. Pathway coordinates and read gains learn from reader errors without local role targets, and recorded gradients include the checkpoint after ten updates. Coherent routing suppresses green in $\mathsf{A_1}$ and $\mathsf{A_2}$ and strengthens it in $\mathsf{A_3}$, while swapping readers redirects flower-reader suppression toward $\mathsf{A_3}$ and $\mathsf{B_1}$.

    Suppressing pathways on fixed positive and negative inputs tests reader dependence. Both assignments reach correct classification, though the swapped assignment retains larger response errors.

[^toy-continuity]: The [handoff trace](/images/flower-toy/handoff_trajectories.csv) tests flower-present and flower-absent inputs after every update, with a fixed mean reader and classification threshold 0.45. Each pathway receives 40 gradient steps at rate 0.2 on a prescribed squared-error target, with acquisition and loss ordered oppositely. [Endpoint accounting](/images/flower-toy/handoff_price.csv) uses binary responsiveness and one-to-one ancestry.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.
