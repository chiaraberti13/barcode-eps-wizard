import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('barcode-eps-wizard.html', 'utf8');

assert.match(html, /id="uploadArea"/, 'Manca la dropzone upload.');
assert.match(html, /id="generateBtn"/, 'Manca il bottone di generazione.');
assert.match(html, /id="downloadAllBtn"/, 'Manca il bottone di download bulk.');

console.log('E2E smoke OK: struttura UI minima presente.');
