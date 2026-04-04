import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateEAN13CheckDigit,
  encodeEAN13,
  generateEPS
} from '../../core/ean13.mjs';

test('calculateEAN13CheckDigit calcola correttamente il check digit', () => {
  assert.equal(calculateEAN13CheckDigit('590123412345'), 7);
});

test('encodeEAN13 genera sequenza barre EAN-13 lunga 95 moduli', () => {
  const bars = encodeEAN13('5901234123457');
  assert.equal(bars.length, 95);
  assert.equal(bars.startsWith('101'), true);
  assert.equal(bars.endsWith('101'), true);
});

test('generateEPS produce output PostScript con header e bounding box', () => {
  const eps = generateEPS('5901234123457', 'ART-001');

  assert.match(eps, /^%!PS-Adobe-3.0 EPSF-3.0/m);
  assert.match(eps, /%%BoundingBox: 0 0 \d+ \d+/);
  assert.match(eps, /showpage/);
});

test('encodeEAN13 rifiuta input di lunghezza non valida', () => {
  assert.throws(() => encodeEAN13('12345'), /Codice deve avere 12 o 13 cifre/);
});
