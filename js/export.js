/**
 * Boxy - Universal Export Module
 * Provides SVG, PNG, PDF, and DXF export functionality for all box styles
 */

const BoxyExport = {
    /**
     * Download a blob as a file
     * @param {Blob} blob - The blob to download
     * @param {string} filename - The filename for the download
     */
    download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Export SVG at 1:1 scale
     * @param {Function} generateSVG - Function that returns the SVG string
     * @param {Object} dimensions - { totalW, totalH } in mm
     * @param {string} filename - Output filename (default: 'box.svg')
     */
    exportSVG(generateSVG, dimensions, filename = 'box.svg') {
        const displaySVG = generateSVG();
        const { totalW, totalH } = dimensions;

        // Replace the width/height/viewBox to be 1:1 scale in mm
        const exportSVG = displaySVG.replace(
            /<svg id="box-svg"[^>]*>/,
            `<svg id="box-svg" width="${totalW}mm" height="${totalH}mm" viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg">`
        );

        const blob = new Blob([exportSVG], { type: 'image/svg+xml' });
        this.download(blob, filename);
    },

    /**
     * Export as PNG
     * @param {Function} generateSVG - Function that returns the SVG string
     * @param {Object} dimensions - { totalW, totalH } in mm
     * @param {string} filename - Output filename (default: 'box.png')
     */
    exportPNG(generateSVG, dimensions, filename = 'box.png') {
        const displaySVG = generateSVG();
        const { totalW, totalH } = dimensions;

        const exportSVG = displaySVG.replace(
            /<svg id="box-svg"[^>]*>/,
            `<svg id="box-svg" width="${totalW}mm" height="${totalH}mm" viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg">`
        );

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => this.download(blob, filename), 'image/png');
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(exportSVG)));
    },

    /**
     * Export as PDF (requires jsPDF library)
     * @param {Function} generateSVG - Function that returns the SVG string
     * @param {Object} dimensions - { totalW, totalH } in mm
     * @param {string} filename - Output filename (default: 'box.pdf')
     */
    exportPDF(generateSVG, dimensions, filename = 'box.pdf') {
        const displaySVG = generateSVG();
        const { totalW, totalH } = dimensions;

        const exportSVG = displaySVG.replace(
            /<svg id="box-svg"[^>]*>/,
            `<svg id="box-svg" width="${totalW}mm" height="${totalH}mm" viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg">`
        );

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
            const pdf = new jsPDF({
                orientation: totalW > totalH ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [totalW, totalH]
            });

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, totalW, totalH);
            pdf.save(filename);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(exportSVG)));
    },

    /**
     * Export as DXF
     * @param {Function} generateSVG - Function that returns the SVG string
     * @param {Object} dimensions - { totalW, totalH } in mm
     * @param {string} filename - Output filename (default: 'box.dxf')
     */
    exportDXF(generateSVG, dimensions, filename = 'box.dxf') {
        const displaySVG = generateSVG();
        const { totalW, totalH } = dimensions;

        // Parse SVG paths and convert to DXF format
        const dxfContent = this.svgToDXF(displaySVG, totalW, totalH);
        const blob = new Blob([dxfContent], { type: 'application/dxf' });
        this.download(blob, filename);
    },

    /**
     * Convert SVG paths to DXF format
     * @param {string} svgString - The SVG content
     * @param {number} width - Total width in mm
     * @param {number} height - Total height in mm
     * @returns {string} DXF file content
     */
    svgToDXF(svgString, width, height) {
        let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n`;
        dxf += `0\nSECTION\n2\nTABLES\n0\nENDSEC\n`;
        dxf += `0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n`;
        dxf += `0\nSECTION\n2\nENTITIES\n`;

        // Parse paths from SVG
        const pathRegex = /d="([^"]+)"/g;
        const classRegex = /class="([^"]+)"/;
        let match;

        // Simple parser for M and L commands in paths
        const paths = svgString.match(/<path[^>]+>/g) || [];

        paths.forEach(pathTag => {
            const dMatch = pathTag.match(/d="([^"]+)"/);
            const cMatch = pathTag.match(/class="([^"]+)"/);

            if (dMatch) {
                const pathData = dMatch[1];
                const isFold = cMatch && cMatch[1].includes('fold');
                const layer = isFold ? 'FOLD' : 'CUT';

                // Parse simple M/L/Q commands
                const commands = pathData.match(/[MLQ][^MLQ]*/g) || [];
                let currentX = 0, currentY = 0;
                let startX = 0, startY = 0;

                commands.forEach(cmd => {
                    const type = cmd[0];
                    const coords = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat);

                    if (type === 'M') {
                        startX = currentX = coords[0];
                        startY = currentY = height - coords[1]; // Flip Y for DXF
                    } else if (type === 'L') {
                        const x = coords[0];
                        const y = height - coords[1]; // Flip Y for DXF

                        // Add LINE entity
                        dxf += `0\nLINE\n8\n${layer}\n`;
                        dxf += `10\n${currentX}\n20\n${currentY}\n30\n0\n`;
                        dxf += `11\n${x}\n21\n${y}\n31\n0\n`;

                        currentX = x;
                        currentY = y;
                    } else if (type === 'Q') {
                        // Quadratic bezier - approximate with line for simplicity
                        const x = coords[2];
                        const y = height - coords[3];

                        dxf += `0\nLINE\n8\n${layer}\n`;
                        dxf += `10\n${currentX}\n20\n${currentY}\n30\n0\n`;
                        dxf += `11\n${x}\n21\n${y}\n31\n0\n`;

                        currentX = x;
                        currentY = y;
                    }
                });
            }
        });

        dxf += `0\nENDSEC\n0\nEOF\n`;
        return dxf;
    }
};

// Export for use in modules or directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BoxyExport;
}
