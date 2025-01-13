const fs = require('fs');
const path = require('path');
const svgstore = require('svgstore');
const xmljs = require('xml-js');

// Combine and process SVGs
function createSvgSymbols() {
    const inputDir = path.join(__dirname, 'svg/yr');
    const outputFile = path.join(__dirname, 'svg-symbols-yr.svg');

    // Combine SVGs into a single file
    const sprites = svgstore({ inline: true });
    fs.readdirSync(inputDir).forEach(file => {
        const filePath = path.join(inputDir, file);
        if (path.extname(file) === '.svg') {
            const svgContent = fs.readFileSync(filePath, 'utf-8');
            sprites.add(path.basename(file, '.svg'), svgContent);
        }
    });

    // Modify the combined SVG
    const combinedSvg = sprites.toString();
    const json = xmljs.xml2js(combinedSvg, { compact: true });

    // Add a "style" attribute to the <svg> element
    if (json.svg) {
        json.svg._attributes = json.svg._attributes || {};
        json.svg._attributes.style = 'display:none';
    }

    // Convert back to XML
    const modifiedSvg = xmljs.js2xml(json, { compact: true, spaces: 2 });

    // Save the final SVG
    fs.writeFileSync(outputFile, modifiedSvg);
    console.log(`SVG symbols written to ${outputFile}`);
}

// Run the task
createSvgSymbols();
