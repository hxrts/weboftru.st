+++
title = "Why Are Neural Networks Clean?"
date = 2026-10-20
description = "Evolutionary structure of neural circuits."
slug = "why-clean"
draft = true

[extra]
cover_image = "/images/byte-neuron.png"
cover_caption = "Byte Magazine, August 1979"
+++

## The organization of learning

A neural network is a history of learning made operational. Training examples pass through circuitry shaped by earlier examples, generating predictions and signals for further change. This activity continually modifies the pathways that channel subsequent learning. What can watching a mechanism grow reveal about the distinctions it eventually makes?

In *Neural Networks Are Already Clean*, Nick Cammarata follows a neuron through a retrained InceptionV1 model.[^cammarata] It begins by responding to yellow flowers in photographs sometimes containing dogs. Its responses spread toward green objects and dogs without flowers, eventually extending to broccoli. Cammarata calls this branching process recursive generalization.

Calling this a flower neuron describes some of its responses. Its computational role lies in the distinctions those responses make available downstream. Training can develop several aspects of that inherited organization, with each extension changing the possibilities for subsequent learning. Recursive generalization gives us a visible history of that process.

## Learning changes the machinery that learns

Each training example activates pathways that contribute to a prediction. The resulting error generates gradients through the participating circuitry, and the optimizer translates them into updates. Errors create pressure for change, while existing connections and parameter sensitivities channel the response. Satrajit Chatterjee's coherent-gradients hypothesis proposes that aligned gradients reinforce changes benefiting several examples at once.[^coherent]

A learned distinction settles something for its current readers while other differences remain available in the surrounding representation. We can call those remaining possibilities a residual relative to the present computation. In the flower example, signals for color, texture, or context might support later extensions. Further learning can use them only where the relevant information remains accessible.

Evolutionary theory distinguishes the generation of variation from the selection of variants for continuation. In Cammarata's circuit-ecology account, an already responsive pathway can offer a shorter route to reducing error than developing an independent detector across several layers. Repeated training can strengthen its contribution, while reduced errors may weaken the gradients supporting competing alternatives. The flow of training activity changes the pathways available to subsequent learning, making the order of discovery consequential.

