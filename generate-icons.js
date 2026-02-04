const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 48, 128];

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(1, '#6D28D9');

    // Draw rounded rectangle
    const radius = size * 0.22;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw "N" letter
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', size / 2, size / 2 + size * 0.05);

    return canvas.toBuffer('image/png');
}

// Generate icons
sizes.forEach(size => {
    const buffer = createIcon(size);
    fs.writeFileSync(`extension/icons/icon${size}.png`, buffer);
    console.log(`Created icon${size}.png`);
});

console.log('All icons generated!');
