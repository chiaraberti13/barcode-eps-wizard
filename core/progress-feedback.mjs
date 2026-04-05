export function formatEta(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return 'meno di 1s';
  }

  const totalSeconds = Math.max(1, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function buildProgressFeedback({
  currentIndex,
  totalItems,
  currentArticleCode,
  startedAt,
  now = Date.now()
}) {
  const safeTotal = Number.isFinite(totalItems) && totalItems > 0 ? Math.floor(totalItems) : 0;
  const safeCurrent = Number.isFinite(currentIndex) && currentIndex > 0
    ? Math.min(Math.floor(currentIndex), safeTotal)
    : 0;

  if (safeTotal === 0 || safeCurrent === 0) {
    return {
      percentage: 0,
      completedLabel: '0 / 0',
      detailLabel: 'In attesa di avvio elaborazione.',
      etaLabel: 'ETA non disponibile'
    };
  }

  const elapsedMs = Math.max(0, now - startedAt);
  const averagePerItemMs = safeCurrent > 0 ? elapsedMs / safeCurrent : 0;
  const remainingItems = Math.max(0, safeTotal - safeCurrent);
  const etaMs = remainingItems * averagePerItemMs;
  const percentage = (safeCurrent / safeTotal) * 100;
  const sanitizedCode = String(currentArticleCode || '').trim();
  const articleLabel = sanitizedCode || 'articolo non valorizzato';

  return {
    percentage,
    completedLabel: `${safeCurrent} / ${safeTotal}`,
    detailLabel: `Elemento ${safeCurrent} di ${safeTotal} · ${articleLabel}`,
    etaLabel: remainingItems > 0 ? `ETA: ${formatEta(etaMs)}` : 'Completato'
  };
}
