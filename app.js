/**
 * Boxy - Shoe Box Designer
 * Single-piece folding lid design
 */

function shoeBoxDesigner() {
    return {
        box: {
            length: 254,    // L - length of base
            width: 204,     // W - width of base  
            height: 98,     // H - wall height
            dustFlapPct: 50, // Dust flap length as % (100% = W/2)
            dustOuterWidthPct: 60, // Outer width as % of H (inner width = H)
            tuckFlap: 20,   // Tuck flap width (for LID side tucks)
            tuckRound: 8,   // Tuck flap corner roundness (for LID side tucks)
            lidFlapWidth: 50, // Lid flap height (min = 50mm, max = H)
            lidTuckRadius: 25 // Lid tuck corner radius (max = lidFlapWidth)
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
            const scale = parseFloat(this.display.scale);

            const padding = 60;

            // Pattern dimensions - accommodate widest elements on sides
            // Left/right side needs room for: lidW (lid tuck squares), tuck (top row), dust (front/back), 2*H (base side walls)
            const sideWidth = Math.max(lidW, tuck, dust, 2 * H);
            // Width: sideWidth + L + sideWidth
            // Height: lidW (lid flap) + W (lid top) + H (front wall) + W (base) + H (back wall)
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
            // 1. Left lid tuck (square with rounded top-left corner)
            // 2. Main rectangle (L x lidW)
            // 3. Right lid tuck (square with rounded top-right corner)
            // Controls: lidW (side length of squares), lidR (corner radius)
            // Inner vertical edges are FOLD lines - outer edges + tuck bottoms are CUT lines
            // Only main rectangle bottom (ox to ox+L) is fold line to lid top
            // ==========================================

            // --- SHAPE 1: LEFT LID TUCK - outer left, top, and bottom (not right - that's fold) ---
            cuts.push(`M ${ox - lidW} ${y1} L ${ox - lidW} ${oy + lidR} Q ${ox - lidW} ${oy} ${ox - lidW + lidR} ${oy} L ${ox} ${oy}`);
            cuts.push(`M ${ox - lidW} ${y1} L ${ox} ${y1}`);  // Bottom edge of left tuck

            // --- SHAPE 2: MAIN LID FLAP RECTANGLE - top edge only (bottom is fold) ---
            cuts.push(`M ${ox} ${oy} L ${ox + L} ${oy}`);

            // --- SHAPE 3: RIGHT LID TUCK - top, outer right, and bottom (not left - that's fold) ---
            cuts.push(`M ${ox + L} ${oy} L ${ox + L + lidW - lidR} ${oy} Q ${ox + L + lidW} ${oy} ${ox + L + lidW} ${oy + lidR} L ${ox + L + lidW} ${y1}`);
            cuts.push(`M ${ox + L} ${y1} L ${ox + L + lidW} ${y1}`);  // Bottom edge of right tuck

            // --- FOLD LINES ---
            // Fold between left lid tuck and main rectangle
            folds.push(`M ${ox} ${oy} L ${ox} ${y1}`);
            // Fold between main rectangle and right lid tuck
            folds.push(`M ${ox + L} ${oy} L ${ox + L} ${y1}`);
            // Fold: main lid flap to lid top (only center portion)
            folds.push(`M ${ox} ${y1} L ${ox + L} ${y1}`);

            // ==========================================
            // ROW 2: LID TOP (LxW) with side tuck flaps
            // ==========================================
            // Left tuck flap (on lid top) - rounded outer corners, uses tuck width
            cuts.push(`M ${ox} ${y1} L ${ox - tuck + tuckR} ${y1}`);
            cuts.push(`M ${ox - tuck + tuckR} ${y1} Q ${ox - tuck} ${y1} ${ox - tuck} ${y1 + tuckR}`);
            cuts.push(`M ${ox - tuck} ${y1 + tuckR} L ${ox - tuck} ${y2 - tuckR}`);
            cuts.push(`M ${ox - tuck} ${y2 - tuckR} Q ${ox - tuck} ${y2} ${ox - tuck + tuckR} ${y2}`);
            cuts.push(`M ${ox - tuck + tuckR} ${y2} L ${ox} ${y2}`);

            // Fold line: lid top to left tuck flap
            folds.push(`M ${ox} ${y1} L ${ox} ${y2}`);

            // Right tuck flap (on lid top) - rounded outer corners, uses tuck width
            cuts.push(`M ${ox + L} ${y1} L ${ox + L + tuck - tuckR} ${y1}`);
            cuts.push(`M ${ox + L + tuck - tuckR} ${y1} Q ${ox + L + tuck} ${y1} ${ox + L + tuck} ${y1 + tuckR}`);
            cuts.push(`M ${ox + L + tuck} ${y1 + tuckR} L ${ox + L + tuck} ${y2 - tuckR}`);
            cuts.push(`M ${ox + L + tuck} ${y2 - tuckR} Q ${ox + L + tuck} ${y2} ${ox + L + tuck - tuckR} ${y2}`);
            cuts.push(`M ${ox + L + tuck - tuckR} ${y2} L ${ox + L} ${y2}`);

            // Fold line: lid top to right tuck flap
            folds.push(`M ${ox + L} ${y1} L ${ox + L} ${y2}`);

            // Fold line: lid top to front wall
            folds.push(`M ${ox} ${y2} L ${ox + L} ${y2}`);

            // ==========================================
            // ROW 3: FRONT WALL (LxH) with dust flaps
            // ==========================================
            // Left edge
            cuts.push(`M ${ox} ${y2} L ${ox} ${y3}`);
            // Right edge
            cuts.push(`M ${ox + L} ${y2} L ${ox + L} ${y3}`);

            // Left dust flap (trapezoid with chamfered outer corners)
            const leftDustOuterTop = y2 + dustOffset;
            const leftDustOuterBottom = y3 - dustOffset;
            // Top diagonal edge
            cuts.push(`M ${ox} ${y2} L ${ox - dust + dustR} ${leftDustOuterTop}`);
            // Top-outer chamfer
            cuts.push(`M ${ox - dust + dustR} ${leftDustOuterTop} L ${ox - dust} ${leftDustOuterTop + dustR}`);
            // Outer vertical edge
            cuts.push(`M ${ox - dust} ${leftDustOuterTop + dustR} L ${ox - dust} ${leftDustOuterBottom - dustR}`);
            // Bottom-outer chamfer
            cuts.push(`M ${ox - dust} ${leftDustOuterBottom - dustR} L ${ox - dust + dustR} ${leftDustOuterBottom}`);
            // Bottom diagonal edge
            cuts.push(`M ${ox - dust + dustR} ${leftDustOuterBottom} L ${ox} ${y3}`);

            // Right dust flap (trapezoid with chamfered outer corners)
            const rightDustOuterTop = y2 + dustOffset;
            const rightDustOuterBottom = y3 - dustOffset;
            // Top diagonal edge
            cuts.push(`M ${ox + L} ${y2} L ${ox + L + dust - dustR} ${rightDustOuterTop}`);
            // Top-outer chamfer
            cuts.push(`M ${ox + L + dust - dustR} ${rightDustOuterTop} L ${ox + L + dust} ${rightDustOuterTop + dustR}`);
            // Outer vertical edge
            cuts.push(`M ${ox + L + dust} ${rightDustOuterTop + dustR} L ${ox + L + dust} ${rightDustOuterBottom - dustR}`);
            // Bottom-outer chamfer
            cuts.push(`M ${ox + L + dust} ${rightDustOuterBottom - dustR} L ${ox + L + dust - dustR} ${rightDustOuterBottom}`);
            // Bottom diagonal edge
            cuts.push(`M ${ox + L + dust - dustR} ${rightDustOuterBottom} L ${ox + L} ${y3}`);

            // Fold line: front wall to base
            folds.push(`M ${ox} ${y3} L ${ox + L} ${y3}`);

            // ==========================================
            // ROW 4: BASE (LxW) with side walls
            // ==========================================
            // Fold lines from base to inner panels
            folds.push(`M ${ox} ${y3} L ${ox} ${y4}`);
            folds.push(`M ${ox + L} ${y3} L ${ox + L} ${y4}`);

            // LEFT INNER PANEL (WxH) - between base and left side wall
            folds.push(`M ${xL1} ${y3} L ${xL1} ${y4}`);
            // Top edge
            cuts.push(`M ${ox} ${y3} L ${xL1} ${y3}`);
            // Bottom edge
            cuts.push(`M ${ox} ${y4} L ${xL1} ${y4}`);

            // LEFT SIDE WALL (WxH) - square corners
            // Top edge
            cuts.push(`M ${xL1} ${y3} L ${xL2} ${y3}`);
            // Left edge
            cuts.push(`M ${xL2} ${y3} L ${xL2} ${y4}`);
            // Bottom edge
            cuts.push(`M ${xL2} ${y4} L ${xL1} ${y4}`);

            // RIGHT INNER PANEL (WxH)
            folds.push(`M ${ox + L + H} ${y3} L ${ox + L + H} ${y4}`);
            // Top edge
            cuts.push(`M ${ox + L} ${y3} L ${ox + L + H} ${y3}`);
            // Bottom edge
            cuts.push(`M ${ox + L} ${y4} L ${ox + L + H} ${y4}`);

            // RIGHT SIDE WALL (WxH) - square corners
            // Top edge
            cuts.push(`M ${ox + L + H} ${y3} L ${xR2} ${y3}`);
            // Right edge
            cuts.push(`M ${xR2} ${y3} L ${xR2} ${y4}`);
            // Bottom edge
            cuts.push(`M ${xR2} ${y4} L ${ox + L + H} ${y4}`);

            // Fold line: base to back wall
            folds.push(`M ${ox} ${y4} L ${ox + L} ${y4}`);

            // ==========================================
            // ROW 5: BACK WALL (LxH) with side wall double-layers
            // ==========================================
            // Left edge
            cuts.push(`M ${ox} ${y4} L ${ox} ${y5}`);
            // Right edge
            cuts.push(`M ${ox + L} ${y4} L ${ox + L} ${y5}`);
            // Bottom edge
            cuts.push(`M ${ox} ${y5} L ${ox + L} ${y5}`);

            // Left dust flap (trapezoid with chamfered outer corners)
            const leftDustOuterTop2 = y4 + dustOffset;
            const leftDustOuterBottom2 = y5 - dustOffset;
            // Top diagonal edge
            cuts.push(`M ${ox} ${y4} L ${ox - dust + dustR} ${leftDustOuterTop2}`);
            // Top-outer chamfer
            cuts.push(`M ${ox - dust + dustR} ${leftDustOuterTop2} L ${ox - dust} ${leftDustOuterTop2 + dustR}`);
            // Outer vertical edge
            cuts.push(`M ${ox - dust} ${leftDustOuterTop2 + dustR} L ${ox - dust} ${leftDustOuterBottom2 - dustR}`);
            // Bottom-outer chamfer
            cuts.push(`M ${ox - dust} ${leftDustOuterBottom2 - dustR} L ${ox - dust + dustR} ${leftDustOuterBottom2}`);
            // Bottom diagonal edge
            cuts.push(`M ${ox - dust + dustR} ${leftDustOuterBottom2} L ${ox} ${y5}`);

            // Right dust flap (trapezoid with chamfered outer corners)
            const rightDustOuterTop2 = y4 + dustOffset;
            const rightDustOuterBottom2 = y5 - dustOffset;
            // Top diagonal edge
            cuts.push(`M ${ox + L} ${y4} L ${ox + L + dust - dustR} ${rightDustOuterTop2}`);
            // Top-outer chamfer
            cuts.push(`M ${ox + L + dust - dustR} ${rightDustOuterTop2} L ${ox + L + dust} ${rightDustOuterTop2 + dustR}`);
            // Outer vertical edge
            cuts.push(`M ${ox + L + dust} ${rightDustOuterTop2 + dustR} L ${ox + L + dust} ${rightDustOuterBottom2 - dustR}`);
            // Bottom-outer chamfer
            cuts.push(`M ${ox + L + dust} ${rightDustOuterBottom2 - dustR} L ${ox + L + dust - dustR} ${rightDustOuterBottom2}`);
            // Bottom diagonal edge
            cuts.push(`M ${ox + L + dust - dustR} ${rightDustOuterBottom2} L ${ox + L} ${y5}`);

            // ==========================================
            // BUILD SVG
            // ==========================================
            let svg = `<svg id="box-svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${patternW + padding * 2} ${patternH + padding * 2}" xmlns="http://www.w3.org/2000/svg">`;

            // Embed styles in SVG for proper export
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
                const gridSize = 10; // 10mm grid
                const totalW = patternW + padding * 2;
                const totalH = patternH + padding * 2;
                for (let x = 0; x <= totalW; x += gridSize) {
                    svg += `<line x1="${x}" y1="0" x2="${x}" y2="${totalH}" class="grid-line"/>`;
                }
                for (let y = 0; y <= totalH; y += gridSize) {
                    svg += `<line x1="0" y1="${y}" x2="${totalW}" y2="${y}" class="grid-line"/>`;
                }
            }

            // Draw cuts (solid lines)
            cuts.forEach(path => {
                svg += `<path d="${path}" class="cut-line"/>`;
            });

            // Draw folds (dashed lines)
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
                // Overall width dimension (very top)
                svg += `<line x1="${padding}" y1="${padding - 35}" x2="${padding + patternW}" y2="${padding - 35}" class="dimension-line"/>`;
                svg += `<text x="${padding + patternW / 2}" y="${padding - 42}" class="dimension-text" text-anchor="middle">Overall: ${Math.round(patternW)}mm x ${Math.round(patternH)}mm</text>`;

                // L dimension (top)
                svg += `<line x1="${ox}" y1="${oy - 15}" x2="${ox + L}" y2="${oy - 15}" class="dimension-line"/>`;
                svg += `<text x="${ox + L / 2}" y="${oy - 25}" class="dimension-text" text-anchor="middle">L = ${L}mm</text>`;

                // W dimension (right side)
                svg += `<line x1="${xR2 + 20}" y1="${y3}" x2="${xR2 + 20}" y2="${y4}" class="dimension-line"/>`;
                svg += `<text x="${xR2 + 35}" y="${y3 + W / 2}" class="dimension-text" text-anchor="middle" transform="rotate(90,${xR2 + 35},${y3 + W / 2})">W = ${W}mm</text>`;

                // H dimension (left side)
                svg += `<line x1="${xL2 - 20}" y1="${y4}" x2="${xL2 - 20}" y2="${y5}" class="dimension-line"/>`;
                svg += `<text x="${xL2 - 35}" y="${y4 + H / 2}" class="dimension-text" text-anchor="middle" transform="rotate(-90,${xL2 - 35},${y4 + H / 2})">H = ${H}mm</text>`;

                // Overall height dimension (far right)
                svg += `<line x1="${padding + patternW + 15}" y1="${padding}" x2="${padding + patternW + 15}" y2="${padding + patternH}" class="dimension-line"/>`;
                svg += `<text x="${padding + patternW + 30}" y="${padding + patternH / 2}" class="dimension-text" text-anchor="middle" transform="rotate(90,${padding + patternW + 30},${padding + patternH / 2})">${Math.round(patternH)}mm</text>`;
            }

            svg += '</svg>';
            return svg;
        },

        // Generate SVG at 1:1 scale (1 unit = 1mm) for export
        generateExportSVG() {
            const L = parseFloat(this.box.length);
            const W = parseFloat(this.box.width);
            const H = parseFloat(this.box.height);
            const dustPct = parseFloat(this.box.dustFlapPct);
            const dust = (dustPct / 100) * (W / 2);
            const tuck = parseFloat(this.box.tuckFlap);
            const lidW = Math.min(parseFloat(this.box.lidFlapWidth), H);

            const padding = 60;
            const sideWidth = Math.max(lidW, tuck, dust, 2 * H);
            const patternW = L + 2 * sideWidth;
            const patternH = lidW + 2 * H + 2 * W;
            const totalW = patternW + padding * 2;
            const totalH = patternH + padding * 2;

            // Get the displayed SVG and modify for 1:1 export
            const displaySVG = this.generateSVG();
            // Replace the width/height/viewBox to be 1:1 scale in mm
            return displaySVG.replace(
                /<svg id="box-svg"[^>]*>/,
                `<svg id="box-svg" width="${totalW}mm" height="${totalH}mm" viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg">`
            );
        },

        // Export functions
        exportSVG() {
            const data = this.generateExportSVG();
            const blob = new Blob([data], { type: 'image/svg+xml' });
            this.download(blob, 'shoebox.svg');
        },

        exportPNG() {
            const data = this.generateExportSVG();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // 3.78 pixels per mm at 96 DPI
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(blob => this.download(blob, 'shoebox.png'), 'image/png');
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
        },

        exportPDF() {
            const L = parseFloat(this.box.length);
            const W = parseFloat(this.box.width);
            const H = parseFloat(this.box.height);
            const dustPct = parseFloat(this.box.dustFlapPct);
            const dust = (dustPct / 100) * (W / 2);
            const tuck = parseFloat(this.box.tuckFlap);
            const lidW = Math.min(parseFloat(this.box.lidFlapWidth), H);

            const padding = 60;
            const sideWidth = Math.max(lidW, tuck, dust, 2 * H);
            const patternW = L + 2 * sideWidth;
            const patternH = lidW + 2 * H + 2 * W;
            const totalW = patternW + padding * 2;
            const totalH = patternH + padding * 2;

            const data = this.generateExportSVG();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // High res for PDF
                const scale = 3;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const { jsPDF } = window.jspdf;
                // Create PDF with exact mm dimensions
                const pdf = new jsPDF({
                    orientation: totalW > totalH ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: [totalW, totalH]
                });

                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, totalW, totalH);
                pdf.save('shoebox.pdf');
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
        },

        exportDXF() {
            const blob = new Blob(['DXF export - convert SVG paths'], { type: 'application/dxf' });
            this.download(blob, 'shoebox.dxf');
        },

        download(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    };
}
