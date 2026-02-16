/**
 * Boxy - Single Piece Folding Lid Designer
 * Classic shoe box design with integrated lid and double-wall construction
 */

function singlePieceFoldingLidDesigner() {
    return {
        styleName: 'Single Piece Folding Lid',
        filePrefix: 'single-piece-folding-lid',

        box: {
            length: 254,    // L - length of base
            width: 204,     // W - width of base  
            height: 98,     // H - wall height
            dustFlapPct: 50, // Dust flap length as % (100% = W/2)
            dustOuterWidthPct: 60, // Outer width as % of H (inner width = H)
            tuckFlap: 20,   // Tuck flap width (for LID side tucks)
            tuckRound: 8,   // Tuck flap corner roundness (for LID side tucks)
            lidFlapWidth: 50, // Lid flap height (min = 50mm, max = H)
            lidTuckRadius: 25, // Lid tuck corner radius (max = lidFlapWidth)
            // Double wall lock system
            lockEnabled: true,  // Toggle lock system
            lockCount: 2,       // Number of locks (1-3)
            lockLength: 30,     // Length of each lock tab
            lockGap: 20,        // Gap between locks
            slotWidth: 3        // Width of slots (and lock tabs)
        },

        display: {
            showDimensions: true,
            showLabels: true,
            showGrid: false,
            scale: 1.0
        },

        init() {
            this.$watch('box', () => { }, { deep: true });
            this.$watch('display', () => { }, { deep: true });
        },

        // Calculate pattern dimensions for export
        getPatternDimensions() {
            const L = parseFloat(this.box.length);
            const W = parseFloat(this.box.width);
            const H = parseFloat(this.box.height);
            const dustPct = parseFloat(this.box.dustFlapPct);
            const dust = (dustPct / 100) * (W / 2);
            const tuck = parseFloat(this.box.tuckFlap);
            const lidW = Math.min(parseFloat(this.box.lidFlapWidth), H);
            const lockEnabled = this.box.lockEnabled === true || this.box.lockEnabled === 'true';
            const slotWidth = parseFloat(this.box.slotWidth);

            const padding = 60;
            const baseSideWidth = Math.max(lidW, tuck, dust, 2 * H);
            const sideWidth = lockEnabled ? baseSideWidth + slotWidth : baseSideWidth;
            const patternW = L + 2 * sideWidth;
            const patternH = lidW + 2 * H + 2 * W;

            return {
                totalW: patternW + padding * 2,
                totalH: patternH + padding * 2
            };
        },

        generateSVG() {
            const L = parseFloat(this.box.length);
            const W = parseFloat(this.box.width);
            const H = parseFloat(this.box.height);
            const dustPct = parseFloat(this.box.dustFlapPct);
            const dust = (dustPct / 100) * (W / 2); // Flap length: 100% = W/2
            const dustOuterPct = parseFloat(this.box.dustOuterWidthPct);
            const dustOuterWidth = (dustOuterPct / 100) * H; // Outer width as % of H
            const dustInnerWidth = H; // Inner width always equals H
            const dustOffset = (dustInnerWidth - dustOuterWidth) / 2; // Offset for trapezoid
            const dustR = Math.min(5, dust / 3); // Small chamfer based on dust length
            const tuck = parseFloat(this.box.tuckFlap);
            const tuckR = Math.min(parseFloat(this.box.tuckRound), tuck); // Tuck roundness: max = tuck width
            const lidW = Math.max(50, Math.min(parseFloat(this.box.lidFlapWidth), H)); // Lid flap width: min 50, max H
            const lidR = Math.min(parseFloat(this.box.lidTuckRadius), lidW); // Lid tuck radius: max = lidW

            // Double wall lock system parameters
            const lockEnabled = this.box.lockEnabled === true || this.box.lockEnabled === 'true';
            const lockCount = parseInt(this.box.lockCount);
            const lockLength = parseFloat(this.box.lockLength);
            const lockGap = parseFloat(this.box.lockGap);
            const slotWidth = parseFloat(this.box.slotWidth);

            const scale = parseFloat(this.display.scale);

            const padding = 60;

            // Pattern dimensions - accommodate widest elements on sides
            const baseSideWidth = Math.max(lidW, tuck, dust, 2 * H);
            const sideWidth = lockEnabled ? baseSideWidth + slotWidth : baseSideWidth;
            const patternW = L + 2 * sideWidth;
            const patternH = lidW + 2 * H + 2 * W;

            const svgW = (patternW + padding * 2) * scale;
            const svgH = (patternH + padding * 2) * scale;

            let cuts = [];
            let folds = [];

            // Origin: left edge of center column (L width), top of pattern
            const ox = padding + sideWidth;  // Center column starts after sideWidth
            const oy = padding;

            // Y coordinates of horizontal fold lines (top to bottom)
            const y1 = oy + lidW;        // Bottom of lid flap / top of lid top
            const y2 = y1 + W;           // Bottom of lid top / top of front wall
            const y3 = y2 + H;           // Bottom of front wall / top of base
            const y4 = y3 + W;           // Bottom of base / top of back wall
            const y5 = y4 + H;           // Bottom of back wall

            // X coordinates for side panels
            const xL1 = ox - H;          // Left inner panel (dust/tuck)
            const xL2 = ox - 2 * H;      // Left side wall
            const xR1 = ox + L + H;      // Right inner panel (dust/tuck)
            const xR2 = ox + L + 2 * H;  // Right side wall

            // ==========================================
            // ROW 1: LID FLAP SYSTEM (3 distinct shapes)
            // ==========================================

            // --- SHAPE 1: LEFT LID TUCK ---
            cuts.push(`M ${ox - lidW} ${y1} L ${ox - lidW} ${oy + lidR} Q ${ox - lidW} ${oy} ${ox - lidW + lidR} ${oy} L ${ox} ${oy}`);
            cuts.push(`M ${ox - lidW} ${y1} L ${ox} ${y1}`);

            // --- SHAPE 2: MAIN LID FLAP RECTANGLE ---
            cuts.push(`M ${ox} ${oy} L ${ox + L} ${oy}`);

            // --- SHAPE 3: RIGHT LID TUCK ---
            cuts.push(`M ${ox + L} ${oy} L ${ox + L + lidW - lidR} ${oy} Q ${ox + L + lidW} ${oy} ${ox + L + lidW} ${oy + lidR} L ${ox + L + lidW} ${y1}`);
            cuts.push(`M ${ox + L} ${y1} L ${ox + L + lidW} ${y1}`);

            // --- FOLD LINES ---
            folds.push(`M ${ox} ${oy} L ${ox} ${y1}`);
            folds.push(`M ${ox + L} ${oy} L ${ox + L} ${y1}`);
            folds.push(`M ${ox} ${y1} L ${ox + L} ${y1}`);

            // ==========================================
            // ROW 2: LID TOP (LxW) with side tuck flaps
            // ==========================================
            // Left tuck flap
            cuts.push(`M ${ox} ${y1} L ${ox - tuck + tuckR} ${y1}`);
            cuts.push(`M ${ox - tuck + tuckR} ${y1} Q ${ox - tuck} ${y1} ${ox - tuck} ${y1 + tuckR}`);
            cuts.push(`M ${ox - tuck} ${y1 + tuckR} L ${ox - tuck} ${y2 - tuckR}`);
            cuts.push(`M ${ox - tuck} ${y2 - tuckR} Q ${ox - tuck} ${y2} ${ox - tuck + tuckR} ${y2}`);
            cuts.push(`M ${ox - tuck + tuckR} ${y2} L ${ox} ${y2}`);

            folds.push(`M ${ox} ${y1} L ${ox} ${y2}`);

            // Right tuck flap
            cuts.push(`M ${ox + L} ${y1} L ${ox + L + tuck - tuckR} ${y1}`);
            cuts.push(`M ${ox + L + tuck - tuckR} ${y1} Q ${ox + L + tuck} ${y1} ${ox + L + tuck} ${y1 + tuckR}`);
            cuts.push(`M ${ox + L + tuck} ${y1 + tuckR} L ${ox + L + tuck} ${y2 - tuckR}`);
            cuts.push(`M ${ox + L + tuck} ${y2 - tuckR} Q ${ox + L + tuck} ${y2} ${ox + L + tuck - tuckR} ${y2}`);
            cuts.push(`M ${ox + L + tuck - tuckR} ${y2} L ${ox + L} ${y2}`);

            folds.push(`M ${ox + L} ${y1} L ${ox + L} ${y2}`);
            folds.push(`M ${ox} ${y2} L ${ox + L} ${y2}`);

            // ==========================================
            // ROW 3: FRONT WALL (LxH) with dust flaps
            // ==========================================
            folds.push(`M ${ox} ${y2} L ${ox} ${y3}`);
            folds.push(`M ${ox + L} ${y2} L ${ox + L} ${y3}`);

            // Left dust flap
            const leftDustOuterTop = y2 + dustOffset;
            const leftDustOuterBottom = y3 - dustOffset;
            cuts.push(`M ${ox} ${y2} L ${ox - dust + dustR} ${leftDustOuterTop}`);
            cuts.push(`M ${ox - dust + dustR} ${leftDustOuterTop} L ${ox - dust} ${leftDustOuterTop + dustR}`);
            cuts.push(`M ${ox - dust} ${leftDustOuterTop + dustR} L ${ox - dust} ${leftDustOuterBottom - dustR}`);
            cuts.push(`M ${ox - dust} ${leftDustOuterBottom - dustR} L ${ox - dust + dustR} ${leftDustOuterBottom}`);
            cuts.push(`M ${ox - dust + dustR} ${leftDustOuterBottom} L ${ox} ${y3}`);

            // Right dust flap
            const rightDustOuterTop = y2 + dustOffset;
            const rightDustOuterBottom = y3 - dustOffset;
            cuts.push(`M ${ox + L} ${y2} L ${ox + L + dust - dustR} ${rightDustOuterTop}`);
            cuts.push(`M ${ox + L + dust - dustR} ${rightDustOuterTop} L ${ox + L + dust} ${rightDustOuterTop + dustR}`);
            cuts.push(`M ${ox + L + dust} ${rightDustOuterTop + dustR} L ${ox + L + dust} ${rightDustOuterBottom - dustR}`);
            cuts.push(`M ${ox + L + dust} ${rightDustOuterBottom - dustR} L ${ox + L + dust - dustR} ${rightDustOuterBottom}`);
            cuts.push(`M ${ox + L + dust - dustR} ${rightDustOuterBottom} L ${ox + L} ${y3}`);

            folds.push(`M ${ox} ${y3} L ${ox + L} ${y3}`);

            // ==========================================
            // ROW 4: BASE (LxW) with side walls
            // ==========================================
            if (lockEnabled) {
                const totalLockHeight = (lockCount * lockLength) + ((lockCount - 1) * lockGap);
                const lockStartY = y3 + (W - totalLockHeight) / 2;

                // LEFT fold line
                let lastY = y3;
                for (let i = 0; i < lockCount; i++) {
                    const slotY = lockStartY + i * (lockLength + lockGap);
                    if (slotY > lastY) {
                        folds.push(`M ${ox} ${lastY} L ${ox} ${slotY}`);
                    }
                    lastY = slotY + lockLength;
                }
                if (lastY < y4) {
                    folds.push(`M ${ox} ${lastY} L ${ox} ${y4}`);
                }

                // RIGHT fold line
                lastY = y3;
                for (let i = 0; i < lockCount; i++) {
                    const slotY = lockStartY + i * (lockLength + lockGap);
                    if (slotY > lastY) {
                        folds.push(`M ${ox + L} ${lastY} L ${ox + L} ${slotY}`);
                    }
                    lastY = slotY + lockLength;
                }
                if (lastY < y4) {
                    folds.push(`M ${ox + L} ${lastY} L ${ox + L} ${y4}`);
                }
            } else {
                folds.push(`M ${ox} ${y3} L ${ox} ${y4}`);
                folds.push(`M ${ox + L} ${y3} L ${ox + L} ${y4}`);
            }

            // LEFT INNER PANEL
            folds.push(`M ${xL1} ${y3} L ${xL1} ${y4}`);
            cuts.push(`M ${ox} ${y3} L ${xL1} ${y3}`);
            cuts.push(`M ${ox} ${y4} L ${xL1} ${y4}`);

            // LEFT SIDE WALL
            cuts.push(`M ${xL1} ${y3} L ${xL2} ${y3}`);
            if (lockEnabled) {
                const totalLockHeight2 = (lockCount * lockLength) + ((lockCount - 1) * lockGap);
                const lockStartY2 = y3 + (W - totalLockHeight2) / 2;
                let lastY2 = y3;
                for (let i = 0; i < lockCount; i++) {
                    const lockY2 = lockStartY2 + i * (lockLength + lockGap);
                    if (lockY2 > lastY2) {
                        cuts.push(`M ${xL2} ${lastY2} L ${xL2} ${lockY2}`);
                    }
                    lastY2 = lockY2 + lockLength;
                }
                if (lastY2 < y4) {
                    cuts.push(`M ${xL2} ${lastY2} L ${xL2} ${y4}`);
                }
            } else {
                cuts.push(`M ${xL2} ${y3} L ${xL2} ${y4}`);
            }
            cuts.push(`M ${xL2} ${y4} L ${xL1} ${y4}`);

            // RIGHT INNER PANEL
            folds.push(`M ${ox + L + H} ${y3} L ${ox + L + H} ${y4}`);
            cuts.push(`M ${ox + L} ${y3} L ${ox + L + H} ${y3}`);
            cuts.push(`M ${ox + L} ${y4} L ${ox + L + H} ${y4}`);

            // RIGHT SIDE WALL
            cuts.push(`M ${ox + L + H} ${y3} L ${xR2} ${y3}`);
            if (lockEnabled) {
                const totalLockHeight3 = (lockCount * lockLength) + ((lockCount - 1) * lockGap);
                const lockStartY3 = y3 + (W - totalLockHeight3) / 2;
                let lastY3 = y3;
                for (let i = 0; i < lockCount; i++) {
                    const lockY3 = lockStartY3 + i * (lockLength + lockGap);
                    if (lockY3 > lastY3) {
                        cuts.push(`M ${xR2} ${lastY3} L ${xR2} ${lockY3}`);
                    }
                    lastY3 = lockY3 + lockLength;
                }
                if (lastY3 < y4) {
                    cuts.push(`M ${xR2} ${lastY3} L ${xR2} ${y4}`);
                }
            } else {
                cuts.push(`M ${xR2} ${y3} L ${xR2} ${y4}`);
            }
            cuts.push(`M ${xR2} ${y4} L ${ox + L + H} ${y4}`);

            folds.push(`M ${ox} ${y4} L ${ox + L} ${y4}`);

            // ==========================================
            // DOUBLE WALL LOCK SYSTEM
            // ==========================================
            if (lockEnabled) {
                const totalLockHeight = (lockCount * lockLength) + ((lockCount - 1) * lockGap);
                const lockStartY = y3 + (W - totalLockHeight) / 2;

                for (let i = 0; i < lockCount; i++) {
                    const lockY = lockStartY + i * (lockLength + lockGap);
                    const lockYEnd = lockY + lockLength;

                    // LEFT SIDE
                    cuts.push(`M ${xL2} ${lockY} L ${xL2 - slotWidth} ${lockY} L ${xL2 - slotWidth} ${lockYEnd} L ${xL2} ${lockYEnd}`);
                    cuts.push(`M ${ox - slotWidth} ${lockY} L ${ox + slotWidth} ${lockY}`);
                    cuts.push(`M ${ox + slotWidth} ${lockY} L ${ox + slotWidth} ${lockYEnd}`);
                    cuts.push(`M ${ox + slotWidth} ${lockYEnd} L ${ox - slotWidth} ${lockYEnd}`);
                    cuts.push(`M ${ox - slotWidth} ${lockYEnd} L ${ox - slotWidth} ${lockY}`);
                    folds.push(`M ${ox} ${lockY} L ${ox} ${lockYEnd}`);

                    // RIGHT SIDE
                    cuts.push(`M ${xR2} ${lockY} L ${xR2 + slotWidth} ${lockY} L ${xR2 + slotWidth} ${lockYEnd} L ${xR2} ${lockYEnd}`);
                    cuts.push(`M ${ox + L - slotWidth} ${lockY} L ${ox + L + slotWidth} ${lockY}`);
                    cuts.push(`M ${ox + L + slotWidth} ${lockY} L ${ox + L + slotWidth} ${lockYEnd}`);
                    cuts.push(`M ${ox + L + slotWidth} ${lockYEnd} L ${ox + L - slotWidth} ${lockYEnd}`);
                    cuts.push(`M ${ox + L - slotWidth} ${lockYEnd} L ${ox + L - slotWidth} ${lockY}`);
                    folds.push(`M ${ox + L} ${lockY} L ${ox + L} ${lockYEnd}`);
                }
            }

            // ==========================================
            // ROW 5: BACK WALL (LxH) with dust flaps
            // ==========================================
            folds.push(`M ${ox} ${y4} L ${ox} ${y5}`);
            folds.push(`M ${ox + L} ${y4} L ${ox + L} ${y5}`);
            cuts.push(`M ${ox} ${y5} L ${ox + L} ${y5}`);

            // Left dust flap
            const leftDustOuterTop2 = y4 + dustOffset;
            const leftDustOuterBottom2 = y5 - dustOffset;
            cuts.push(`M ${ox} ${y4} L ${ox - dust + dustR} ${leftDustOuterTop2}`);
            cuts.push(`M ${ox - dust + dustR} ${leftDustOuterTop2} L ${ox - dust} ${leftDustOuterTop2 + dustR}`);
            cuts.push(`M ${ox - dust} ${leftDustOuterTop2 + dustR} L ${ox - dust} ${leftDustOuterBottom2 - dustR}`);
            cuts.push(`M ${ox - dust} ${leftDustOuterBottom2 - dustR} L ${ox - dust + dustR} ${leftDustOuterBottom2}`);
            cuts.push(`M ${ox - dust + dustR} ${leftDustOuterBottom2} L ${ox} ${y5}`);

            // Right dust flap
            const rightDustOuterTop2 = y4 + dustOffset;
            const rightDustOuterBottom2 = y5 - dustOffset;
            cuts.push(`M ${ox + L} ${y4} L ${ox + L + dust - dustR} ${rightDustOuterTop2}`);
            cuts.push(`M ${ox + L + dust - dustR} ${rightDustOuterTop2} L ${ox + L + dust} ${rightDustOuterTop2 + dustR}`);
            cuts.push(`M ${ox + L + dust} ${rightDustOuterTop2 + dustR} L ${ox + L + dust} ${rightDustOuterBottom2 - dustR}`);
            cuts.push(`M ${ox + L + dust} ${rightDustOuterBottom2 - dustR} L ${ox + L + dust - dustR} ${rightDustOuterBottom2}`);
            cuts.push(`M ${ox + L + dust - dustR} ${rightDustOuterBottom2} L ${ox + L} ${y5}`);

            // ==========================================
            // BUILD SVG
            // ==========================================
            let svg = `<svg id="box-svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${patternW + padding * 2} ${patternH + padding * 2}" xmlns="http://www.w3.org/2000/svg">`;

            svg += `<style>
                .cut-line { stroke: #1f2937; stroke-width: 1.5; fill: none; }
                .fold-line { stroke: #3b82f6; stroke-width: 1; stroke-dasharray: 8, 4; fill: none; }
                .grid-line { stroke: #e5e7eb; stroke-width: 0.5; fill: none; }
                .dimension-line { stroke: #9ca3af; stroke-width: 0.5; fill: none; }
                .dimension-text { font: 11px Arial; fill: #6b7280; }
                .label-text { font: 12px Arial; fill: #9ca3af; }
            </style>`;

            svg += `<rect width="100%" height="100%" fill="white"/>`;

            // Draw grid
            if (this.display.showGrid) {
                const gridSize = 10;
                const totalW = patternW + padding * 2;
                const totalH = patternH + padding * 2;
                for (let x = 0; x <= totalW; x += gridSize) {
                    svg += `<line x1="${x}" y1="0" x2="${x}" y2="${totalH}" class="grid-line"/>`;
                }
                for (let y = 0; y <= totalH; y += gridSize) {
                    svg += `<line x1="0" y1="${y}" x2="${totalW}" y2="${y}" class="grid-line"/>`;
                }
            }

            // Draw cuts
            cuts.forEach(path => {
                svg += `<path d="${path}" class="cut-line"/>`;
            });

            // Draw folds
            folds.forEach(path => {
                svg += `<path d="${path}" class="fold-line"/>`;
            });

            // Labels
            if (this.display.showLabels) {
                const labels = [
                    { x: ox + L / 2, y: oy + lidW / 2, text: `${L}x${Math.round(lidW)}` },
                    { x: ox - tuck / 2, y: oy + lidW / 2, text: 'tuck' },
                    { x: ox + L + tuck / 2, y: oy + lidW / 2, text: 'tuck' },
                    { x: ox + L / 2, y: y1 + W / 2, text: `${L}x${W}` },
                    { x: ox - tuck / 2, y: y1 + W / 2, text: 'tuck' },
                    { x: ox + L + tuck / 2, y: y1 + W / 2, text: 'tuck' },
                    { x: ox + L / 2, y: y2 + H / 2, text: `${L}x${H}` },
                    { x: ox - dust / 2, y: y2 + H / 2, text: 'dust' },
                    { x: ox + L + dust / 2, y: y2 + H / 2, text: 'dust' },
                    { x: ox + L / 2, y: y3 + W / 2, text: `${L}x${W}` },
                    { x: xL1 - H / 2, y: y3 + W / 2, text: `${W}x${H}` },
                    { x: ox - H / 2, y: y3 + W / 2, text: `${W}x${H}` },
                    { x: ox + L + H / 2, y: y3 + W / 2, text: `${W}x${H}` },
                    { x: xR1 + H / 2, y: y3 + W / 2, text: `${W}x${H}` },
                    { x: ox + L / 2, y: y4 + H / 2, text: `${L}x${H}` },
                    { x: ox - dust / 2, y: y4 + H / 2, text: 'dust' },
                    { x: ox + L + dust / 2, y: y4 + H / 2, text: 'dust' }
                ];
                labels.forEach(lbl => {
                    svg += `<text x="${lbl.x}" y="${lbl.y}" class="label-text" text-anchor="middle" dominant-baseline="middle">${lbl.text}</text>`;
                });
            }

            // Dimensions
            if (this.display.showDimensions) {
                svg += `<line x1="${padding}" y1="${padding - 35}" x2="${padding + patternW}" y2="${padding - 35}" class="dimension-line"/>`;
                svg += `<text x="${padding + patternW / 2}" y="${padding - 42}" class="dimension-text" text-anchor="middle">Overall: ${Math.round(patternW)}mm x ${Math.round(patternH)}mm</text>`;

                svg += `<line x1="${ox}" y1="${oy - 15}" x2="${ox + L}" y2="${oy - 15}" class="dimension-line"/>`;
                svg += `<text x="${ox + L / 2}" y="${oy - 25}" class="dimension-text" text-anchor="middle">L = ${L}mm</text>`;

                svg += `<line x1="${xR2 + 20}" y1="${y3}" x2="${xR2 + 20}" y2="${y4}" class="dimension-line"/>`;
                svg += `<text x="${xR2 + 35}" y="${y3 + W / 2}" class="dimension-text" text-anchor="middle" transform="rotate(90,${xR2 + 35},${y3 + W / 2})">W = ${W}mm</text>`;

                svg += `<line x1="${xL2 - 20}" y1="${y4}" x2="${xL2 - 20}" y2="${y5}" class="dimension-line"/>`;
                svg += `<text x="${xL2 - 35}" y="${y4 + H / 2}" class="dimension-text" text-anchor="middle" transform="rotate(-90,${xL2 - 35},${y4 + H / 2})">H = ${H}mm</text>`;

                svg += `<line x1="${padding + patternW + 15}" y1="${padding}" x2="${padding + patternW + 15}" y2="${padding + patternH}" class="dimension-line"/>`;
                svg += `<text x="${padding + patternW + 30}" y="${padding + patternH / 2}" class="dimension-text" text-anchor="middle" transform="rotate(90,${padding + patternW + 30},${padding + patternH / 2})">${Math.round(patternH)}mm</text>`;
            }

            svg += '</svg>';
            return svg;
        },

        // Export functions using universal export module
        exportSVG() {
            BoxyExport.exportSVG(
                () => this.generateSVG(),
                this.getPatternDimensions(),
                `${this.filePrefix}.svg`
            );
        },

        exportPNG() {
            BoxyExport.exportPNG(
                () => this.generateSVG(),
                this.getPatternDimensions(),
                `${this.filePrefix}.png`
            );
        },

        exportPDF() {
            BoxyExport.exportPDF(
                () => this.generateSVG(),
                this.getPatternDimensions(),
                `${this.filePrefix}.pdf`
            );
        },

        exportDXF() {
            BoxyExport.exportDXF(
                () => this.generateSVG(),
                this.getPatternDimensions(),
                `${this.filePrefix}.dxf`
            );
        }
    };
}
