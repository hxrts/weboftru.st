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

What a neural network learns changes what it can learn next. But what causes a model to develop coherent structure in the first place?

In *Neural Networks Are Already Clean*, Nick Cammarata calls networks "clean" when their mechanisms form useful groupings for downstream readers.[^cammarata] He follows a neuron in a retrained InceptionV1 model whose strongest responses initially come from yellow-flower images, some with dogs. Green objects and dogs without flowers appear later, followed by broccoli. However, the described sequence leaves the causal links between this process of extension open.

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

Generalization considers acquisition of responses beyond training examples. Cammarata's "recursive generalization" describes acquired responses that facilitate further learning.

In this post, I look at the *process* of path formation to understand how learned distinctions acquire new roles and persist as circuitry changes.

## One path leads to another

Cammarata presents a circuit-ecology hypothesis, where established pathways benefit from a head start over their competitors. Gradients from different examples reinforce shared circuitry when they favor compatible parameter updates. As that circuitry reduces prediction error, competing pathways have less remaining error to correct.[^cammarata] One way to understand his proposed advantage is the application of learning pressure, the force that training signals exert to change circuitry.

Consider a flower-responsive neuron that also responds weakly to vegetation. Green-object examples could produce compatible gradients that strengthen this response into a green signal for a later broccoli detector. This intermediate acquisition may make broccoli responsiveness easier to learn than it was from the original flower response. The detector's dependence on the green signal gives the earlier mechanism a new computational role.

A synthetic model isolates this mechanism with two readers learning a green-dependent response from competing pathways.[^toy-model] Both feature coefficients and reader weights train. The established route attracts more pressure, which declines as prediction error falls.[^toy-gradients]

{{ tikz(learning=true, source="static/images/clean-toy/competition_gradients.tex", fig_w="620px", caption="<strong>Measured pressure on competing routes.</strong> The established route attracts more learning pressure, which declines as prediction error falls.") }}

Aligned readers reinforce one another, while the net pressure of opposed targets may cancel at a shared feature, concealing reader contributions.

The weights carrying signals to downstream readers also learn. For the same prediction error, a stronger input creates greater learning pressure to change how strongly the reader uses that signal.

{{ tikz(learning=true, source="static/images/clean-toy/competition_reader_gradients.tex", fig_w="620px", caption="<strong>Where reader pressure comes from.</strong> Aligned readers reinforce a shared feature, while opposed readers nearly cancel. Connection gradients also depend on signal strength.") }}

An established green signal can reduce how much new learning broccoli detection requires. The advantage comes from a useful distinction that earlier training has already supplied, allowing the subsequent detector to build on that distinction instead of learning it independently.

## Two paths can represent the same distinction

Cammarata compares InceptionV1 and ConvNeXt neurons that initially respond to green fields with yellow flowers. Field images remain prominent among the ConvNeXt neuron's strongest responses, while in InceptionV1 neurons, they are displaced by dogs and broccoli. These trajectories show two different patterns of retention and extension under different training systems.

To see how learned pathways affect later acquisition, consider two networks with the same architecture and flower discrimination, but different learned pathways. Both receive identical subsequent training. In World A, shared circuitry reaches a broccoli target earlier in training at the expense of weakening the flower signal. In World B, a separate route preserves that signal but requires training an entirely new route to the target.

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

{{ tikz(learning=true, source="static/images/clean-toy/acquisition_comparison.tex", fig_w="620px", caption="<strong>The acquisition target changes the advantage.</strong> A stricter target reverses the cost advantage. At either target, both routes correctly classify every flower and nonflower input in the toy model.") }}

A distinction can persist despite weaker activation. Both routes preserve flower classification, but the weaker signal may affect other downstream uses.

Across a population, some pathways can gain new uses while others lose responsiveness. These changes can offset each other, leaving aggregate measurements unchanged as the network reorganizes.

## Learning pressure changes roles and responses

Average response can stay constant while the underlying pathways change. How much of that change comes from pathways gaining influence, and how much comes from their responses changing?

In the synthetic flower model, the responsive share begins at ½ because $\mathsf{A}$ responds to flowers while $\mathsf{B}$ does not. In the final population, $\mathsf{A}$ provides three pathways, while $\mathsf{B}$ retains one path. $\mathsf{A}$ and $\mathsf{B}$ can change independently as they learn a new role. One of $\mathsf{A}$'s three pathways loses its flower response, leaving two of the four final pathways responsive. The average therefore stays at ½, concealing $\mathsf{A}$'s increased contribution.

{% tikz(learning=true, preamble="static/images/clean-toy/price_gradient_values.tex", fig_w="620px", caption="<strong>Change concealed by a stable mean.</strong> Selection +¼ and variation −¼ cancel. A₃ receives flower pressure of −0.029, while the other branches receive none. The middle column isolates reweighting.") %}
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



