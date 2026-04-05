import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateEAN13CheckDigit,
  encodeEAN13,
  generateEPS,
  normalizeEAN13Input
} from '../../core/ean13.mjs';

test('calculateEAN13CheckDigit calcola correttamente il check digit', () => {
  assert.equal(calculateEAN13CheckDigit('590123412345'), 7);
});

test('calculateEAN13CheckDigit gestisce edge numerici (tutti zero e tutti nove)', () => {
  assert.equal(calculateEAN13CheckDigit('000000000000'), 0);
  assert.equal(calculateEAN13CheckDigit('999999999999'), 4);
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


test('generateEPS sanitizza metadati DSC contro payload con newline e percentuali', () => {
  const eps = generateEPS('5901234123457', `Articolo
%%BoundingBox: 1 1 1 1
100%`);

  assert.match(eps, /%%Subject: Articolo BoundingBox: 1 1 1 1 100/);
  assert.doesNotMatch(eps, /%%Subject:.*%%BoundingBox: 1 1 1 1/m);
});

test('encodeEAN13 rifiuta input di lunghezza non valida', () => {
  assert.throws(() => encodeEAN13('12345'), /Codice EAN-13 non valido/);
});

test('normalizeEAN13Input accetta input a 12 cifre e aggiunge check digit', () => {
  assert.equal(normalizeEAN13Input('590123412345'), '5901234123457');
});

test('normalizeEAN13Input rifiuta caratteri non numerici', () => {
  assert.throws(() => normalizeEAN13Input('59012341ABCD'), /Codice EAN-13 non valido/);
});

test('normalizeEAN13Input rifiuta cifre Unicode non ASCII', () => {
  assert.throws(() => normalizeEAN13Input('１２３４５６７８９０１２'), /Codice EAN-13 non valido/);
});

test('normalizeEAN13Input rifiuta EAN-13 con check digit errato', () => {
  assert.throws(() => normalizeEAN13Input('5901234123458'), /Check digit EAN-13 non valido/);
});

test('calculateEAN13CheckDigit rifiuta input non conforme', () => {
  assert.throws(
    () => calculateEAN13CheckDigit('1234'),
    /Per il check digit sono richieste esattamente 12 cifre numeriche/
  );
});
