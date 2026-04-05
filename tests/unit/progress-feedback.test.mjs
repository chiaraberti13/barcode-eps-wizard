import assert from 'node:assert/strict';
import test from 'node:test';

import { buildProgressFeedback, formatEta } from '../../core/progress-feedback.mjs';

test('formatEta formatta secondi e minuti in modo consistente', () => {
  assert.equal(formatEta(0), 'meno di 1s');
  assert.equal(formatEta(2000), '2s');
  assert.equal(formatEta(62000), '1m 02s');
});

test('buildProgressFeedback restituisce fallback in stato inattivo', () => {
  const feedback = buildProgressFeedback({
    currentIndex: 0,
    totalItems: 0,
    currentArticleCode: '',
    startedAt: Date.now(),
    now: Date.now()
  });

  assert.equal(feedback.percentage, 0);
  assert.equal(feedback.completedLabel, '0 / 0');
  assert.match(feedback.detailLabel, /In attesa/);
  assert.equal(feedback.etaLabel, 'ETA non disponibile');
});

test('buildProgressFeedback include elemento corrente ed ETA durante la generazione', () => {
  const feedback = buildProgressFeedback({
    currentIndex: 2,
    totalItems: 4,
    currentArticleCode: 'ART-42',
    startedAt: 1_000,
    now: 5_000
  });

  assert.equal(feedback.percentage, 50);
  assert.equal(feedback.completedLabel, '2 / 4');
  assert.equal(feedback.detailLabel, 'Elemento 2 di 4 · ART-42');
  assert.equal(feedback.etaLabel, 'ETA: 4s');
});

test('buildProgressFeedback segnala completato all ultimo elemento', () => {
  const feedback = buildProgressFeedback({
    currentIndex: 3,
    totalItems: 3,
    currentArticleCode: '',
    startedAt: 10_000,
    now: 15_000
  });

  assert.equal(feedback.etaLabel, 'Completato');
  assert.match(feedback.detailLabel, /articolo non valorizzato/);
});
