import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREVIEW_FILTERS,
  getFilteredPreviewEntries,
  getPreviewFilterCounts,
  normalizePreviewFilter
} from '../../core/preview-filter.mjs';

const entries = [
  { success: true, codiceArticolo: 'ART-1' },
  { success: false, codiceArticolo: 'ART-2' },
  { success: true, codiceArticolo: 'ART-3' }
];

test('normalizePreviewFilter accetta solo filtri supportati', () => {
  assert.equal(normalizePreviewFilter(PREVIEW_FILTERS.ALL), PREVIEW_FILTERS.ALL);
  assert.equal(normalizePreviewFilter(PREVIEW_FILTERS.SUCCESS), PREVIEW_FILTERS.SUCCESS);
  assert.equal(normalizePreviewFilter(PREVIEW_FILTERS.ERROR), PREVIEW_FILTERS.ERROR);
  assert.equal(normalizePreviewFilter('invalid'), PREVIEW_FILTERS.ALL);
});

test('getFilteredPreviewEntries filtra correttamente successi ed errori', () => {
  assert.equal(getFilteredPreviewEntries(entries, PREVIEW_FILTERS.ALL).length, 3);
  assert.equal(getFilteredPreviewEntries(entries, PREVIEW_FILTERS.SUCCESS).length, 2);
  assert.equal(getFilteredPreviewEntries(entries, PREVIEW_FILTERS.ERROR).length, 1);
});

test('getPreviewFilterCounts calcola conteggi coerenti', () => {
  assert.deepEqual(getPreviewFilterCounts(entries), {
    all: 3,
    success: 2,
    error: 1
  });
});
