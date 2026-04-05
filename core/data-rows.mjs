const DEFAULT_REQUIRED_COLUMNS = Object.freeze({
  codiceArticolo: ['codicearticolo'],
  barcode: ['barcode']
});

const DEFAULT_REQUIRED_COLUMN_LABELS = Object.freeze({
  codiceArticolo: 'Codice articolo',
  barcode: 'Barcode'
});

export function normalizeColumnName(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export function resolveRequiredColumns(headers, {
  requiredColumns = DEFAULT_REQUIRED_COLUMNS,
  requiredColumnLabels = DEFAULT_REQUIRED_COLUMN_LABELS,
  expectedColumnsMessage = ''
} = {}) {
  const normalizedHeaders = new Map();

  headers.forEach((header) => {
    const normalized = normalizeColumnName(header);
    if (normalized) {
      normalizedHeaders.set(normalized, header);
    }
  });

  const resolvedColumns = {};

  for (const [field, acceptedNames] of Object.entries(requiredColumns)) {
    const matchedNormalizedName = acceptedNames.find((candidate) => normalizedHeaders.has(candidate));

    if (!matchedNormalizedName) {
      const requiredLabel = requiredColumnLabels[field] || field;
      const details = expectedColumnsMessage ? ` ${expectedColumnsMessage}` : '';
      throw new Error(`Colonna obbligatoria mancante: ${requiredLabel}.${details}`.trim());
    }

    resolvedColumns[field] = normalizedHeaders.get(matchedNormalizedName);
  }

  return resolvedColumns;
}

export function prepareDataRows(jsonData, {
  maxProcessableRows,
  requiredColumns = DEFAULT_REQUIRED_COLUMNS,
  requiredColumnLabels = DEFAULT_REQUIRED_COLUMN_LABELS,
  expectedColumnsMessage
} = {}) {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error(`Il file non contiene righe dati. Inserisci almeno una riga con ${String(expectedColumnsMessage || '').toLowerCase()}`.trim());
  }

  if (Number.isFinite(maxProcessableRows) && jsonData.length > maxProcessableRows) {
    throw new Error(`Il file contiene ${jsonData.length} righe. Limite massimo supportato: ${maxProcessableRows}. Suddividi il dataset in più file per evitare blocchi del browser.`);
  }

  const headers = Object.keys(jsonData[0] || {});
  const resolvedColumns = resolveRequiredColumns(headers, {
    requiredColumns,
    requiredColumnLabels,
    expectedColumnsMessage
  });

  return jsonData.map((row) => ({
    codiceArticolo: row[resolvedColumns.codiceArticolo],
    barcode: row[resolvedColumns.barcode]
  }));
}
