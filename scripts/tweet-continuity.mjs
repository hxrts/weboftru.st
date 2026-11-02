import { readFile } from 'node:fs/promises';
import tikzjax from 'node-tikzjax';
import '../static/tikzjax/ligatures.js';

// Frozen experiment used by the post: flower-toy
// b13556724b777d88d861b6d462bd3255bb684078/data/handoff_trajectories.csv.
export async function continuityPlotTex() {
    const csv = await readFile(new URL('./data/handoff-trajectories.csv', import.meta.url), 'utf8');
    const [header, ...rows] = csv.trim().split(/\r?\n/).map(line => line.split(','));
    const records = rows.map(row => Object.fromEntries(header.map((key, i) => [key, key === 'schedule' ? row[i] : Number(row[i])])));
    for (const schedule of ['continuous', 'interrupted']) {
        const trace = records.filter(row => row.schedule === schedule);
        if (trace.length !== 81 || trace.some((row, i) => row.step !== i || row.negative_score !== 0 || !Number.isFinite(row.flower_score))) throw new Error('Unexpected handoff trace');
        const failures = trace.filter(row => row.flower_accuracy !== 1).map(row => row.step);
        if (JSON.stringify(failures) !== JSON.stringify(schedule === 'continuous' ? [] : Array.from({ length: 50 }, (_, i) => i + 1))) throw new Error('Handoff failure interval changed');
    }
    let tex = String.raw`\begin{tikzpicture}[learning,every node/.style={font=\sffamily\small}]
\node[rotate=90] at (-1.5,3.2) {Reader score (flower-present inputs)};
`;
    for (const [schedule, base, title] of [['continuous', 4, 'Continuous handoff'], ['interrupted', 0, 'Interrupted recovery']]) {
        tex += `\\node[anchor=west,font=\\sffamily\\bfseries\\small] at (0,${base + 2.9}) {${title}};\n`;
        if (schedule === 'interrupted') tex += String.raw`\fill[black!8] (.125,0) rectangle (6.25,2.4);
\node[text=black!65] at (3.2,1.9) {Temporary failure};
`;
        for (const [score, label] of [[0, '0'], [0.45, '0.45'], [1, '1']]) {
            const y = base + score * 2.4;
            tex += `\\node[anchor=east] at (-.18,${y}) {${label}};\n`;
            if (score === 0.45) tex += `\\draw[black!55,dashed,line width=.65pt] (0,${y}) -- (10,${y});\n`;
        }
        tex += `\\draw[line width=.7pt] (0,${base + 2.4}) -- (0,${base}) -- (10,${base});\n`;
        tex += `\\node[anchor=west,text=black!60] at (10.15,${base + 1.08}) {Threshold};\n`;
        const trace = records.filter(row => row.schedule === schedule);
        tex += `\\draw[black,line width=1.1pt,line join=round] plot coordinates {${trace.map(row => `(${(row.step / 8).toFixed(4)},${(base + row.flower_score * 2.4).toFixed(7)})`).join(' ')}};\n`;
        for (const step of [0, 40, 80]) {
            tex += `\\draw[line width=.6pt] (${step / 8},${base}) -- (${step / 8},${base - .1});\n`;
            tex += `\\node[anchor=north] at (${step / 8},${base - .18}) {${step}};\n`;
        }
    }
    tex += String.raw`\node[text=black!65] at (5,4.45) {Reader correct throughout};
\node at (5,-.9) {Training updates};
\end{tikzpicture}`;
    return tex;
}

export async function continuityPlotSvg() {
    const tex = await continuityPlotTex();
    const styles = (await readFile(new URL('../templates/partials/tikz-learning.html', import.meta.url), 'utf8')).replace('{% raw %}', '').replace('{% endraw %}', '');
    const svg = await tikzjax.default(`\\begin{document}${styles}${globalThis.preventFlLigatures(tex)}\\end{document}`);
    if (!svg.startsWith('<svg')) throw new Error('Invalid continuity SVG');
    return svg;
}
