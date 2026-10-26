+++
title = "Learning to Be Clean"
date = 2026-10-28
description = "How neural networks build useful structure."
slug = "learning-to-be-clean"

[extra]
cover_image = "/images/byte-neuron.png"
cover_caption = "Byte Magazine, August 1979"
+++

## What makes a feature useful?

Every acquisition changes what a neural network learns next. So how should we think about learned mechanisms if neural circuitry itself is a moving target?

In *Neural Networks Are Already Clean*, Nick Cammarata notes the importance of identifying when mechanisms are used in later development.

> When I say neural networks are already clean, I mean something deeper than neuron monosemanticity, although even by that standard, I think things look much better than the field expects. I mean that a network’s parts are built to be read, and built upon, by its downstream readers.[^cammarata]

Cammarata follows a neuron in a retrained InceptionV1 model whose strongest responses initially come from yellow-flower images, some with dogs. Green objects and dogs without flowers appear later, followed by broccoli. The observed sequence motivates his developmental explanation, but does not address the causal links that connect feature responses.

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

An established response may give later learning a head start, but when does that advantage become a useful computational relationship? I use controlled experiments to test how earlier acquisitions affect later learning and whether readers retain access to useful signals as their sources change.

## One path leads to another

In Cammarata's circuit-ecology hypothesis, established mechanisms and their readers can learn related tasks faster than competitors starting fresh. As their predictions improve, less error remains to train competing pathways. He proposes that repeated reuse can produce recursive generalization.[^cammarata]

Applied to Cammarata’s flower neuron, the hypothesis suggests a possible mechanism. A flower-responsive neuron might also respond weakly to vegetation. Training on green objects could strengthen that response into a green signal for a later broccoli detector. This intermediate acquisition may make broccoli responsiveness easier to learn than it was from the original flower response.

A broccoli detector that uses the green signal would give the earlier mechanism a new computational role. This is the causal interpretation explored below, rather than a measured dependency in Cammarata's flower neuron.

A reader is a downstream computation using pathway outputs. To distinguish a developmental head start from a useful starting point that later becomes a constraint, I built a synthetic model with explicit binary flower, green, and texture cues.[^toy-model] Supplying these distinctions directly lets us test how their use develops without also having to explain their initial discovery.

The broccoli task requires green and texture together. Flower discrimination means correctly classifying inputs with and without the flower cue, even when response strength changes.

I measure learning pressure as the negative loss gradient on a parameter. For ordinary gradient descent, its sign and magnitude determine the proposed update per unit learning rate. Constraints can change the realized update, as when the capacity limit below weakens flower responsiveness without a direct flower-loss gradient.

In the first experiment, I trained two readers on a green-dependent response from competing pathways. Training updates both the feature coefficients and the weights readers use to combine those features. The established route receives stronger gradients, which decline as prediction error falls.[^toy-gradients]

{{ tikz(learning=true, source="static/images/flower-toy/competition_gradients.tex", fig_w="620px", caption="<strong>Measured pressure on competing routes.</strong> The established route receives stronger gradients, which decline as prediction error falls.") }}

Readers reinforce one another when their errors favor the same update to a shared feature. Opposing updates can cancel, leaving weak net pressure despite strong individual contributions.

The weights carrying signals to downstream readers also learn. For the same prediction error, a stronger input creates greater learning pressure to change how strongly the reader uses that signal.

{{ tikz(learning=true, source="static/images/flower-toy/competition_reader_gradients.tex", fig_w="620px", caption="<strong>Where reader pressure comes from.</strong> Gradients change both the responses shared features produce and the weights readers use to combine them. Reader contributions can reinforce or oppose one another at a shared feature, so weak net pressure can conceal strong competing contributions. Band taper distinguishes pressure to increase a parameter from pressure to decrease it.") }}

An established green signal gives the broccoli reader a useful input before its own training begins. Whether this reduces acquisition cost depends on how subsequent updates affect the other responses that share the pathway.

## Two paths can represent the same distinction

Cammarata compares neurons in InceptionV1 and ConvNeXt that initially respond to yellow-flower fields. The ConvNeXt neuron stays focused on fields, while the InceptionV1 neuron's strongest responses shift toward dogs and broccoli. To examine how learned pathways affect later acquisition, I compared two toy networks under matched training conditions.

