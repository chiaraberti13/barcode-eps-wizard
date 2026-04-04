import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const requiredFiles = [
  'barcode-eps-wizard.html',
  'app.js',
  'styles.css'
];

test('il repository include gli asset core della web app', () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(file), true, `File mancante: ${file}`);
  }
});

test('app.js dichiara i limiti di sicurezza su upload e righe', () => {
  const appJsContent = fs.readFileSync('app.js', 'utf8');

  assert.match(appJsContent, /MAX_UPLOAD_FILE_SIZE_BYTES\s*=\s*5\s*\*\s*1024\s*\*\s*1024/);
  assert.match(appJsContent, /MAX_PROCESSABLE_ROWS\s*=\s*5000/);
});
