/**
 * Boxy - Triangular Prism Box Designer
 * Toblerone-style box with interlocking end flaps - no glue required
 */

function triangularPrismDesigner() {
    return {
        styleName: 'Triangular Prism Box',
        filePrefix: 'triangular-prism',

        box: {
            side: 60,           // S - side length of equilateral triangle
            depth: 200,         // D - length/depth of the box
            tuckWidth: 15,      // Width of tuck/glue tabs
            tuckRound: 5,       // Tuck flap corner radius
            endTuckWidth: 10,   // Width of small tuck on end flap 1
            lockTabWidth: 15,   // Width of interlocking tabs
            lockTabHeight: 10,  // Height of lock tabs on end flaps
            sideLockWidth: 8,   // Width of side lock flap (blue)
            sideLockSlitWidth: 8, // Width of slit/tab (black) 
            sideLockHeight: 15, // Height of side lock tabs
            sideLockCount: 2,   // Number of side locks
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

        // Calculate triangle height for equilateral triangle
        getTriangleHeight() {
            return parseFloat(this.box.side) * Math.sqrt(3) / 2;
        },

        // Calculate pattern dimensions for export
        getPatternDimensions() {
            const S = parseFloat(this.box.side);
            const D = parseFloat(this.box.depth);
            const tuck = parseFloat(this.box.tuckWidth);
            const triH = this.getTriangleHeight();
            const lockH = parseFloat(this.box.lockTabHeight);
            const sideLockW = Math.min(parseFloat(this.box.sideLockWidth), tuck * 0.75); // Max 75% of tuck width

            const padding = 60;
            // Width: tuck + sideLockW (left U-flap) + 3 panels (3*S) + sideLockW (right tab)
            const patternW = tuck + sideLockW + 3 * S + sideLockW;
            // Height: end flap (triH) + lock tab + depth + end flap (triH) + lock tab
            const patternH = triH + lockH + D + triH + lockH;

            return {
                totalW: patternW + padding * 2,
                totalH: patternH + padding * 2
            };
        },

        generateSVG() {
            const S = parseFloat(this.box.side);
            const D = parseFloat(this.box.depth);
            const tuck = parseFloat(this.box.tuckWidth);
            const tuckR = Math.min(parseFloat(this.box.tuckRound), tuck / 2);
            const endTuckW = parseFloat(this.box.endTuckWidth);
            const lockW = parseFloat(this.box.lockTabWidth);
            const lockH = parseFloat(this.box.lockTabHeight);
            const sideLockW = Math.min(parseFloat(this.box.sideLockWidth), tuck * 0.75); // Max 75% of tuck width
            const sideLockSlitW = parseFloat(this.box.sideLockSlitWidth);
            const sideLockH = parseFloat(this.box.sideLockHeight);
            const sideLockCount = parseInt(this.box.sideLockCount);

            const triH = this.getTriangleHeight();
            const scale = parseFloat(this.display.scale);
            const padding = 60;

            // Pattern dimensions
            const patternW = tuck + sideLockW + 3 * S + sideLockW;
            const patternH = triH + lockH + D + triH + lockH;

            const svgW = (patternW + padding * 2) * scale;
            const svgH = (patternH + padding * 2) * scale;

            let cuts = [];
            let folds = [];

            // Origin point (left edge of panel 1)
            // Account for U-flap extending left from x0
            const ox = padding + tuck + sideLockW;
            const oy = padding + triH + lockH;

            // Key Y coordinates
            const yTop = oy;                    // Top of main panels
            const yBottom = oy + D;             // Bottom of main panels
            const yEndTop = oy - triH;          // Apex of top end flaps
            const yEndBottom = oy + D + triH;   // Apex of bottom end flaps
            const yLockTop = yEndTop - lockH;   // Top of lock tabs
            const yLockBottom = yEndBottom + lockH; // Bottom of lock tabs

            // X coordinates for panel boundaries
            const x0 = ox;                      // Left edge of panel 1
            const x1 = ox + S;                  // Panel 1/2 boundary
            const x2 = ox + 2 * S;              // Panel 2/3 boundary
            const x3 = ox + 3 * S;              // Right edge of panel 3

            // ==========================================
            // LEFT TUCK TAB with LOCK SLOTS
            // ==========================================
            const tuckTop = yTop + 5;
            const tuckBottom = yBottom - 5;

            // Calculate side lock positions
            const sideLockSpacing = (D - 20) / (sideLockCount + 1);
            const sideLockPositions = [];
            for (let i = 0; i < sideLockCount; i++) {
                sideLockPositions.push(yTop + 10 + (i + 1) * sideLockSpacing - sideLockH / 2);
            }

            // Tuck tab outline
            cuts.push(`M ${x0} ${tuckTop} L ${ox - tuck + tuckR} ${tuckTop}`);
            cuts.push(`M ${ox - tuck + tuckR} ${tuckTop} Q ${ox - tuck} ${tuckTop} ${ox - tuck} ${tuckTop + tuckR}`);

            // Left edge of tuck (simple line, no protrusions)
            cuts.push(`M ${ox - tuck} ${tuckTop + tuckR} L ${ox - tuck} ${tuckBottom - tuckR}`);

            cuts.push(`M ${ox - tuck} ${tuckBottom - tuckR} Q ${ox - tuck} ${tuckBottom} ${ox - tuck + tuckR} ${tuckBottom}`);
            cuts.push(`M ${ox - tuck + tuckR} ${tuckBottom} L ${x0} ${tuckBottom}`);

            // Combined slit + U-flap cut on fold line (x0) - one continuous cut path
            const uRadius = 3; // Radius for U-shape corners
            const slitExt = parseFloat(this.box.sideLockSlitWidth); // Slit width (black)
            for (let i = 0; i < sideLockCount; i++) {
                const slotY = sideLockPositions[i];
                const flapTop = slotY;
                const flapBottom = slotY + sideLockH;

                // One continuous path: top slit -> U-shape -> bottom slit
                // Top slit (going down)
                cuts.push(`M ${x0} ${flapTop - slitExt} L ${x0} ${flapTop}`);
                // Top edge going left
                cuts.push(`M ${x0} ${flapTop} L ${x0 - sideLockW + uRadius} ${flapTop}`);
                // Top-left rounded corner
                cuts.push(`M ${x0 - sideLockW + uRadius} ${flapTop} Q ${x0 - sideLockW} ${flapTop} ${x0 - sideLockW} ${flapTop + uRadius}`);
                // Left edge going down
                cuts.push(`M ${x0 - sideLockW} ${flapTop + uRadius} L ${x0 - sideLockW} ${flapBottom - uRadius}`);
                // Bottom-left rounded corner
                cuts.push(`M ${x0 - sideLockW} ${flapBottom - uRadius} Q ${x0 - sideLockW} ${flapBottom} ${x0 - sideLockW + uRadius} ${flapBottom}`);
                // Bottom edge going right
                cuts.push(`M ${x0 - sideLockW + uRadius} ${flapBottom} L ${x0} ${flapBottom}`);
                // Bottom slit (going down)
                cuts.push(`M ${x0} ${flapBottom} L ${x0} ${flapBottom + slitExt}`);
            }

            // ==========================================
            // MAIN PANELS
            // ==========================================
            // Top and bottom edges are FOLDS (not cuts) - triangles attach here

            // Left edge of panel 1 (partial - tuck connects)
            cuts.push(`M ${x0} ${yTop} L ${x0} ${tuckTop}`);
            cuts.push(`M ${x0} ${tuckBottom} L ${x0} ${yBottom}`);

            // Right edge of panel 3 with matching lock shape
            // Large rounded tab (height = 2*slitExt + sideLockH) + slit
            let lastY = yTop;
            for (let i = 0; i < sideLockCount; i++) {
                const tabY = sideLockPositions[i];
                // Align with left side: left top slit starts at tabY - slitExt
                const flapTop = tabY - slitExt;
                const rightFlapH = 2 * slitExt + sideLockH; // Height = 2x slit width + lock height
                const flapBottom = flapTop + rightFlapH;
                const tabRadius = sideLockW / 2; // Radius for large tab (based on flap width)

                // Line down to tab start
                cuts.push(`M ${x3} ${lastY} L ${x3} ${flapTop}`);

                // Large rounded tab (width = sideLockW, height = rightFlapH)
                // Top horizontal edge going right
                cuts.push(`M ${x3} ${flapTop} L ${x3 + sideLockW - tabRadius} ${flapTop}`);
                // Top-right rounded corner
                cuts.push(`M ${x3 + sideLockW - tabRadius} ${flapTop} Q ${x3 + sideLockW} ${flapTop} ${x3 + sideLockW} ${flapTop + tabRadius}`);
                // Right edge going down
                cuts.push(`M ${x3 + sideLockW} ${flapTop + tabRadius} L ${x3 + sideLockW} ${flapBottom - tabRadius}`);
                // Bottom-right rounded corner
                cuts.push(`M ${x3 + sideLockW} ${flapBottom - tabRadius} Q ${x3 + sideLockW} ${flapBottom} ${x3 + sideLockW - tabRadius} ${flapBottom}`);
                // Bottom horizontal edge going left
                cuts.push(`M ${x3 + sideLockW - tabRadius} ${flapBottom} L ${x3} ${flapBottom}`);

                // Right side slit - vertical line on panel edge with height controlled by sideLockH
                const slitCenterY = (flapTop + flapBottom) / 2;
                cuts.push(`M ${x3} ${slitCenterY - sideLockH / 2} L ${x3} ${slitCenterY + sideLockH / 2}`);

                lastY = flapBottom;
            }
            cuts.push(`M ${x3} ${lastY} L ${x3} ${yBottom}`);

            // Fold lines between panels
            folds.push(`M ${x0} ${yTop} L ${x0} ${yBottom}`);  // Between tuck and panel 1
            folds.push(`M ${x1} ${yTop} L ${x1} ${yBottom}`);
            folds.push(`M ${x2} ${yTop} L ${x2} ${yBottom}`);

            // ==========================================
            // TOP END FLAPS
            // ==========================================

            // Panel 1 top - TRIANGLE with TUCK FLAP on right edge, SLOT inside the tuck
            const p1TopApex = x0 + S / 2;
            const baseOffset = 0.5; // small offset to prevent cut/fold overlap
            folds.push(`M ${x0} ${yTop} L ${x1} ${yTop}`);
            // Triangle left edge (clean) - starts slightly above fold line
            cuts.push(`M ${x0} ${yTop - baseOffset} L ${p1TopApex} ${yEndTop}`);

            // TUCK FLAP - trapezoid with b2 along right slope, b1 shorter (outer edge)
            const tuckW = endTuckW; // perpendicular width
            const apexInset = 8; // inset at apex end
            const baseInset = 15; // larger inset at base to avoid overlap with next triangle

            // Right edge (b2): from apex to base corner
            const b2StartX = p1TopApex;
            const b2StartY = yEndTop;
            const b2EndX = x1;
            const b2EndY = yTop - baseOffset;

            // Direction along b2 (from apex toward base)
            const edgeDx = b2EndX - b2StartX;
            const edgeDy = b2EndY - b2StartY;
            const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
            const dirX = edgeDx / edgeLen;
            const dirY = edgeDy / edgeLen;

            // Normal vector (perpendicular, pointing outward/right)
            const normalX = edgeDy / edgeLen;
            const normalY = -edgeDx / edgeLen;

            // b1 endpoints (outer edge, shorter and offset perpendicular by tuckW)
            const b1StartX = b2StartX + normalX * tuckW + dirX * apexInset;
            const b1StartY = b2StartY + normalY * tuckW + dirY * apexInset;
            const b1EndX = b2EndX + normalX * tuckW - dirX * baseInset;
            const b1EndY = b2EndY + normalY * tuckW - dirY * baseInset;

            // Draw tuck flap: apex-side edge, b1 (outer), base-side edge
            cuts.push(`M ${b2StartX} ${b2StartY} L ${b1StartX} ${b1StartY}`);
            cuts.push(`M ${b1StartX} ${b1StartY} L ${b1EndX} ${b1EndY}`);
            cuts.push(`M ${b1EndX} ${b1EndY} L ${b2EndX} ${b2EndY}`);

            // Fold line along b2 (right edge of triangle)
            folds.push(`M ${b2StartX} ${b2StartY} L ${b2EndX} ${b2EndY}`);

            // SLOT centered ON the fold line (b2)
            const slotLen = lockW + 2;
            const slotW = 4;
            // Center on fold line (midpoint of b2)
            const slotCenterX = (b2StartX + b2EndX) / 2;
            const slotCenterY = (b2StartY + b2EndY) / 2;
            // Slot corners (aligned with edge direction)
            const slot1X = slotCenterX - dirX * slotLen / 2 - normalX * slotW / 2;
            const slot1Y = slotCenterY - dirY * slotLen / 2 - normalY * slotW / 2;
            const slot2X = slotCenterX + dirX * slotLen / 2 - normalX * slotW / 2;
            const slot2Y = slotCenterY + dirY * slotLen / 2 - normalY * slotW / 2;
            const slot3X = slotCenterX + dirX * slotLen / 2 + normalX * slotW / 2;
            const slot3Y = slotCenterY + dirY * slotLen / 2 + normalY * slotW / 2;
            const slot4X = slotCenterX - dirX * slotLen / 2 + normalX * slotW / 2;
            const slot4Y = slotCenterY - dirY * slotLen / 2 + normalY * slotW / 2;
            cuts.push(`M ${slot1X} ${slot1Y} L ${slot2X} ${slot2Y}`);
            cuts.push(`M ${slot2X} ${slot2Y} L ${slot3X} ${slot3Y}`);
            cuts.push(`M ${slot3X} ${slot3Y} L ${slot4X} ${slot4Y}`);
            cuts.push(`M ${slot4X} ${slot4Y} L ${slot1X} ${slot1Y}`);

            // Panel 2 top - NORMAL TRIANGLE + INVERTED TRIANGLE sharing fold line
            // Normal triangle: same as Panel 1 but without tuck
            // Inverted triangle: attached via fold line on right, has lock tab on far right
            const p2TopApex = x1 + S / 2;
            folds.push(`M ${x1} ${yTop} L ${x2} ${yTop}`);

            // Normal triangle - left edge (CUT)
            cuts.push(`M ${x1} ${yTop - baseOffset} L ${p2TopApex} ${yEndTop}`);

            // Fold line between normal and inverted triangles (right edge of normal = left edge of inverted)
            folds.push(`M ${p2TopApex} ${yEndTop} L ${x2} ${yTop - baseOffset}`);

            // Inverted triangle vertices:
            // - C = (p2TopApex, yEndTop) = shared with normal apex
            // - B = (x2, yTop) = shared with normal right base  
            // - D = (x2 + S/2, yEndTop) = third vertex, extends right
            const p2InvX = x2 + S / 2; // D.x
            const p2InvY = yEndTop;     // D.y

            // Inverted triangle - top edge (CUT): from C to D
            cuts.push(`M ${p2TopApex} ${yEndTop} L ${p2InvX} ${p2InvY}`);

            // Inverted triangle - right edge with LOCK TAB: from D to B
            // Direction along right edge (from D to B)
            const p2RightDx = x2 - p2InvX;
            const p2RightDy = (yTop - baseOffset) - p2InvY;
            const p2RightLen = Math.sqrt(p2RightDx * p2RightDx + p2RightDy * p2RightDy);
            const p2DirX = p2RightDx / p2RightLen;
            const p2DirY = p2RightDy / p2RightLen;
            // Normal (perpendicular, pointing outward/right)
            const p2NormX = p2RightDy / p2RightLen;
            const p2NormY = -p2RightDx / p2RightLen;

            // Lock tab dimensions (same as slot)
            const lockTabW = slotW;
            const lockTabLen = slotLen;

            // Lock tab position (centered on right edge)
            const p2TabCenterX = (p2InvX + x2) / 2;
            const p2TabCenterY = (p2InvY + (yTop - baseOffset)) / 2;

            // Tab corners
            const p2Tab1X = p2TabCenterX - p2DirX * lockTabLen / 2;
            const p2Tab1Y = p2TabCenterY - p2DirY * lockTabLen / 2;
            const p2Tab2X = p2TabCenterX + p2DirX * lockTabLen / 2;
            const p2Tab2Y = p2TabCenterY + p2DirY * lockTabLen / 2;
            const p2Tab3X = p2Tab2X + p2NormX * lockTabW;
            const p2Tab3Y = p2Tab2Y + p2NormY * lockTabW;
            const p2Tab4X = p2Tab1X + p2NormX * lockTabW;
            const p2Tab4Y = p2Tab1Y + p2NormY * lockTabW;

            // Draw right edge with tab
            cuts.push(`M ${p2InvX} ${p2InvY} L ${p2Tab1X} ${p2Tab1Y}`);
            cuts.push(`M ${p2Tab1X} ${p2Tab1Y} L ${p2Tab4X} ${p2Tab4Y}`);
            cuts.push(`M ${p2Tab4X} ${p2Tab4Y} L ${p2Tab3X} ${p2Tab3Y}`);
            cuts.push(`M ${p2Tab3X} ${p2Tab3Y} L ${p2Tab2X} ${p2Tab2Y}`);
            cuts.push(`M ${p2Tab2X} ${p2Tab2Y} L ${x2} ${yTop - baseOffset}`);

            // Panel 3 top - TRAPEZOID (not triangle)
            // b2 = base along fold line, b1 = shorter top edge
            // Height = tuckW (End Tuck Width)
            folds.push(`M ${x2} ${yTop} L ${x3} ${yTop}`);

            // Trapezoid corners:
            // Bottom left (BL): x2, yTop
            // Bottom right (BR): x3, yTop
            // Top left (TL): x2 + baseInset, yTop - tuckW
            // Top right (TR): x3 - baseInset, yTop - tuckW
            const p3BLx = x2;
            const p3BLy = yTop - baseOffset;
            const p3BRx = x3;
            const p3BRy = yTop - baseOffset;
            const p3TLx = x2 + baseInset;
            const p3TLy = yTop - tuckW;
            const p3TRx = x3 - baseInset;
            const p3TRy = yTop - tuckW;

            // Draw trapezoid: left edge, top edge (b1), right edge
            cuts.push(`M ${p3BLx} ${p3BLy} L ${p3TLx} ${p3TLy}`);
            cuts.push(`M ${p3TLx} ${p3TLy} L ${p3TRx} ${p3TRy}`);
            cuts.push(`M ${p3TRx} ${p3TRy} L ${p3BRx} ${p3BRy}`);

            // ==========================================
            // BOTTOM END FLAPS (mirror of top)
            // ==========================================

            // Panel 1 bottom - TRIANGLE with TUCK FLAP on right edge, SLOT inside tuck
            const p1BottomApex = x0 + S / 2;
            folds.push(`M ${x0} ${yBottom} L ${x1} ${yBottom}`);
            cuts.push(`M ${x0} ${yBottom + baseOffset} L ${p1BottomApex} ${yEndBottom}`);

            // TUCK FLAP - trapezoid (mirrored from top)
            // Right edge (b2): from apex to base corner
            const b2StartXBot = p1BottomApex;
            const b2StartYBot = yEndBottom;
            const b2EndXBot = x1;
            const b2EndYBot = yBottom + baseOffset;

            // Direction along b2 (from apex toward base)
            const edgeDxBot = b2EndXBot - b2StartXBot;
            const edgeDyBot = b2EndYBot - b2StartYBot;
            const edgeLenBot = Math.sqrt(edgeDxBot * edgeDxBot + edgeDyBot * edgeDyBot);
            const dirXBot = edgeDxBot / edgeLenBot;
            const dirYBot = edgeDyBot / edgeLenBot;

            // Normal vector (perpendicular, pointing outward/right) - negated for bottom
            const normalXBot = -edgeDyBot / edgeLenBot;
            const normalYBot = edgeDxBot / edgeLenBot;

            // b1 endpoints (outer edge, shorter and offset perpendicular by tuckW)
            const b1StartXBot = b2StartXBot + normalXBot * tuckW + dirXBot * apexInset;
            const b1StartYBot = b2StartYBot + normalYBot * tuckW + dirYBot * apexInset;
            const b1EndXBot = b2EndXBot + normalXBot * tuckW - dirXBot * baseInset;
            const b1EndYBot = b2EndYBot + normalYBot * tuckW - dirYBot * baseInset;

            // Draw tuck flap: apex-side edge, b1 (outer), base-side edge
            cuts.push(`M ${b2StartXBot} ${b2StartYBot} L ${b1StartXBot} ${b1StartYBot}`);
            cuts.push(`M ${b1StartXBot} ${b1StartYBot} L ${b1EndXBot} ${b1EndYBot}`);
            cuts.push(`M ${b1EndXBot} ${b1EndYBot} L ${b2EndXBot} ${b2EndYBot}`);

            // Fold line along b2 (right edge of triangle)
            folds.push(`M ${b2StartXBot} ${b2StartYBot} L ${b2EndXBot} ${b2EndYBot}`);

            // SLOT centered ON the fold line (b2)
            // Center on fold line (midpoint of b2)
            const slotCenterXBot = (b2StartXBot + b2EndXBot) / 2;
            const slotCenterYBot = (b2StartYBot + b2EndYBot) / 2;
            const slot1XBot = slotCenterXBot - dirXBot * slotLen / 2 - normalXBot * slotW / 2;
            const slot1YBot = slotCenterYBot - dirYBot * slotLen / 2 - normalYBot * slotW / 2;
            const slot2XBot = slotCenterXBot + dirXBot * slotLen / 2 - normalXBot * slotW / 2;
            const slot2YBot = slotCenterYBot + dirYBot * slotLen / 2 - normalYBot * slotW / 2;
            const slot3XBot = slotCenterXBot + dirXBot * slotLen / 2 + normalXBot * slotW / 2;
            const slot3YBot = slotCenterYBot + dirYBot * slotLen / 2 + normalYBot * slotW / 2;
            const slot4XBot = slotCenterXBot - dirXBot * slotLen / 2 + normalXBot * slotW / 2;
            const slot4YBot = slotCenterYBot - dirYBot * slotLen / 2 + normalYBot * slotW / 2;
            cuts.push(`M ${slot1XBot} ${slot1YBot} L ${slot2XBot} ${slot2YBot}`);
            cuts.push(`M ${slot2XBot} ${slot2YBot} L ${slot3XBot} ${slot3YBot}`);
            cuts.push(`M ${slot3XBot} ${slot3YBot} L ${slot4XBot} ${slot4YBot}`);
            cuts.push(`M ${slot4XBot} ${slot4YBot} L ${slot1XBot} ${slot1YBot}`);

            // Panel 2 bottom - NORMAL TRIANGLE + INVERTED TRIANGLE (mirrored from top)
            const p2BottomApex = x1 + S / 2;
            folds.push(`M ${x1} ${yBottom} L ${x2} ${yBottom}`);

            // Normal triangle - left edge (CUT)
            cuts.push(`M ${x1} ${yBottom + baseOffset} L ${p2BottomApex} ${yEndBottom}`);

            // Fold line between normal and inverted triangles
            folds.push(`M ${p2BottomApex} ${yEndBottom} L ${x2} ${yBottom + baseOffset}`);

            // Inverted triangle vertices (mirrored):
            // - C = (p2BottomApex, yEndBottom) = shared with normal apex
            // - B = (x2, yBottom) = shared with normal right base  
            // - D = (x2 + S/2, yEndBottom) = third vertex, extends right
            const p2InvXBot = x2 + S / 2; // D.x
            const p2InvYBot = yEndBottom;  // D.y

            // Inverted triangle - top edge (CUT): from C to D
            cuts.push(`M ${p2BottomApex} ${yEndBottom} L ${p2InvXBot} ${p2InvYBot}`);

            // Inverted triangle - right edge with LOCK TAB: from D to B
            const p2RightDxBot = x2 - p2InvXBot;
            const p2RightDyBot = (yBottom + baseOffset) - p2InvYBot;
            const p2RightLenBot = Math.sqrt(p2RightDxBot * p2RightDxBot + p2RightDyBot * p2RightDyBot);
            const p2DirXBot = p2RightDxBot / p2RightLenBot;
            const p2DirYBot = p2RightDyBot / p2RightLenBot;
            // Normal (perpendicular, pointing outward) - negated for bottom
            const p2NormXBot = -p2RightDyBot / p2RightLenBot;
            const p2NormYBot = p2RightDxBot / p2RightLenBot;

            // Lock tab position (centered on right edge)
            const p2TabCenterXBot = (p2InvXBot + x2) / 2;
            const p2TabCenterYBot = (p2InvYBot + (yBottom + baseOffset)) / 2;

            // Tab corners
            const p2Tab1XBot = p2TabCenterXBot - p2DirXBot * lockTabLen / 2;
            const p2Tab1YBot = p2TabCenterYBot - p2DirYBot * lockTabLen / 2;
            const p2Tab2XBot = p2TabCenterXBot + p2DirXBot * lockTabLen / 2;
            const p2Tab2YBot = p2TabCenterYBot + p2DirYBot * lockTabLen / 2;
            const p2Tab3XBot = p2Tab2XBot + p2NormXBot * lockTabW;
            const p2Tab3YBot = p2Tab2YBot + p2NormYBot * lockTabW;
            const p2Tab4XBot = p2Tab1XBot + p2NormXBot * lockTabW;
            const p2Tab4YBot = p2Tab1YBot + p2NormYBot * lockTabW;

            // Draw right edge with tab
            cuts.push(`M ${p2InvXBot} ${p2InvYBot} L ${p2Tab1XBot} ${p2Tab1YBot}`);
            cuts.push(`M ${p2Tab1XBot} ${p2Tab1YBot} L ${p2Tab4XBot} ${p2Tab4YBot}`);
            cuts.push(`M ${p2Tab4XBot} ${p2Tab4YBot} L ${p2Tab3XBot} ${p2Tab3YBot}`);
            cuts.push(`M ${p2Tab3XBot} ${p2Tab3YBot} L ${p2Tab2XBot} ${p2Tab2YBot}`);
            cuts.push(`M ${p2Tab2XBot} ${p2Tab2YBot} L ${x2} ${yBottom + baseOffset}`);

            // Panel 3 bottom - TRAPEZOID (mirrored from top)
            folds.push(`M ${x2} ${yBottom} L ${x3} ${yBottom}`);

            // Trapezoid corners (mirrored):
            const p3BLxBot = x2;
            const p3BLyBot = yBottom + baseOffset;
            const p3BRxBot = x3;
            const p3BRyBot = yBottom + baseOffset;
            const p3TLxBot = x2 + baseInset;
            const p3TLyBot = yBottom + tuckW;
            const p3TRxBot = x3 - baseInset;
            const p3TRyBot = yBottom + tuckW;

            // Draw trapezoid: left edge, bottom edge (b1), right edge
            cuts.push(`M ${p3BLxBot} ${p3BLyBot} L ${p3TLxBot} ${p3TLyBot}`);
            cuts.push(`M ${p3TLxBot} ${p3TLyBot} L ${p3TRxBot} ${p3TRyBot}`);
            cuts.push(`M ${p3TRxBot} ${p3TRyBot} L ${p3BRxBot} ${p3BRyBot}`);


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
                    { x: ox - tuck / 2, y: yTop + D / 2, text: 'tuck' },
                    { x: x0 + S / 2, y: yTop + D / 2, text: `${S}x${D}` },
                    { x: x1 + S / 2, y: yTop + D / 2, text: `${S}x${D}` },
                    { x: x2 + S / 2, y: yTop + D / 2, text: `${S}x${D}` },
                    { x: x0 + S / 2, y: yEndTop + triH / 2, text: 'slot' },
                    { x: x1 + S / 2, y: yEndTop + triH / 2, text: 'lock' },
                    { x: x2 + S / 2, y: yEndTop + triH / 2, text: 'tab' },
                    { x: x0 + S / 2, y: yEndBottom - triH / 2, text: 'slot' },
                    { x: x1 + S / 2, y: yEndBottom - triH / 2, text: 'lock' },
                    { x: x2 + S / 2, y: yEndBottom - triH / 2, text: 'tab' },
                ];
                labels.forEach(lbl => {
                    svg += `<text x="${lbl.x}" y="${lbl.y}" class="label-text" text-anchor="middle" dominant-baseline="middle">${lbl.text}</text>`;
                });
            }

            // Dimensions
            if (this.display.showDimensions) {
                // Side dimension - above the lock tab to avoid overlap
                svg += `<line x1="${x1}" y1="${yLockTop - 10}" x2="${x2}" y2="${yLockTop - 10}" class="dimension-line"/>`;
                svg += `<text x="${x1 + S / 2}" y="${yLockTop - 18}" class="dimension-text" text-anchor="middle">S = ${S}mm</text>`;

                // Depth dimension
                svg += `<line x1="${x3 + 20}" y1="${yTop}" x2="${x3 + 20}" y2="${yBottom}" class="dimension-line"/>`;
                svg += `<text x="${x3 + 35}" y="${yTop + D / 2}" class="dimension-text" text-anchor="middle" transform="rotate(90,${x3 + 35},${yTop + D / 2})">D = ${D}mm</text>`;

                // Overall dimensions
                const dims = this.getPatternDimensions();
                svg += `<text x="${padding + patternW / 2}" y="${padding - 35}" class="dimension-text" text-anchor="middle">Overall: ${Math.round(dims.totalW - padding * 2)}mm x ${Math.round(dims.totalH - padding * 2)}mm</text>`;
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