The two toy networks share an architecture and flower discrimination but have different learned pathways. Both receive identical subsequent training under a capacity limit that constrains the combined strength of flower and green responses within a pathway. In World A, shared circuitry reaches a broccoli target earlier in training at the expense of weakening the flower signal. In World B, a separate route preserves that signal but requires training an entirely new route to the target.

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

Requiring a stronger positive response before counting broccoli as acquired reverses this advantage. Under the same capacity limit, strengthening green in the shared pathway weakens flower and slows further acquisition, allowing the separate route to become cheaper.[^toy-targets]

A distinction can persist despite weaker activation. Both routes preserve flower classification, but the weaker signal may affect other downstream uses.

Across a population of pathways, increased use of a flower-responsive mechanism can coincide with loss of flower responsiveness in its descendants. Measuring only the final responsive share would miss these opposing changes.

## How roles and responses change

Across inherited pathways, an unchanged average can conceal a redistribution of the mechanisms supplying a distinction. How much change comes from ancestors supplying more pathways, and how much comes from inherited responses changing?

To separate inherited representation from response change, I copied two earlier mechanisms into four later pathways and trained the copies toward specified responses. Initially, $\mathsf{A}$ responds to flowers, while $\mathsf{B}$ supplies texture without responding to flowers on the same assay. Three copies inherit $\mathsf{A}$’s weights and one inherits $\mathsf{B}$’s weights. Two of $\mathsf{A}$’s descendants retain flower responsiveness, while the third specializes toward green and loses its flower response.

The flower-responsive share stays at ½, even though $\mathsf{A}$ now supplies ¾ of the pathways. Its increased representation is offset by a change in what one descendant detects.

Trained networks can develop overlapping representations along separate pathways,[^overlapping-pathways] while shared parameters can receive opposing learning signals.[^gradient-conflict] The toy isolates these ingredients by prescribing ancestry and choosing changes that cancel exactly. This makes the accounting ambiguity visible without establishing how often such cancellation occurs in ordinary training.

Price accounting has previously been applied to evolutionary algorithms and neural learning.[^price-learning] Here, I use it to measure how differential representation and response change contribute to the population mean. The equation separates selection (which mechanisms contribute more descendants) from variation (how those descendants differ from their ancestors).[^price][^price-variation]

