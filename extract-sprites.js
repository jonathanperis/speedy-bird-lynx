import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const [sheet, manifestPath, output] = process.argv.slice(2);
if (sheet === '--help') {
  console.log('Usage: node extract-sprites.js <sheet.png> <crops.json> <output-directory>');
  console.log('Manifest: [{"name":"digits/digit-0.png","x":496,"y":60,"w":12,"h":18}]');
} else {
  if (!sheet || !manifestPath || !output) throw new Error('Provide a source sheet, crop manifest, and output directory. See --help.');
  const crops = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!Array.isArray(crops)) throw new Error('Crop manifest must be an array.');
  const directory = path.resolve(output);
  for (const crop of crops) {
    if (typeof crop.name !== 'string' || !['x', 'y', 'w', 'h'].every(key => Number.isInteger(crop[key]))
      || crop.x < 0 || crop.y < 0 || crop.w <= 0 || crop.h <= 0) throw new Error('Each crop needs a name and valid integer x/y/w/h.');
    const target = path.resolve(directory, crop.name);
    if (!target.startsWith(directory + path.sep)) throw new Error('Crop filename must stay inside the output directory.');
    await mkdir(path.dirname(target), { recursive: true });
    await sharp(sheet).extract({ left: crop.x, top: crop.y, width: crop.w, height: crop.h }).toFile(target);
    console.log(`Extracted ${crop.name} (${crop.w}×${crop.h})`);
  }
}
