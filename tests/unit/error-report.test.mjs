import test from 'node:test';
import assert from 'node:assert/strict';

import { buildErrorReportCsv, buildErrorReportJson } from '../../core/error-report.mjs';

test('buildErrorReportCsv genera intestazione e righe con escaping sicuro', () => {
  const csv = buildErrorReportCsv([
    {
      rowIndex: 2,
      codiceArticolo: 'ART"01',
      barcodeOriginale: '123456789012',
      motivo: 'Riga 2: barcode non valido'
    }
  ]);

  assert.match(csv, /^rowIndex,codiceArticolo,barcodeOriginale,motivo/m);
  assert.match(csv, /"ART""01"/);
});

test('buildErrorReportJson include metadata e numero errori coerente', () => {
  const json = buildErrorReportJson([
    { rowIndex: 7, codiceArticolo: 'ART-7', barcodeOriginale: '', motivo: 'Errore' }
  ]);
  const parsed = JSON.parse(json);

  assert.equal(parsed.totalErrors, 1);
  assert.equal(parsed.rows[0].rowIndex, 7);
  assert.equal(typeof parsed.generatedAt, 'string');
});
