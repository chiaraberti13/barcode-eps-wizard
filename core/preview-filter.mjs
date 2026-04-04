const PREVIEW_FILTERS = Object.freeze({
  ALL: 'all',
  SUCCESS: 'success',
  ERROR: 'error'
});

function normalizePreviewFilter(filter) {
  if (filter === PREVIEW_FILTERS.SUCCESS || filter === PREVIEW_FILTERS.ERROR) {
    return filter;
  }

  return PREVIEW_FILTERS.ALL;
}

function getFilteredPreviewEntries(entries, filter) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const normalizedFilter = normalizePreviewFilter(filter);

  return safeEntries.filter((entry) => {
    if (normalizedFilter === PREVIEW_FILTERS.SUCCESS) {
      return Boolean(entry.success);
    }

    if (normalizedFilter === PREVIEW_FILTERS.ERROR) {
      return !entry.success;
    }

    return true;
  });
}

function getPreviewFilterCounts(entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const all = safeEntries.length;
  const success = safeEntries.filter((entry) => Boolean(entry.success)).length;

  return {
    all,
    success,
    error: all - success
  };
}

export {
  PREVIEW_FILTERS,
  normalizePreviewFilter,
  getFilteredPreviewEntries,
  getPreviewFilterCounts
};
