// Prevent the TeX engine's lowercase "fl" ligature from being emitted as a
// single glyph. Shared by browser previews and build-time rendering.
function preventFlLigatures(source) {
    const labelArguments = {
        aboveannotation: [2],
        abovenodelabel: [1],
        belowannotation: [2],
        belownodelabel: [1],
        halolabel: [2],
        leftlabel: [1],
        leftrowlabel: [2],
        rightlabel: [2],
        rightstacklabel: [3],
        stageheading: [1, 2],
    };

    function readGroup(text, start, open = '{', close = '}') {
        if (text[start] !== open) return null;
        let depth = 0;
        for (let i = start; i < text.length; i++) {
            if (text[i] === '\\') {
                i++;
                continue;
            }
            if (text[i] === open) depth++;
            if (text[i] === close && --depth === 0) return i + 1;
        }
        return null;
    }

    function transformText(text) {
        let output = '';
        let inMath = false;
        for (let i = 0; i < text.length;) {
            const char = text[i];
            if (char === '\\') {
                const next = text[i + 1];
                if (next === '(') inMath = true;
                if (next === ')') inMath = false;
                output += text.slice(i, i + 2);
                i += Math.min(2, text.length - i);
            } else if (char === '$') {
                inMath = !inMath;
                output += char;
                i++;
            } else if (!inMath && text.startsWith('fl', i)) {
                output += 'f{}l';
                i += 2;
            } else {
                output += char;
                i++;
            }
        }
        return output;
    }

    function skipSpace(text, i) {
        while (i < text.length && /\s/.test(text[i])) i++;
        return i;
    }

    function nodeTextGroup(text, i) {
        i = skipSpace(text, i);
        if (text[i] === '[') {
            i = readGroup(text, i, '[', ']');
            if (i === null) return null;
            i = skipSpace(text, i);
        }
        if (text[i] === '(') {
            i = readGroup(text, i, '(', ')');
            if (i === null) return null;
            i = skipSpace(text, i);
        }
        if (text.slice(i, i + 2) === 'at' && !/[A-Za-z@]/.test(text[i + 2] ?? '')) {
            i = skipSpace(text, i + 2);
            if (text[i] === '(') {
                i = readGroup(text, i, '(', ')');
                if (i === null) return null;
                i = skipSpace(text, i);
            }
        }
        return text[i] === '{' ? [i, readGroup(text, i)] : null;
    }

    let output = '';
    for (let i = 0; i < source.length;) {
        if (source[i] === '%') {
            const newline = source.indexOf('\n', i);
            const end = newline === -1 ? source.length : newline;
            output += source.slice(i, end);
            i = end;
            continue;
        }

        if (source[i] !== '\\') {
            output += source[i++];
            continue;
        }

        const start = i++;
        if (i >= source.length) {
            output += '\\';
            break;
        }
        if (!/[A-Za-z@]/.test(source[i])) {
            output += source.slice(start, ++i);
            continue;
        }
        while (i < source.length && /[A-Za-z@]/.test(source[i])) i++;
        const command = source.slice(start + 1, i);

        if (command === 'tikzset') {
            i = skipSpace(source, i);
            const end = readGroup(source, i);
            output += source.slice(start, end ?? i);
            i = end ?? i;
            continue;
        }

        if (command === 'node') {
            const group = nodeTextGroup(source, i);
            if (group && group[1] !== null) {
                output += source.slice(start, group[0] + 1);
                output += transformText(source.slice(group[0] + 1, group[1] - 1));
                output += '}';
                i = group[1];
                continue;
            }
        }

        const targets = labelArguments[command];
        if (targets) {
            let cursor = i;
            const groups = [];
            let valid = true;
            for (let index = 0; index <= Math.max(...targets); index++) {
                cursor = skipSpace(source, cursor);
                if (source[cursor] !== '{') {
                    valid = false;
                    break;
                }
                const end = readGroup(source, cursor);
                if (end === null) {
                    valid = false;
                    break;
                }
                groups.push([cursor, end]);
                cursor = end;
            }
            if (valid) {
                output += source.slice(start, groups[0][0]);
                let groupStart = groups[0][0];
                for (let index = 0; index < groups.length; index++) {
                    const [from, to] = groups[index];
                    output += source.slice(groupStart, from);
                    output += '{';
                    output += targets.includes(index)
                        ? transformText(source.slice(from + 1, to - 1))
                        : source.slice(from + 1, to - 1);
                    output += '}';
                    groupStart = to;
                }
                output += source.slice(groups.at(-1)[1], cursor);
                i = cursor;
                continue;
            }
        }

        output += source.slice(start, i);
    }
    return output;
}

globalThis.preventFlLigatures = preventFlLigatures;