Let $z$ be one for a flower-responsive pathway and zero otherwise, under a fixed assay. Let $w$ count the later pathways attributed to each earlier mechanism.[^price-accounting] With $\bar w$ the average descendant count and $\Delta z$ the mean descendant response minus its ancestor’s response, the change in population mean is[^price-weights]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{variation}}.
```

$\operatorname{Cov}(w,z)$ measures whether initially responsive mechanisms supply more descendants, and $\mathbb E$ averages over the initial mechanisms. Dividing by $\bar w$ expresses both contributions per descendant.

Weighting the initial responses by $\mathsf{A}$'s three pathways and $\mathsf{B}$'s one raises the responsive share from ½ to ¾, giving selection +¼. Losing the response in one of $\mathsf{A}$'s pathways subtracts ¼ through variation. Preferential contribution from flower-responsive ancestry therefore offsets inherited response loss, leaving the overall share unchanged.

{% tikz(learning=true, preamble="static/images/flower-toy/price_gradient_values.tex", fig_w="620px", caption="<strong>Controlled construction. Change concealed by a stable mean.</strong> Selection +¼ offsets variation −¼. The open middle column isolates reweighting under the stipulated ancestry. Bands show measured flower pressure, −0.029 on A₃ and zero on the other pathways.") %}
\begin{tikzpicture}[learning]
% Slightly smaller markers for the accounting inset and its trait legend.
\tikzset{feature/.append style={minimum size=4.2pt},trait/.append style={minimum size=9pt}}
\stageheading{0}{BASELINE}{\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{2} flower-responsive}
\stageheading{4.5}{REWEIGHTING}{calculation, \textsuperscript{3}\kern-.12em/\kern-.12em\textsubscript{4} responsive}
\stageheading{9}{FINAL POPULATION}{\textsuperscript{1}\kern-.12em/\kern-.12em\textsubscript{2} flower-responsive}
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

The copies give distinct inherited uses whose ancestry we can control. Each counts once, so three nearly unused pathways outweigh one heavily used pathway in this calculation. A persistent mechanism can also serve more readers without being copied, which motivates the allocation experiment below. In either case, functional dependence requires testing the readers’ use of the signals.

Ancestry records identify which responses are retained or acquired. Price accounting quantifies how changing representation and inherited responses contribute to the population mean, exposing changes that cancel in the total. The identity does not itself assign causes to those changes.

Explaining the changes requires examining training dynamics. Direct learning pressure and competition for shared capacity can each weaken an earlier response.[^toy-roles] Here, ancestry and targets are prescribed, so the construction illustrates the accounting without explaining why branching would emerge.

The global terms do not identify which readers receive retained flower responses and which receive newly acquired ones.

## Readers reveal inherited roles

I constructed two histories with identical global Price terms but different ancestry for the flower readers’ inputs. Each has three descendants of $\mathsf{A}$ and one of $\mathsf{B}$. Both finish with two flower pathways, a green pathway, and a texture pathway supplying identical readers.

In History I, two $\mathsf{A}$ descendants retain flower responsiveness, its third supplies green, and $\mathsf{B}$ supplies texture. In History II, one $\mathsf{A}$ descendant retains flower responsiveness and a $\mathsf{B}$ descendant acquires it. The other two $\mathsf{A}$ descendants learn green and texture. Training fits the same prescribed role targets in both histories, preserving the broccoli reader's required signals as well as the flower outputs.

Their global Price terms are identical, selection +¼ and variation −¼. Final reader outputs also agree on all eight toy inputs. Tracing ancestry into each reader group reveals what those matches conceal.[^price-readers]

Each group is compared with the full initial population, whose flower-responsive share is ½.

| Reader group | History | Selection | Variation | Flower-responsive share |
|---|---|---|---|---|
| Flower | I | +½ | 0 | All |
| Broccoli | I | 0 | −½ | None |
| Flower | II | 0 | +½ | All |
| Broccoli | II | +½ | −1 | None |

Averaging the equally sized groups recovers the global terms in either history. History I supplies flower readers entirely through retained responsiveness, while History II combines retention with acquisition from a previously nonresponsive ancestor. The final responsive shares alone hide this difference.

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

The matched histories prescribe which pathways supply each reader. In a separate experiment, reader errors train two persistent routes and the weights allocating their signals to each reader. The labels A and B now refer to a fresh initialization, with flower and green responses in A and zero responses in B.

Each reader learns nonnegative routing shares that sum to one, starting with equal shares. The broccoli reader combines its routed signal with a fixed texture input.[^toy-routing]

The first Price analysis counts inherited pathway uses, while this one measures allocation among persistent routes. Selection can therefore change here without creating any new pathways, simply because a reader assigns more weight to one route.

The trait is now continuous flower contrast, measured by subtracting the response without the flower cue from the response with it while holding other cues fixed. This difference can be negative or exceed one. Selection measures changing allocation to the initially flower-responsive route, while variation measures changes in the routes’ flower responses. Both are calculated from the same trajectory as the reader gradients. The terms depend on the chosen route identities, signal representation, and weighting rule, so equivalent computations need not have the same decomposition.[^price-representation]

{{ tikz(learning=true, source="static/images/flower-toy/learned_routing.tex", learning_centers="0 9", fig_w="620px", caption="<strong>Reader pressure with learned and frozen routing.</strong> Bands show the magnitude and direction of applied learning pressure at update 10. Reader errors modify shared flower responses and, when routing learns, their allocation. Frozen routing receives no updates and has no routing bands. Feature and routing-logit bands use separate width scales, shared across conditions. The fixed texture input to broccoli is omitted.") }}

The table accounts for change in allocation-weighted mean flower contrast after 800 updates with learned routing, relative to the initial mean of 0.50. The global row weights both reader groups equally. Values are rounded to two decimal places, so displayed terms may not sum exactly.

| Reader group | Selection | Variation | Final contrast |
|---|---|---|---|
| Flower | +0.22 | +0.19 | 0.91 |
| Broccoli | −0.23 | −0.11 | 0.16 |
| Global | −0.01 | +0.04 | 0.54 |

After 800 updates, the flower reader assigns about 72% of its routing share to the initially flower-responsive route, while broccoli assigns about 27%. Different readers develop different uses of the same pathways, yet their opposing allocation changes nearly disappear in the global selection term. Holding each routing share at 50% forces selection to zero and leaves broccoli classification at 75%, compared with 100% when routing learns. Allowing routing to learn improves broccoli classification under these training conditions.[^toy-reader-training]

Removing the initial green response before training leaves final classification unchanged but reduces mean squared reader error by about 99% after 800 updates. Restoring it reproduces the intact trajectory.[^toy-routing] A starting point that makes one acquisition cheaper can impede joint learning when several readers and representations adapt together.

The traces show earlier differentiation without the precursor. By update 400, the flower reader allocates about 75% to A and broccoli about 75% to B, compared with 56% and 55% when the precursor is present. B has also acquired a stronger green response, while the reader-specific Price terms separate more strongly in both allocation and flower-response change.[^toy-precursor]

The precursor therefore changes the course of joint learning as well as its final error. Earlier differentiation is consistent with the improvement, but the comparison does not isolate which allocation or response changes cause it.

A reader’s allocation shows how strongly it weights a route, but does its classification depend on that signal? I tested this by zeroing each route after training while holding all learned weights and routing shares fixed.[^toy-ablations]

| Removed route | Flower accuracy | Broccoli accuracy |
|---|---|---|
| None | 100% | 100% |
| A | 50% | 100% |
| B | 100% | 75% |

The readers have developed differentiated functional dependencies. A remains necessary for perfect flower classification under this intervention, while broccoli depends on B, which began without the green precursor. This is a concrete instance of mechanisms becoming useful to different readers, although each route can still affect the other reader’s numerical output.[^toy-ablations]

These endpoint dependencies leave open whether the readers kept classifying correctly while the routes changed.

## What learning carries forward

Ancestral retention and continuous usability are different properties. A distinction may remain encoded while its signal becomes too weak for an existing reader to classify correctly. Even reader-conditioned endpoint accounting cannot establish whether that reader kept working throughout learning.

To distinguish uninterrupted classification from recovery, I changed the order in which two pathways strengthen and weaken their flower responses. A fixed reader averages their signals and classifies at threshold 0.45. Initially $\mathsf{A}$ has response strength one and $\mathsf{B}$ zero. Both schedules train $\mathsf{B}$ toward one and $\mathsf{A}$ toward zero, with identical update budgets.[^toy-continuity]

In the continuous handoff, $\mathsf{B}$ learns first, so the fixed reader keeps classifying correctly as $\mathsf{A}$ changes. Reversing the order causes classification to fail temporarily, even though the flower signal remains positive. The schedules end with identical pathway parameters and reader outputs. Equal one-to-one descendant weights give zero selection, and the unchanged binary responsive share gives zero net variation.

The reader trajectory establishes the interruption, which endpoint Price accounting cannot detect.

{{ tikz(learning=true, source="static/images/flower-toy/handoff_continuity.tex", fig_w="620px", caption="<strong>Equivalent endpoints, different continuity.</strong> A fixed reader averages the two pathways’ flower signals. Arrows below show the order of training, and flower markers indicate pathway responses meeting the 0.50 assay threshold. The reader classifies correctly throughout the handoff but fails at updates 1–50 during recovery under its fixed threshold of 0.45. The weakened signal still distinguishes the inputs numerically. Both schedules end with the same computation and zero net selection and variation.") }}

Throughout the continuous schedule, the score for flower-present inputs stays at least 0.05 above the reader’s threshold, while flower-absent inputs score zero. The contrast persists at tested reader thresholds from 0.001 to 0.45.[^toy-continuity] Allowing downstream computations to learn during the handoff would test whether keeping this reader functional also supports further development.

Different histories do not necessarily leave different learning opportunities. These schedules converge on identical states, so subsequently applying duplicate training would produce the same updates. The earlier acquisition experiments show how retained differences in circuitry can change later learning costs. History matters through the structure it leaves available and the capabilities it maintains along the way.

Usefulness belongs to a relationship between a signal and the computation reading it. A distinction can remain encoded yet fail an existing reader, or pass between mechanisms while that reader keeps working. Understanding this organization requires explaining how those dependencies develop and testing whether they remain functional as their components change. What learning carries forward can be a reader’s access to a distinction, even when the mechanism supplying it changes.

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^toy-model]: The [flower-toy model and experiments](https://github.com/hxrts/flower-toy) were constructed for this post. They use flower, green, and texture cues. Acquisition trains a green coefficient under a fixed broccoli readout, while competition trains features and readers. Downstream learning trains pathway coordinates and read gains from reader errors, but plots only green-coordinate and read-gain gradients.

    The Price illustration prescribes role targets and ancestry. These models demonstrate possible mechanisms, not measurements of Cammarata's neuron.

[^toy-gradients]: Band width encodes the absolute loss derivative, averaged over checkpoint intervals. Taper shows the sign of learning pressure $-\partial L/\partial\theta$, with a wide left end increasing the parameter and a wide right end decreasing it. Scales vary by figure and parameter type, and zero gradients have no band. Intervals, scales, and values appear in the [pathway](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/gradient_band_measurements.csv) and [reader measurements](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/reader_gradient_band_measurements.csv), with reader performance in the [training trace](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/downstream_reader_training.csv).

[^toy-targets]: Both routes obey $f^2+g^2\leq1.30^2$ and start with the same flower function. Initial green responses are 0.8 for the shared route and zero for the separate route. Acquisition requires the specified positive score and negative scores below 0.10, and step counts exclude precursor training. Both routes classify all eight binary inputs correctly at threshold 0.5. Scores are not calibrated probabilities.

[^price-learning]: Bassett, J. K., Potter, M. A., and De Jong, K. A. (2004), [*Looking Under the EA Hood with Price’s Equation*](https://www.cs.york.ac.uk/rts/docs/GECCO_2004/Conference%20proceedings/papers/3102/31020914.pdf), uses Price-based decompositions to analyze evolutionary algorithms. Fernando, C., Szathmáry, E., and Husbands, P. (2012), [*Selectionist and Evolutionary Approaches to Brain Function*](https://doi.org/10.3389/fncom.2012.00024), discusses Price accounting for neuronal groups and synaptic selection, including its limits as a description of dynamics. Frank, S. A. (2025), [*The Price Equation Reveals a Universal Force–Metric–Bias Law of Algorithmic Learning and Natural Selection*](https://stevefrank.org/reprints-pdf/25FMB.pdf), develops connections to optimization methods including SGD and Adam. This post applies the accounting to attributed pathway uses and their downstream readers.

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^overlapping-pathways]: Cammarata, N., et al. (2021). [*Curve Circuits*](https://distill.pub/2020/circuits/curve-circuits/). *Distill*. Similar shape detectors appear across InceptionV1’s 3×3 and 5×5 branches, providing evidence of overlapping computations without implying literal copying.

[^gradient-conflict]: Yu, T., et al. (2020). [*Gradient Surgery for Multi-Task Learning*](https://arxiv.org/abs/2001.06782). *NeurIPS*. The study examines conflicting task gradients on shared parameters. This supports gradient interference, rather than exact cancellation between Price terms.

[^price-variation]: The second Price term is conventionally called transmission. Here, variation denotes weighted mean change in inherited traits, including response acquisition or loss. It means neither statistical variance nor necessarily random change.

[^price-accounting]: Use equally weighted baseline mechanisms with binary responses $z_i\in\{0,1\}$, fixing the flower assay, controls, responsiveness criterion, downstream tasks, and ancestry rule. Measure later pathway outputs under the same assay. Ancestry attributes contributions to these pathways rather than neuron reproduction.

[^price-weights]: Each later pathway in the example has one ancestor and unit weight. Generally, divide each later use's unit credit among its registered ancestors, excluding unassigned uses. Let $w_i\geq0$ be total ancestral credit and $\Delta z_i$ the credit-weighted descendant mean response minus $z_i$, set to zero when $w_i=0$. Expectations and covariance use the baseline population, with $\bar w=\mathbb E[w]>0$ and $\Delta\bar z$ the later attributed-use mean minus the baseline mean.[^price1972][^frank1997]

    One-to-one neuron tracking with equal descendant weights gives zero selection, placing all measured response change under variation.

[^toy-roles]: The Price illustration measures flower pressure. $\mathsf{A_1}$ and $\mathsf{A_2}$ retain flower while losing green, and $\mathsf{A_3}$ loses flower as it specializes toward green. In the capacity-constrained model, projection onto the constraint weakens flower without a direct flower-loss gradient.

[^price-readers]: For each reader group, count only its pathways' descendant credit while retaining the full baseline population. Group terms compare final inputs with that common baseline, and weighting by each group's share of descendant credit recovers the global terms. Each pathway serves one group, with two pathways per group.

    The [matched-history accounting](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/matched_reader_inheritance.csv) uses the binary flower assay. Numerical exports call variation "transmission."

[^toy-routing]: The [routing trajectories](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/learned_routing_trajectories.csv), [Price terms](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/learned_routing_price.csv), and [reader pressures](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/learned_routing_pressure.csv) come from one joint-learning experiment. Route A starts with flower coefficient 1 and green coefficient 0.8, while route B starts at zero. Each reader’s softmax routing shares start at 50% per route. All route coordinates and routing logits learn from mean half-squared reader error at learning rate 0.15 for 800 updates. Broccoli multiplies its mixture by the fixed texture cue. These routing shares measure allocation, not ablation-based importance or neuron reproduction. The [band measurements](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/learned_routing_bands.csv) record gradient magnitudes and display scales at update 10, using 200 points per gradient unit for flower responses and 3000 for routing logits. Frozen logits have no applied update and therefore no band.

    For normalized baseline masses $p_i$ and later masses $q_i$, weighted Price selection is $\sum_i(q_i-p_i)z_i$ and variation is $\sum_i q_i(z'_i-z_i)$. Their sum is the change in the allocation-weighted mean flower contrast. Equivalently, descendant weights are $w_i=q_i/p_i$ with expectations under $p_i$. Exports include comparisons with initialization and with the preceding checkpoint. Reader groups have equal total mass. The removal condition zeros only A's initial green coefficient, rescue restores it before training, and the frozen-routing control holds each routing share at 50%. All conditions use the same inputs, reader targets, update budget, and learning rate. Mean squared error averaged equally over the two readers falls from 1.97 × 10⁻² with the precursor to 2.31 × 10⁻⁴ without it. Using unrounded values, the reduction is 98.83%.

[^toy-reader-training]: A separate experiment shows that exchanging fixed reader assignments redirects learning pressure on their input pathways. The [fixed-routing experiment](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/downstream_reader_training.csv) starts both assignments from identical ancestor copies. $\mathsf{A_1}$, $\mathsf{A_2}$, and $\mathsf{A_3}$ inherit flower and green responses, while $\mathsf{B_1}$ inherits texture. Pathway coordinates and read gains learn from reader errors without local role targets, and recorded gradients include the checkpoint after ten updates. Coherent routing suppresses green in $\mathsf{A_1}$ and $\mathsf{A_2}$ and strengthens it in $\mathsf{A_3}$, while swapping readers redirects flower-reader suppression toward $\mathsf{A_3}$ and $\mathsf{B_1}$.

    Suppressing pathways on fixed positive and negative inputs tests reader dependence. Both assignments reach correct classification, though the swapped assignment retains larger response errors.

[^price-representation]: The toy fixes route identities and feature coordinates throughout training. Applying the decomposition to a larger network would require a justified correspondence between mechanisms across checkpoints and a declared signal scale and attribution rule. Changing those choices can change the terms even when the computation being studied is preserved.

[^toy-precursor]: In the [training traces](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/learned_routing_trajectories.csv), B’s green coefficient at update 400 is 0.94 without the precursor and 0.06 with it. The corresponding [Price terms](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/learned_routing_price.csv) describe allocation and response changes relative to initialization without isolating which changes cause the error difference.

[^toy-ablations]: The [route-ablation measurements](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/learned_routing_ablations.csv) zero one route’s output after training, without renormalizing routing shares or retraining. They record mean squared error, maximum error, and accuracy for each reader in every training condition. Selective classification losses establish dependence under this intervention, while error changes show that the other reader can also be affected.

[^toy-continuity]: The [handoff trace](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/handoff_trajectories.csv) tests flower-present and flower-absent inputs after every update, with a fixed mean reader and classification threshold 0.45. Each pathway receives 40 gradient steps at rate 0.2 on a prescribed squared-error target, with acquisition and loss ordered oppositely. [Endpoint accounting](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/handoff_price.csv) uses binary responsiveness and one-to-one ancestry. The trace includes positive and negative scores and margins. [Threshold checks](https://github.com/hxrts/flower-toy/blob/b13556724b777d88d861b6d462bd3255bb684078/data/handoff_thresholds.csv) evaluate 0.001, 0.01, 0.10, 0.25, 0.45, and 0.50 without retraining. Continuous handoff preserves classification at the first five thresholds, while interrupted recovery fails temporarily at each. At 0.50, the continuous schedule reaches a zero-margin boundary, with floating-point rounding producing a final failed classification. Its minimum positive score is approximately 0.50, compared with 6.65 × 10⁻⁵ during interrupted recovery.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.