{% tikz(fig_w="620px", caption="Several candidate distinctions can recruit one established feature, reinforcing its reuse through shared learning signals. An alternative may receive less support as relevant errors are reduced. Black arrows show possible development, and grey arrows show the proposed pressure acting through inherited features. Solid dots are learned distinctions, while white dots are candidate distinctions not yet learned.") %}
\usetikzlibrary{arrows.meta,backgrounds,calc}
\begin{tikzpicture}[x=1cm,y=1cm,>={Stealth[length=4.6pt,width=3.6pt]},every node/.style={font=\sffamily\footnotesize},time/.style={font=\sffamily\bfseries\footnotesize},emphasis/.style={font=\sffamily\bfseries\footnotesize},feature/.style={circle,draw,fill=black,minimum size=4.6pt,inner sep=0pt,line width=.65pt},potential/.style={feature,fill=white,fill opacity=1},flow/.style={->,line width=.85pt},pressure/.style={-{Stealth[length=13pt,width=16pt]},draw=black!15,line width=8pt,line cap=round},boundary/.style={draw=black!65,line width=.8pt,dash pattern=on .1pt off 2.5pt,line cap=round}]
\pgfdeclarelayer{foreground}
\pgfsetlayers{background,main,foreground}
\newcommand{\pressureband}[4]{
  \path[fill=black!15,draw=none]
    ($(#1)+(0,2.625pt)$) .. controls ($(#2)+(0,2.625pt)$) and ($(#3)+(0,4pt)$) .. ($(#4)+(0,4pt)$)
    -- ($(#4)+(0,-4pt)$) .. controls ($(#3)+(0,-4pt)$) and ($(#2)+(0,-2.625pt)$) .. ($(#1)+(0,-2.625pt)$) -- cycle;
}
\newcommand{\pressurehead}[2]{
  \path[fill=black!15,draw=none]
    ($(#1)+(0,4pt)$) -- ($(#2)+(.42cm,4pt)$) -- ($(#2)+(.42cm,8pt)$)
    -- (#2.center) -- ($(#2)+(.42cm,-8pt)$) -- ($(#2)+(.42cm,-4pt)$)
    -- ($(#1)+(0,-4pt)$) -- cycle;
}
\node[time] at (0,3) {PAST};
\node at (0,2.60) {inherited features};
\node[time] at (4.5,3) {PRESENT};
\node at (4.5,2.60) {feature population};
\node[time] at (9,3) {FUTURE};
\node at (9,2.60) {potential distinctions};
\foreach \x in {0,4.5,9} \draw[boundary] (\x,0) ellipse (.7cm and 1.65cm);
\node[feature] (a) at (0,0.6) {};
\node[feature] (b) at (0,-1.1) {};
\node[feature] (d) at (4.5,0.6) {};
\node[feature] (e) at (4.5,-1.1) {};
\node[feature] (f) at (9,1.2) {};
\node[feature] (g) at (9,0.55) {};
\node[feature] (h) at (9,-0.1) {};
\node[feature] (i) at (9,-1.1) {};
\coordinate (ahead) at (0.42,0.6);
\coordinate (r1a) at (1.620,0.6);
\coordinate (r1b) at (3.150,0.6);
\draw[flow] (a.center) .. controls (r1a) and (r1b) .. (d.west);
\coordinate (bhead) at (0.42,-1.1);
\coordinate (r2a) at (1.620,-1.1);
\coordinate (r2b) at (3.150,-1.1);
\draw[flow] (b.center) .. controls (r2a) and (r2b) .. (e.west);
\coordinate (djoin) at (5.55,0.6);
\draw[line width=.85pt] (d.center) -- (djoin);
\coordinate (dhead) at (4.92,0.6);
\coordinate (r3a) at (6.792,0.6);
\coordinate (r3b) at (7.965,1.2);
\draw[flow] (djoin) .. controls (r3a) and (r3b) .. (f.west);
\coordinate (r4a) at (6.792,0.6);
\coordinate (r4b) at (7.965,0.55);
\draw[flow] (djoin) .. controls (r4a) and (r4b) .. (g.west);
\coordinate (r5a) at (6.792,0.6);
\coordinate (r5b) at (7.965,-0.1);
\draw[flow] (djoin) .. controls (r5a) and (r5b) .. (h.west);
\coordinate (ehead) at (4.92,-1.1);
\coordinate (r6a) at (6.120,-1.1);
\coordinate (r6b) at (7.650,-1.1);
\draw[flow] (e.center) .. controls (r6a) and (r6b) .. (i.west);
\begin{pgfonlayer}{background}
  \pressureband{d.center}{r1b}{r1a}{ahead}
  \pressurehead{ahead}{a}
  \pressureband{e.center}{r2b}{r2a}{bhead}
  \pressurehead{bhead}{b}
  \pressureband{f.center}{r3b}{r3a}{djoin}
  \pressureband{g.center}{r4b}{r4a}{djoin}
  \pressureband{h.center}{r5b}{r5a}{djoin}
  \pressurehead{djoin}{d}
  \pressureband{i.center}{r6b}{r6a}{ehead}
  \pressurehead{ehead}{e}
\end{pgfonlayer}
\node[align=center] at (2.25,1.55) {Established\\feature};
\node[align=center,text=black!40] at (6.75,1.55) {Reinforcing\\shared signals};
\node[align=center] at (2.25,-1.95) {Competing\\candidate};
\node[align=center,text=black!40] at (6.75,-1.95) {Less shared\\support};
\coordinate (axisleft) at (0,-3.70);
\coordinate (axisright) at (9,-3.70);
\coordinate (axishead) at (.42,-3.70);
\coordinate (axisa) at (6,-3.70);
\coordinate (axisb) at (3,-3.70);
\begin{pgfonlayer}{background}
  \path[fill=black!15,draw=none]
    ($(axisright)+(0,.425pt)$) .. controls ($(axisa)+(0,.425pt)$) and ($(axisb)+(0,4pt)$) .. ($(axishead)+(0,4pt)$)
    -- ($(axishead)+(0,-4pt)$) .. controls ($(axisb)+(0,-4pt)$) and ($(axisa)+(0,-.425pt)$) .. ($(axisright)+(0,-.425pt)$) -- cycle;
  \pressurehead{axishead}{axisleft}
\end{pgfonlayer}
\draw[flow,line cap=round] ($(axisleft)+(1pt,0)$) -- (axisright);
\node at (4.5,-3.32) {Development};
\node[text=black!40] at (4.5,-4.20) {Training pressure};
\begin{pgfonlayer}{foreground}
  \foreach \name in {b,e,f,g,h,i} \node[potential] at (\name) {};
\end{pgfonlayer}
\pgfresetboundingbox
\path[use as bounding box] (-1.6,-4.70) rectangle (10.6,3.4);
\end{tikzpicture}
{% end %}

## What learning makes possible

The flower example also shows how development can diverge. Cammarata compares neurons in InceptionV1 and ConvNeXt trained on the same data, both initially responsive to rapeseed fields.[^cammarata] Both pick up responses to balls and fruit early in training. The ConvNeXt neuron later relinquishes those associations, while the InceptionV1 neuron spreads toward dogs and broccoli and largely loses its initial field response.

These trajectories give related beginnings different futures. A later computation can build on an earlier distinction only through information that remains available in the forward flow of activity. Useful composition therefore depends on the representation passed downstream, including relationships among its signals. The observed branches trace changes within a neuron's response pattern, with broadening and displacement as well as specialization.

Imagine two networks making the same flower distinction through different internal arrangements. Their present predictions may agree, yet their connections and parameter sensitivities offer different routes for subsequent learning. A change invisible to the current readout can therefore alter how easily a new distinction develops. Present agreement can conceal different developmental possibilities, even under the same training objective.

{% tikz(fig_w="620px", caption="A counterfactual comparison holds present predictions and incoming data constant. Distinct histories leave separate routes for developing the same candidate distinctions. In history A, existing features provide direct routes, while history B requires further reorganization for the unconnected candidates. These schematic possibilities illustrate a hypothesis about learning, separate from the observed InceptionV1 and ConvNeXt trajectories.") %}
\usetikzlibrary{arrows.meta,backgrounds,calc}
\begin{tikzpicture}[x=1cm,y=1cm,>={Stealth[length=4.6pt,width=3.6pt]},every node/.style={font=\sffamily\footnotesize},time/.style={font=\sffamily\bfseries\footnotesize},emphasis/.style={font=\sffamily\bfseries\footnotesize},feature/.style={circle,draw,fill=black,minimum size=4.6pt,inner sep=0pt,line width=.65pt},potential/.style={feature,fill=white,fill opacity=1},flow/.style={->,line width=.85pt},pressure/.style={-{Stealth[length=13pt,width=16pt]},draw=black!15,line width=8pt,line cap=round},boundary/.style={draw=black!65,line width=.8pt,dash pattern=on .1pt off 2.5pt,line cap=round}]
\pgfdeclarelayer{foreground}
\pgfsetlayers{background,main,foreground}
\newcommand{\pressureband}[4]{
  \path[fill=black!15,draw=none]
    ($(#1)+(0,2.625pt)$) .. controls ($(#2)+(0,2.625pt)$) and ($(#3)+(0,4pt)$) .. ($(#4)+(0,4pt)$)
    -- ($(#4)+(0,-4pt)$) .. controls ($(#3)+(0,-4pt)$) and ($(#2)+(0,-2.625pt)$) .. ($(#1)+(0,-2.625pt)$) -- cycle;
}
\newcommand{\pressurehead}[2]{
  \path[fill=black!15,draw=none]
    ($(#1)+(0,4pt)$) -- ($(#2)+(.42cm,4pt)$) -- ($(#2)+(.42cm,8pt)$)
    -- (#2.center) -- ($(#2)+(.42cm,-8pt)$) -- ($(#2)+(.42cm,-4pt)$)
    -- ($(#1)+(0,-4pt)$) -- cycle;
}
\node[time] at (0,3) {PAST};
\node at (0,2.60) {inherited features};
\node[time] at (4.5,3) {PRESENT};
\node at (4.5,2.60) {feature population};
\node[time] at (9,3) {FUTURE};
\node at (9,2.60) {potential distinctions};
\foreach \base in {0,-4.2} {
  \foreach \x in {0,4.5,9} \draw[boundary] (\x,\base) ellipse (.7cm and 1.25cm);
}
\node[emphasis] at (2.25,1.53) {History A};
\node[emphasis] at (2.25,-2.67) {History B};
\node[feature] (a) at (0,0) {};
\node[feature] (b) at (4.5,0.55) {};
\node[feature] (c) at (4.5,-0.55) {};
\node[feature] (d) at (9,0.9) {};
\node[feature] (e) at (9,0) {};
\node[feature] (f) at (9,-0.9) {};
\node[feature] (g) at (0,-3.55) {};
\node[feature] (h) at (0,-4.85) {};
\node[feature] (i) at (4.5,-3.4) {};
\node[feature] (j) at (4.5,-4.2) {};
\node[feature] (k) at (4.5,-5) {};
\node[feature] (l) at (9,-3.3) {};
\node[feature] (m) at (9,-4.2) {};
\node[feature] (n) at (9,-5.1) {};
\coordinate (ajoin) at (1.05,0);
\draw[line width=.85pt] (a.center) -- (ajoin);
\coordinate (ahead) at (0.42,0);
\coordinate (r1a) at (2.292,0);
\coordinate (r1b) at (3.465,0.55);
\draw[flow] (ajoin) .. controls (r1a) and (r1b) .. (b.west);
\coordinate (r2a) at (2.292,0);
\coordinate (r2b) at (3.465,-0.55);
\draw[flow] (ajoin) .. controls (r2a) and (r2b) .. (c.west);
\coordinate (bjoin) at (5.55,0.55);
\draw[line width=.85pt] (b.center) -- (bjoin);
\coordinate (bhead) at (4.92,0.55);
\coordinate (r3a) at (6.792,0.55);
\coordinate (r3b) at (7.965,0.9);
\draw[flow] (bjoin) .. controls (r3a) and (r3b) .. (d.west);
\coordinate (r4a) at (6.792,0.55);
\coordinate (r4b) at (7.965,0);
\draw[flow] (bjoin) .. controls (r4a) and (r4b) .. (e.west);
\coordinate (chead) at (4.92,-0.55);
\coordinate (r5a) at (6.120,-0.55);
\coordinate (r5b) at (7.650,-0.9);
\draw[flow] (c.center) .. controls (r5a) and (r5b) .. (f.west);
\coordinate (gjoin) at (1.05,-3.55);
\draw[line width=.85pt] (g.center) -- (gjoin);
\coordinate (ghead) at (0.42,-3.55);
\coordinate (r6a) at (2.292,-3.55);
\coordinate (r6b) at (3.465,-3.4);
\draw[flow] (gjoin) .. controls (r6a) and (r6b) .. (i.west);
\coordinate (r7a) at (2.292,-3.55);
\coordinate (r7b) at (3.465,-4.2);
\draw[flow] (gjoin) .. controls (r7a) and (r7b) .. (j.west);
\coordinate (hhead) at (0.42,-4.85);
\coordinate (r8a) at (1.620,-4.85);
\coordinate (r8b) at (3.150,-5);
\draw[flow] (h.center) .. controls (r8a) and (r8b) .. (k.west);
\coordinate (jhead) at (4.92,-4.2);
\coordinate (r9a) at (6.120,-4.2);
\coordinate (r9b) at (7.650,-4.2);
\draw[flow] (j.center) .. controls (r9a) and (r9b) .. (m.west);
\begin{pgfonlayer}{background}
  \pressureband{b.center}{r1b}{r1a}{ajoin}
  \pressureband{c.center}{r2b}{r2a}{ajoin}
  \pressurehead{ajoin}{a}
  \pressureband{d.center}{r3b}{r3a}{bjoin}
  \pressureband{e.center}{r4b}{r4a}{bjoin}
  \pressurehead{bjoin}{b}
  \pressureband{f.center}{r5b}{r5a}{chead}
  \pressurehead{chead}{c}
  \pressureband{i.center}{r6b}{r6a}{gjoin}
  \pressureband{j.center}{r7b}{r7a}{gjoin}
  \pressurehead{gjoin}{g}
  \pressureband{k.center}{r8b}{r8a}{hhead}
  \pressurehead{hhead}{h}
  \pressureband{m.center}{r9b}{r9a}{jhead}
  \pressurehead{jhead}{j}
\end{pgfonlayer}
\node[align=center] at (4.5,-1.65) {Same bloom\\prediction};
\node[align=center] at (9,-1.65) {Direct reuse};
\node[align=center] at (4.5,-5.95) {Same bloom\\prediction};
\node[align=center] at (9,-5.95) {Further\\reorganization};
\node[align=center] at (0,-5.95) {Distinct\\history};
\coordinate (axisleft) at (0,-7.75);
\coordinate (axisright) at (9,-7.75);
\coordinate (axishead) at (.42,-7.75);
\coordinate (axisa) at (6,-7.75);
\coordinate (axisb) at (3,-7.75);
\begin{pgfonlayer}{background}
  \path[fill=black!15,draw=none]
    ($(axisright)+(0,.425pt)$) .. controls ($(axisa)+(0,.425pt)$) and ($(axisb)+(0,4pt)$) .. ($(axishead)+(0,4pt)$)
    -- ($(axishead)+(0,-4pt)$) .. controls ($(axisb)+(0,-4pt)$) and ($(axisa)+(0,-.425pt)$) .. ($(axisright)+(0,-.425pt)$) -- cycle;
  \pressurehead{axishead}{axisleft}
\end{pgfonlayer}
\draw[flow,line cap=round] ($(axisleft)+(1pt,0)$) -- (axisright);
\node at (4.5,-7.37) {Development};
\node[text=black!40] at (4.5,-8.25) {Training pressure};
\begin{pgfonlayer}{foreground}
  \foreach \name in {d,e,f,l,m,n} \node[potential] at (\name) {};
\end{pgfonlayer}
\pgfresetboundingbox
\path[use as bounding box] (-1.6,-8.70) rectangle (10.6,3.4);
\end{tikzpicture}
{% end %}

## Selection and transmission

George Price introduced an identity separating change through differential weighting from change during transmission.[^price] Here, $z$ is an ancestor's measured trait and $w$ its descendant weight. The change $\Delta z$ is its descendants' mean trait minus its own. The two terms distinguish selection from changes within lineages, including refinement and recombination.[^price1972][^frank1997]

```math
\Delta\bar z
=
\underbrace{\frac{\operatorname{Cov}(w,z)}{\bar w}}_{\text{selection}}
+
\underbrace{\frac{\mathbb E[w\Delta z]}{\bar w}}_{\text{transmission}}.
```

For the flower example, $z$ could measure mean activation on field images minus mean activation on fixed non-field controls. Following neuron coordinates across checkpoints gives each ancestor one equally weighted descendant, placing all observed change under transmission. A nonzero selection term requires an explicit population, ancestry rule, and differential descendant weighting. The equation accounts for change under those choices, while the gradient hypothesis concerns its cause.

{% tikz(fig_w="620px", caption="Fractions give the learned share of each population. Selection increases the representation of an already learned distinction, while transmission turns an unlearned candidate into a learned distinction. Both reach three quarters through distinct changes. Grey arrows suggest causal training pressure, while the Price equation accounts for change under declared lineages.") %}
\usetikzlibrary{arrows.meta,backgrounds,calc}
\begin{tikzpicture}[x=1cm,y=1cm,>={Stealth[length=4.6pt,width=3.6pt]},every node/.style={font=\sffamily\footnotesize},time/.style={font=\sffamily\bfseries\footnotesize},emphasis/.style={font=\sffamily\bfseries\footnotesize},feature/.style={circle,draw,fill=black,minimum size=4.6pt,inner sep=0pt,line width=.65pt},potential/.style={feature,fill=white,fill opacity=1},flow/.style={->,line width=.85pt},pressure/.style={-{Stealth[length=13pt,width=16pt]},draw=black!15,line width=8pt,line cap=round},boundary/.style={draw=black!65,line width=.8pt,dash pattern=on .1pt off 2.5pt,line cap=round}]
\pgfdeclarelayer{foreground}
\pgfsetlayers{background,main,foreground}
\newcommand{\pressureband}[4]{
  \path[fill=black!15,draw=none]
    ($(#1)+(0,2.625pt)$) .. controls ($(#2)+(0,2.625pt)$) and ($(#3)+(0,4pt)$) .. ($(#4)+(0,4pt)$)
    -- ($(#4)+(0,-4pt)$) .. controls ($(#3)+(0,-4pt)$) and ($(#2)+(0,-2.625pt)$) .. ($(#1)+(0,-2.625pt)$) -- cycle;
}
\newcommand{\pressurehead}[2]{
  \path[fill=black!15,draw=none]
    ($(#1)+(0,4pt)$) -- ($(#2)+(.42cm,4pt)$) -- ($(#2)+(.42cm,8pt)$)
    -- (#2.center) -- ($(#2)+(.42cm,-8pt)$) -- ($(#2)+(.42cm,-4pt)$)
    -- ($(#1)+(0,-4pt)$) -- cycle;
}
\newcommand{\diagonalfraction}[2]{\textsuperscript{#1}\kern-.12em/\kern-.12em\textsubscript{#2}}
\tikzset{fraction/.style={anchor=north,inner sep=0pt,outer sep=0pt}}
\node[time] at (0,3) {PAST};
\node at (0,2.60) {ancestor population};
\node[time] at (4.5,3) {PRESENT};
\node at (4.5,2.60) {developing population};
\node[time] at (9,3) {FUTURE};
\node at (9,2.60) {descendant population};
\node[emphasis] at (4.5,1.8) {Selection};
\node[emphasis] at (4.5,-2.40) {Transmission};
\foreach \base in {0,-4.2} {
  \foreach \x in {0,4.5,9} \draw[boundary] (\x,\base) ellipse (.7cm and 1.3cm);
}
\node[feature] (a) at (0,0.65) {};
\node[feature] (b) at (0,-0.65) {};
\node[feature] (c) at (4.5,0.65) {};
\node[feature] (d) at (4.5,-0.65) {};
\node[feature] (e) at (9,0.9) {};
\node[feature] (f) at (9,0.3) {};
\node[feature] (g) at (9,-0.3) {};
\node[feature] (h) at (9,-0.9) {};
\node[feature] (i) at (0,-3.30) {};
\node[feature] (j) at (0,-3.90) {};
\node[feature] (k) at (0,-4.50) {};
\node[feature] (l) at (0,-5.10) {};
\node[feature] (m) at (4.5,-3.30) {};
\node[feature] (n) at (4.5,-3.90) {};
\node[feature] (o) at (4.5,-4.50) {};
\node[feature] (q) at (4.5,-5.10) {};
\node[feature] (r) at (9,-3.30) {};
\node[feature] (t) at (9,-3.90) {};
\node[feature] (u) at (9,-4.50) {};
\node[feature] (v) at (9,-5.10) {};
\coordinate (ahead) at (0.42,0.65);
\coordinate (r1a) at (1.620,0.65);
\coordinate (r1b) at (3.150,0.65);
\draw[flow] (a.center) .. controls (r1a) and (r1b) .. (c.west);
\coordinate (bhead) at (0.42,-0.65);
\coordinate (r2a) at (1.620,-0.65);
\coordinate (r2b) at (3.150,-0.65);
\draw[flow] (b.center) .. controls (r2a) and (r2b) .. (d.west);
\coordinate (chead) at (4.92,0.65);
\coordinate (r3a) at (6.120,0.65);
\coordinate (r3b) at (7.650,0.9);
\draw[flow] (c.center) .. controls (r3a) and (r3b) .. (e.west);
\coordinate (djoin) at (5.55,-0.65);
\draw[line width=.85pt] (d.center) -- (djoin);
\coordinate (dhead) at (4.92,-0.65);
\coordinate (r4a) at (6.792,-0.65);
\coordinate (r4b) at (7.965,0.3);
\draw[flow] (djoin) .. controls (r4a) and (r4b) .. (f.west);
\coordinate (r5a) at (6.792,-0.65);
\coordinate (r5b) at (7.965,-0.3);
\draw[flow] (djoin) .. controls (r5a) and (r5b) .. (g.west);
\coordinate (r6a) at (6.792,-0.65);
\coordinate (r6b) at (7.965,-0.9);
\draw[flow] (djoin) .. controls (r6a) and (r6b) .. (h.west);
\coordinate (ihead) at (0.42,-3.30);
\coordinate (r7a) at (1.620,-3.30);
\coordinate (r7b) at (3.150,-3.30);
\draw[flow] (i.center) .. controls (r7a) and (r7b) .. (m.west);
\coordinate (jhead) at (0.42,-3.90);
\coordinate (r8a) at (1.620,-3.90);
\coordinate (r8b) at (3.150,-3.90);
\draw[flow] (j.center) .. controls (r8a) and (r8b) .. (n.west);
\coordinate (khead) at (0.42,-4.50);
\coordinate (r9a) at (1.620,-4.50);
\coordinate (r9b) at (3.150,-4.50);
\draw[flow] (k.center) .. controls (r9a) and (r9b) .. (o.west);
\coordinate (lhead) at (0.42,-5.10);
\coordinate (r10a) at (1.620,-5.10);
\coordinate (r10b) at (3.150,-5.10);
\draw[flow] (l.center) .. controls (r10a) and (r10b) .. (q.west);
\coordinate (mhead) at (4.92,-3.30);
\coordinate (r11a) at (6.120,-3.30);
\coordinate (r11b) at (7.650,-3.30);
\draw[flow] (m.center) .. controls (r11a) and (r11b) .. (r.west);
\coordinate (nhead) at (4.92,-3.90);
\coordinate (r12a) at (6.120,-3.90);
\coordinate (r12b) at (7.650,-3.90);
\draw[flow] (n.center) .. controls (r12a) and (r12b) .. (t.west);
\coordinate (ohead) at (4.92,-4.50);
\coordinate (r13a) at (6.120,-4.50);
\coordinate (r13b) at (7.650,-4.50);
\draw[flow] (o.center) .. controls (r13a) and (r13b) .. (u.west);
\coordinate (qhead) at (4.92,-5.10);
\coordinate (r14a) at (6.120,-5.10);
\coordinate (r14b) at (7.650,-5.10);
\draw[flow] (q.center) .. controls (r14a) and (r14b) .. (v.west);
\begin{pgfonlayer}{background}
  \pressureband{c.center}{r1b}{r1a}{ahead}
  \pressurehead{ahead}{a}
  \pressureband{d.center}{r2b}{r2a}{bhead}
  \pressurehead{bhead}{b}
  \pressureband{e.center}{r3b}{r3a}{chead}
  \pressurehead{chead}{c}
  \pressureband{f.center}{r4b}{r4a}{djoin}
  \pressureband{g.center}{r5b}{r5a}{djoin}
  \pressureband{h.center}{r6b}{r6a}{djoin}
  \pressurehead{djoin}{d}
  \pressureband{m.center}{r7b}{r7a}{ihead}
  \pressurehead{ihead}{i}
  \pressureband{n.center}{r8b}{r8a}{jhead}
  \pressurehead{jhead}{j}
  \pressureband{o.center}{r9b}{r9a}{khead}
  \pressurehead{khead}{k}
  \pressureband{q.center}{r10b}{r10a}{lhead}
  \pressurehead{lhead}{l}
  \pressureband{r.center}{r11b}{r11a}{mhead}
  \pressurehead{mhead}{m}
  \pressureband{t.center}{r12b}{r12a}{nhead}
  \pressurehead{nhead}{n}
  \pressureband{u.center}{r13b}{r13a}{ohead}
  \pressurehead{ohead}{o}
  \pressureband{v.center}{r14b}{r14a}{qhead}
  \pressurehead{qhead}{q}
\end{pgfonlayer}
\foreach \x/\share in {0/{\diagonalfraction{1}{2}},4.5/{\diagonalfraction{1}{2}},9/{\diagonalfraction{3}{4}}}
  \node[fraction] at (\x,-1.45) {\share};
\foreach \x/\share in {0/{\diagonalfraction{1}{2}},4.5/{\diagonalfraction{3}{4}},9/{\diagonalfraction{3}{4}}}
  \node[fraction] at (\x,-5.65) {\share};
\coordinate (axisleft) at (0,-7.40);
\coordinate (axisright) at (9,-7.40);
\coordinate (axishead) at (.42,-7.40);
\coordinate (axisa) at (6,-7.40);
\coordinate (axisb) at (3,-7.40);
\begin{pgfonlayer}{background}
  \path[fill=black!15,draw=none]
    ($(axisright)+(0,.425pt)$) .. controls ($(axisa)+(0,.425pt)$) and ($(axisb)+(0,4pt)$) .. ($(axishead)+(0,4pt)$)
    -- ($(axishead)+(0,-4pt)$) .. controls ($(axisb)+(0,-4pt)$) and ($(axisa)+(0,-.425pt)$) .. ($(axisright)+(0,-.425pt)$) -- cycle;
  \pressurehead{axishead}{axisleft}
\end{pgfonlayer}
\draw[flow,line cap=round] ($(axisleft)+(1pt,0)$) -- (axisright);
\node at (4.5,-7.02) {Development};
\node[text=black!40] at (4.5,-7.90) {Training pressure};
\begin{pgfonlayer}{foreground}
  \foreach \name in {a,c,e,i,j,m,r} \node[potential] at (\name) {};
\end{pgfonlayer}
\pgfresetboundingbox
\path[use as bounding box] (-1.6,-8.35) rectangle (10.6,3.4);
\end{tikzpicture}
{% end %}

## Reading a network through its history

Following the flower neuron reveals how repeated training redirects activity through inherited distinctions. Under the proposed mechanism, existing responses make some extensions easier to optimize than others. Gradient reinforcement and competition could explain which available continuations become established. This predicts preferential growth along already responsive pathways, subject to testing through measured gradients and controlled interventions.

The divergence between ConvNeXt and InceptionV1 shows both selective retention and displacement of earlier responses. A flower-sensitive pathway acquiring dog responses might help one reader while making flower detection harder for another. Differentiated downstream pathways could accommodate both uses, provided the shared signal retains the necessary distinctions. Inherited organization shapes which new capabilities can develop together, as well as the ease of developing each alone.

Watching a network develop reveals how its history shapes its responsiveness to new training. The same error can produce different changes through circuitry organized by different pasts. Recursive generalization may trace how repeated flows of training activity open some developmental routes while narrowing others. Learning builds the machinery of its own future learning.

---

[^cammarata]: Cammarata, N. (2026). [*Neural Networks Are Already Clean*](https://already-clean.goodfire.com/). Goodfire.

[^coherent]: Chatterjee, S. (2020). [*Coherent Gradients: An Approach to Understanding Generalization in Gradient Descent-based Optimization*](https://arxiv.org/abs/2002.10657).

[^price]: Price, G. R. (1970). [*Selection and Covariance*](https://doi.org/10.1038/227520a0). *Nature*, 227, 520–521.

[^price1972]: Price, G. R. (1972). [Extension of covariance selection mathematics](https://doi.org/10.1111/j.1469-1809.1957.tb01874.x). *Annals of Human Genetics*, 35, 485–490.

[^frank1997]: Frank, S. A. (1997). [The Price Equation, Fisher’s Fundamental Theorem, Kin Selection, and Causal Analysis](https://stevefrank.org/reprints-pdf/97Evol-Causal.pdf). *Evolution*, 51(6), 1712–1729.
