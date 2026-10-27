        function alignLearningFigure(fig) {
            const frame = fig.getAttribute('data-learning-frame');
            const svg = fig.querySelector('svg');
            if (!frame || !svg) return;
            const rootMatrix = svg.getCTM();
            if (!rootMatrix) return;
            const inverse = rootMatrix.inverse();
            const bounds = Array.from(svg.querySelectorAll('[stroke-dasharray]')).map(el => {
                const box = el.getBBox();
                const matrix = el.getCTM();
                if (!matrix) return null;
                const relative = inverse.multiply(matrix);
                return [
                    new DOMPoint(box.x, box.y).matrixTransform(relative).x,
                    new DOMPoint(box.x + box.width, box.y).matrixTransform(relative).x,
                ];
            }).filter(Boolean);
            if (!bounds.length) return;
            const left = Math.min(...bounds.flat());
            const right = Math.max(...bounds.flat());
            // Center the rendered label itself, independent of TeX font metrics.
            svg.querySelectorAll('text').forEach(text => {
                if (text.textContent.trim() !== 'Development') return;
                const matrix = text.getCTM();
                if (!matrix) return;
                const relative = inverse.multiply(matrix);
                const baseline = new DOMPoint(0, text.y.baseVal.getItem(0).value).matrixTransform(relative);
                const position = new DOMPoint((left + right) / 2, baseline.y).matrixTransform(relative.inverse());
                text.setAttribute('x', position.x);
                text.setAttribute('text-anchor', 'middle');
            });
            // Oval centers are x=0 and x=9, each with horizontal radius .7.
            const centers = fig.getAttribute('data-learning-centers');
            const [firstCenter, lastCenter] = centers ? centers.split(' ').map(Number) : [0, 9];
            const radius = centers ? .63 : .7;
            const unit = (right - left) / (lastCenter - firstCenter + 2 * radius);
            const [frameLeft, frameRight] = frame.split(' ').map(Number);
            const viewBox = svg.viewBox.baseVal;
            const width = (frameRight - frameLeft) * unit;
            svg.setAttribute('viewBox', `${left + (frameLeft - firstCenter + radius) * unit} ${viewBox.y} ${width} ${viewBox.height}`);
            svg.setAttribute('width', `${width * 4 / 3}px`);
        }


document.querySelectorAll('.tikz-fig[data-learning-frame]').forEach(alignLearningFigure);
