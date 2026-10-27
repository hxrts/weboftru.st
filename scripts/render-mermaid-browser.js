        if (typeof mermaid !== 'undefined') {
            // Convert code blocks to mermaid pre elements
            document.querySelectorAll('code.language-mermaid').forEach(el => {
                const pre = el.parentElement;
                const mermaidPre = document.createElement('pre');
                mermaidPre.className = 'mermaid';
                mermaidPre.textContent = el.textContent;
                pre.replaceWith(mermaidPre);
            });

            // Get CSS custom properties for consistent theming
            const styles = getComputedStyle(document.documentElement);
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const isDark = currentTheme === 'dark';

            const gray900 = styles.getPropertyValue('--gray-900').trim();
            const gray700 = styles.getPropertyValue('--gray-700').trim();
            const gray500 = styles.getPropertyValue('--gray-500').trim();
            const gray400 = styles.getPropertyValue('--gray-400').trim();
            const gray300 = styles.getPropertyValue('--gray-300').trim();
            const gray100 = styles.getPropertyValue('--gray-100').trim();
            const white = styles.getPropertyValue('--white').trim();
            const blue600 = styles.getPropertyValue('--blue-600').trim();
            const blue700 = styles.getPropertyValue('--blue-700').trim();
            const purple600 = styles.getPropertyValue('--purple-600').trim();
            const green600 = styles.getPropertyValue('--green-600').trim();
            const orange600 = styles.getPropertyValue('--orange-600').trim();
            const fontSans = styles.getPropertyValue('--font-sans').trim().replace(/\s+/g, ' ');
            const fontSize = styles.getPropertyValue('--t-sm').trim();

            // Theme-specific colors (dark mode uses 0x96f palette)
            const nodeBgColor = isDark ? '#363338' : gray300;      // Inner node boxes
            const clusterBgColor = isDark ? 'rgba(54, 51, 56, 0.5)' : gray100;   // Outer subgraph boxes
            const mainBgColor = isDark ? '#262427' : gray100;      // 0x96f background
            const textColor = isDark ? '#FCFCFA' : gray900;        // 0x96f foreground
            const labelTextColor = isDark ? '#FCFCFA' : gray900;   // 0x96f foreground
            const borderColor = isDark ? '#6B6B6A' : '#c0c0c0';      // 0x96f comment gray
            const lineColor = isDark ? '#8B8B8A' : gray400;        // 0x96f comment gray
            const secondaryBorder = isDark ? '#8B8B8A' : gray400;

            mermaid.initialize({
                startOnLoad: false,
                theme: 'base',
                flowchart: {
                    curve: 'linear'
                },
                themeVariables: {
                    // Global fonts
                    'fontFamily': fontSans,
                    'fontSize': fontSize,

                    // Background and surfaces
                    'primaryColor': nodeBgColor,
                    'primaryBorderColor': borderColor,
                    'primaryTextColor': textColor,

                    'secondaryColor': nodeBgColor,
                    'secondaryBorderColor': borderColor,
                    'secondaryTextColor': textColor,

                    'tertiaryColor': nodeBgColor,
                    'tertiaryBorderColor': borderColor,
                    'tertiaryTextColor': textColor,

                    // Main text and lines
                    'textColor': labelTextColor,
                    'lineColor': lineColor,
                    'mainBkg': nodeBgColor,

                    // Flowchart
                    'nodeBorder': borderColor,
                    'clusterBkg': clusterBgColor,
                    'clusterBorder': borderColor,
                    'defaultLinkColor': borderColor,
                    'edgeLabelBackground': isDark ? '#363338' : mainBgColor,

                    // Sequence diagrams (dark mode uses 0x96f accent colors)
                    'actor0Bkg': isDark ? '#4a2a2a' : '#ffe1e1',    // Muted coral (from #FF7272)
                    'actor1Bkg': isDark ? '#2a3d42' : '#e1f5ff',    // Muted cyan (from #49CAE4)
                    'actor2Bkg': isDark ? '#2d3a2a' : '#e1f5ff',    // Muted lime (from #BCDF59)
                    'actor3Bkg': isDark ? '#3a3242' : '#e1f5ff',    // Muted purple (from #A093E2)
                    'actorBkg': nodeBgColor,
                    'actorBorder': secondaryBorder,
                    'actorTextColor': textColor,
                    'actorLineColor': secondaryBorder,
                    'signalColor': secondaryBorder,
                    'signalTextColor': labelTextColor,
                    'labelBoxBkgColor': isDark ? 'transparent' : mainBgColor,
                    'labelBoxBorderColor': isDark ? 'transparent' : borderColor,
                    'labelTextColor': labelTextColor,
                    'loopTextColor': labelTextColor,
                    'altBackground': isDark ? 'rgba(139, 139, 138, 0.15)' : 'rgba(158, 158, 158, 0.1)',  // Based on 0x96f comment
                    'activationBorderColor': borderColor,
                    'activationBkgColor': nodeBgColor,
                    'sequenceNumberColor': white,

                    // Sequence note boxes (yellow in light, muted olive in dark)
                    'noteBkgColor': isDark ? '#3d3a26' : '#fff5ad',
                    'noteTextColor': isDark ? '#FCFCFA' : '#333333',
                    'noteBorderColor': isDark ? '#8b8b8a' : '#e4db95',

                    // Special colors (dark mode uses 0x96f palette)
                    'activeTaskBkgColor': isDark ? '#49CAE4' : blue600,    // 0x96f cyan
                    'activeTaskBorderColor': isDark ? '#3ab0c9' : blue700,
                    'doneTaskBkgColor': isDark ? '#BCDF59' : green600,     // 0x96f lime
                    'critBkgColor': isDark ? '#FF7272' : orange600,        // 0x96f coral
                    'critBorderColor': isDark ? '#FF7272' : orange600
                }
            });

            // Render diagrams and mark as processed to fade them in
            window.diagramsRendered = (async () => {
                const diagrams = document.querySelectorAll('.mermaid');
                for (const diagram of diagrams) {
                    try {
                        await mermaid.run({ nodes: [diagram] });
                        diagram.setAttribute('data-processed', 'true');

                    } catch (e) {
                        throw e;
                    }
                }
            })();
        }
