const sharp = require('sharp');
const path = require('path');

const outDir = path.join(__dirname, 'flappy-bird-lynx/assets/sprites');

const sheet1 = path.join(__dirname, 'img/og-theme.png');
const sheet2 = path.join(__dirname, 'img/og-theme-2.png');

const sprites1 = [
  { name: 'background.png', x: 0, y: 0, w: 276, h: 228 },
  { name: 'ground.png', x: 276, y: 0, w: 224, h: 112 },
  { name: 'bird-0.png', x: 276, y: 114, w: 34, h: 24 },
  { name: 'bird-1.png', x: 276, y: 140, w: 34, h: 24 },
  { name: 'bird-2.png', x: 276, y: 166, w: 34, h: 24 },
  { name: 'get-ready.png', x: 0, y: 228, w: 174, h: 160 },
  { name: 'game-over.png', x: 174, y: 228, w: 226, h: 158 },
];

const sprites2 = [
  { name: 'pipe-top.png', x: 56, y: 323, w: 26, h: 160 },
  { name: 'pipe-bottom.png', x: 84, y: 323, w: 26, h: 160 },
  { name: 'digit-0.png', x: 496, y: 60, w: 12, h: 18 },
  { name: 'digit-1.png', x: 135, y: 455, w: 10, h: 18 },
  { name: 'digit-2.png', x: 292, y: 160, w: 12, h: 18 },
  { name: 'digit-3.png', x: 306, y: 160, w: 12, h: 18 },
  { name: 'digit-4.png', x: 320, y: 160, w: 12, h: 18 },
  { name: 'digit-5.png', x: 334, y: 160, w: 12, h: 18 },
  { name: 'digit-6.png', x: 292, y: 184, w: 12, h: 18 },
  { name: 'digit-7.png', x: 306, y: 184, w: 12, h: 18 },
  { name: 'digit-8.png', x: 320, y: 184, w: 12, h: 18 },
  { name: 'digit-9.png', x: 334, y: 184, w: 12, h: 18 },
];

async function extractSprites(sheetPath, sprites) {
  for (const s of sprites) {
    const outPath = path.join(outDir, s.name);
    await sharp(sheetPath)
      .extract({ left: s.x, top: s.y, width: s.w, height: s.h })
      .toFile(outPath);
    console.log(`Extracted: ${s.name} (${s.w}x${s.h})`);
  }
}

(async () => {
  try {
    await extractSprites(sheet1, sprites1);
    await extractSprites(sheet2, sprites2);
    console.log('\nAll sprites extracted successfully.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