The Price equation answers this question by separating selection, change due to differential contribution, from variation, change in inherited responses.[^price][^price-variation] Let $z$ record flower responsiveness on a fixed assay and $w$ count the later pathways attributed to each earlier mechanism.[^price-accounting] With $\bar w$ the average contribution and $\Delta z$ each mechanism's average inherited response change, the population mean changes by[^price-weights]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{variation}}.
```

Weighting the initial responses by $\mathsf{A}$'s three pathways and $\mathsf{B}$'s one raises the responsive share from ½ to ¾, giving selection +¼. Losing the response in one of $\mathsf{A}$'s pathways subtracts ¼ through variation. Preferential contribution from flower-responsive ancestry therefore offsets inherited response loss, leaving the overall share unchanged.

An earlier response can weaken through direct learning pressure or through competition for shared capacity.[^toy-roles] The Price equation allows us to decompose contributions from selection and variation, but says nothing about which process produced them.

## How learning builds understandable structure

The unchanged average leaves open whether flower signals still reach the readers that use them. $\mathsf{A}$'s two flower-responsive pathways feed flower detectors. Its third pathway can now provide a green signal for a broccoli detector to combine with texture information from $\mathsf{B}$. Whether these signals remain useful depends on the distinctions their downstream readers need to make.

Now send the green and texture pathways to the flower detectors, and the flower-responsive pathways to the broccoli detector. The pathways keep the same ancestry and responses, so the global Price terms stay unchanged even though their activation outputs now feed different downstream detectors. The diagram compares how further learning responds to these two assignments.[^toy-reader-training]

{{ tikz(learning=true, source="static/images/clean-toy/downstream_reader_gradients.tex", fig_w="620px", caption="<strong>Where signals go shapes how they learn.</strong> Coherent and swapped routing at step 10. Bands show pressure on green responses (left) and read gains (right).") }}

Where did the inherited changes occur in the original assignment? Tracing each pathway to its reader lets Price separate selection and variation within those inputs. The table describes that fixed assignment before further reader-driven learning, comparing each group with the same initial population, half of which is flower-responsive.[^price-readers]

| Downstream reader | Inherited pathways | Selection | Variation | Responsive share |
|---|---|---|---|---|
| Flower detectors | Two from $\mathsf{A}$, both retain the response | +½ | 0 | 1 |
| Broccoli detector | One from $\mathsf{A}$, one from $\mathsf{B}$; $\mathsf{A}$'s loses the response | 0 | −½ | 0 |
| Overall | Both groups, equally weighted | +¼ | −¼ | ½ |

Selection increases the contribution of flower-responsive ancestry to the flower detectors, while variation removes flower responsiveness from a branch serving broccoli. The unchanged overall share conceals this differentiation of computational roles.

Once a pathway supplies a downstream reader, that reader’s errors help shape its further development. In the toy model, changing the readers redirects learning pressure on the same inherited pathways. Useful distinctions can therefore become organized around the computations that consume them. This feedback offers a developmental explanation for the organization Cammarata calls clean.

## What learning carries forward

When a network retains a learned distinction, what has survived? The distinction may still reach its downstream readers even as different pathways take over the role of supplying it.

Instead of $\mathsf{A}$ supplying the flower pathways, suppose $\mathsf{A}$ supplies only green, while $\mathsf{B}$ contributes texture and two pathways that acquire flower responsiveness. Both histories end with half the pathways flower-responsive and equivalent signals supplying each downstream reader.

In the second history, differential contribution favors the initially nonresponsive $\mathsf{B}$, so selection is −¼. Response changes contribute +¼ through variation, reversing the first history's terms while preserving its final mean. The flower distinction remains available to the downstream readers, even though different ancestral pathways learned to supply it.

{% tikz(learning=true, fig_w="620px", caption="<strong>The same signals, different ancestry.</strong> Equivalent reader functions can arise from different ancestors, with opposite Price terms. Bands show mean flower pressure in the toy training traces, −0.029 on A₃ and +0.029 on B₁ and B₂.") %}
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
\coordinate (ua3s) at ($(ua.center)+(.42,0)$);
\coordinate (ua3a) at ($(ua.center)+(1.62,0)$);
\coordinate (ua3b) at ($(u3.center)+(-1.35,0)$);
\suppressband{u3.center}{ua3b}{ua3a}{ua3s}{2.92397661}
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
\coordinate (vb1s) at ($(vb.center)+(.42,0)$);
\coordinate (vb1a) at ($(vb.center)+(1.62,0)$);
\coordinate (vb1b) at ($(v1.center)+(-1.35,0)$);
\pressureband{v1.center}{vb1b}{vb1a}{vb1s}{2.92397661}
\coordinate (vb2s) at ($(vb.center)+(.42,0)$);
\coordinate (vb2a) at ($(vb.center)+(1.62,0)$);
\coordinate (vb2b) at ($(v2.center)+(-1.35,0)$);
\pressureband{v2.center}{vb2b}{vb2a}{vb2s}{2.92397661}
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
\pressurekey{0}{\learningpressurelegendy}{-1}
\node[legendlabel] at (.7,\learningpressurelegendy) {Flower response decreases};
\pressurekey{5}{\learningpressurelegendy}{1}
\node[legendlabel] at (5.7,\learningpressurelegendy) {Flower response increases};
\diagramframe{\learningframebottom}
\end{tikzpicture}
{% end %}

At the final checkpoint, both histories supply equivalent distinctions to their readers. Their developmental records reveal whether those distinctions were retained by earlier pathways or acquired elsewhere. Matching endpoints alone leaves open whether the capability remained available throughout training.[^toy-continuity]

A final circuit shows how the network supplies a learned distinction to its readers. Its developmental history reveals how that role was inherited, modified, or acquired by different pathways. Learning builds the machinery of its own future learning.

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^toy-model]: The synthetic experiments use flower, green, and texture cues. Acquisition trains a green coefficient under a fixed broccoli readout, while competition trains features and readers. Downstream learning trains pathway coordinates and read gains from reader errors, but plots only green-coordinate and read-gain gradients. The Price illustration prescribes role targets and ancestry. These models demonstrate possible mechanisms, not measurements of Cammarata's neuron.

[^toy-gradients]: Band width encodes the absolute loss derivative, averaged over checkpoint intervals. Taper shows the sign of learning pressure $-\partial L/\partial\theta$, with a wide left end increasing the parameter and a wide right end decreasing it. Scales vary by figure and parameter type, and zero gradients have no band. Intervals, scales, and values appear in the [pathway](/images/clean-toy/gradient_band_measurements.csv) and [reader measurements](/images/clean-toy/reader_gradient_band_measurements.csv), with reader performance in the [training trace](/images/clean-toy/downstream_reader_training.csv).

[^toy-targets]: Both routes obey $f^2+g^2\leq1.30^2$ and start with the same flower function. Initial green responses are 0.8 for the shared route and zero for the separate route. Acquisition requires the plotted positive score and negative scores below 0.10, and step counts exclude precursor training. Both routes classify all eight binary inputs correctly at threshold 0.5. Scores are not calibrated probabilities.

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^price-variation]: The second Price term is conventionally called transmission. Here, variation denotes weighted mean change in inherited traits, including response acquisition or loss. It means neither statistical variance nor necessarily random change.

[^price-accounting]: Use equally weighted baseline mechanisms with binary responses $z_i\in\{0,1\}$, fixing the flower assay, controls, responsiveness criterion, downstream tasks, and ancestry rule. Measure later pathway outputs under the same assay. Ancestry attributes contributions to these pathways rather than neuron reproduction.

[^price-weights]: Each later pathway in the example has one ancestor and unit weight. Generally, divide each later use's unit credit among its registered ancestors, excluding unassigned uses. Let $w_i\geq0$ be total ancestral credit and $\Delta z_i$ the credit-weighted descendant mean response minus $z_i$, set to zero when $w_i=0$. Expectations and covariance use the baseline population, with $\bar w=\mathbb E[w]>0$ and $\Delta\bar z$ the later attributed-use mean minus the baseline mean.[^price1972][^frank1997]

    One-to-one neuron tracking with equal descendant weights gives zero selection, placing all measured response change under variation.

[^toy-roles]: The Price illustration measures flower pressure. $\mathsf{A_1}$ and $\mathsf{A_2}$ retain flower while losing green, and $\mathsf{A_3}$ loses flower as it specializes toward green. In the capacity-constrained model, projection onto the constraint weakens flower without a direct flower-loss gradient.

[^toy-reader-training]: Both assignments start from identical ancestor copies. $\mathsf{A_1}$, $\mathsf{A_2}$, and $\mathsf{A_3}$ inherit flower and green responses, while $\mathsf{B_1}$ inherits texture. Pathway coordinates and read gains learn from reader errors without local role targets, and plotted gradients follow ten updates. Coherent routing suppresses green in $\mathsf{A_1}$ and $\mathsf{A_2}$ and strengthens it in $\mathsf{A_3}$, while swapping readers redirects flower-reader suppression toward $\mathsf{A_3}$ and $\mathsf{B_1}$.

    Suppressing pathways on fixed positive and negative inputs tests reader dependence. Further training restores correct classification after the swap, though response errors remain larger.

[^price-readers]: For each reader group, count only its pathways' descendant credit while retaining the full baseline population. Group terms compare final inputs with that common baseline. Weighting them by each group's share of descendant credit recovers the global terms. Here each pathway serves one group, with two pathways per group.

[^toy-continuity]: Evaluate the same readers on fixed inputs across checkpoints to distinguish continuous performance from endpoint recovery. Histories may reach equivalent functions at different times, and inherited responsiveness alone does not establish reader accuracy between checkpoints.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.
