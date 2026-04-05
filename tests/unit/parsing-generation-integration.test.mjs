import test from 'node:test';
import assert from 'node:assert/strict';

import { prepareDataRows } from '../../core/data-rows.mjs';
import { generateEPS } from '../../core/ean13.mjs';
import {
  ensureUniqueFilename,
  normalizeBarcode,
  sanitizeEpsFilename
} from '../../core/row-utils.mjs';

const REQUIRED_COLUMNS = {
  codiceArticolo: ['codicearticolo'],
  barcode: ['barcode']
};

const REQUIRED_COLUMN_LABELS = {
  codiceArticolo: 'Codice articolo',
  barcode: 'Barcode'
};

test('integrazione parsing + pipeline genera EPS e traccia errori per riga', () => {
  const inputRows = [
    { ' Codice Articolo ': 'SKU/001', Barcode: '590123412345' },
    { ' Codice Articolo ': 'SKU/001', Barcode: '5901234123457' },
    { ' Codice Articolo ': 'SKU ERR', Barcode: '59012AB12345' }
  ];

  const preparedRows = prepareDataRows(inputRows, {
    maxProcessableRows: 5000,
    requiredColumns: REQUIRED_COLUMNS,
    requiredColumnLabels: REQUIRED_COLUMN_LABELS,
    expectedColumnsMessage: 'Colonne obbligatorie: Codice articolo e Barcode.'
  });

  const generated = [];
  const errors = [];
  const counters = new Map();

  preparedRows.forEach((row, index) => {
    const rowNumber = index + 2;

    try {
      const normalizedBarcode = normalizeBarcode(row.barcode, rowNumber);
      const epsContent = generateEPS(normalizedBarcode, row.codiceArticolo);
      const filename = ensureUniqueFilename(
        sanitizeEpsFilename(row.codiceArticolo, rowNumber),
        counters
      );

      generated.push({ filename, normalizedBarcode, epsContent });
    } catch (error) {
      errors.push({ rowNumber, message: error.message });
    }
  });

  assert.equal(generated.length, 2);
  assert.equal(errors.length, 1);

  assert.equal(generated[0].filename, 'SKU-001.eps');
  assert.equal(generated[1].filename, 'SKU-001_2.eps');
  assert.equal(generated[0].normalizedBarcode, '5901234123457');

  assert.match(generated[0].epsContent, /^%!PS-Adobe-3\.0 EPSF-3\.0/m);
  assert.match(generated[0].epsContent, /5901234123457/);

  assert.equal(errors[0].rowNumber, 4);
  assert.match(errors[0].message, /Riga 4: barcode non valido/);
});

test('integrazione parsing blocca input privo di colonne richieste', () => {
  assert.throws(
    () => prepareDataRows(
      [{ articolo: 'SKU-01', ean: '590123412345' }],
      {
        maxProcessableRows: 5000,
        requiredColumns: REQUIRED_COLUMNS,
        requiredColumnLabels: REQUIRED_COLUMN_LABELS,
        expectedColumnsMessage: 'Colonne obbligatorie: Codice articolo e Barcode.'
      }
    ),
    /Colonna obbligatoria mancante: Codice articolo/
  );
});
