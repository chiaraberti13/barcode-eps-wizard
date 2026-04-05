import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ensureUniqueFilename,
  normalizeArticleCode,
  normalizeBarcode,
  sanitizeEpsFilename
} from '../../core/row-utils.mjs';

test('normalizeBarcode normalizza input da 12 cifre e aggiunge check digit', () => {
  assert.equal(normalizeBarcode('590123412345', 2), '5901234123457');
});

test('normalizeBarcode supporta il formato Excel con suffisso .0', () => {
  assert.equal(normalizeBarcode('590123412345.0', 3), '5901234123457');
});

test('normalizeBarcode rifiuta valori non numerici', () => {
  assert.throws(
    () => normalizeBarcode('59012AB12345', 4),
    /Riga 4: barcode non valido/
  );
});

test('normalizeArticleCode rifiuta codice articolo mancante', () => {
  assert.throws(
    () => normalizeArticleCode('   ', 5),
    /Riga 5: codice articolo mancante\./
  );
});

test('normalizeArticleCode rifiuta caratteri di controllo', () => {
  assert.throws(
    () => normalizeArticleCode('ART\u0007-01', 6),
    /Riga 6: codice articolo contiene caratteri non consentiti\./
  );
});

test('sanitizeEpsFilename produce fallback sicuro e cross-platform', () => {
  assert.equal(sanitizeEpsFilename('CON', 10), 'CON_file.eps');
  assert.equal(sanitizeEpsFilename('', 11), 'articolo_riga_11.eps');
});

test('ensureUniqueFilename applica suffissi deterministici su duplicati', () => {
  const counters = new Map();
  assert.equal(ensureUniqueFilename('ABC.eps', counters), 'ABC.eps');
  assert.equal(ensureUniqueFilename('ABC.eps', counters), 'ABC_2.eps');
  assert.equal(ensureUniqueFilename('ABC.eps', counters), 'ABC_3.eps');
});
