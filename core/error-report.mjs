function escapeCsvValue(value) {
  const normalizedValue = value === undefined || value === null ? '' : String(value);
  const escapedValue = normalizedValue.replace(/"/g, '""');
  return `"${escapedValue}"`;
}

export function buildErrorReportCsv(errorRows) {
  const safeRows = Array.isArray(errorRows) ? errorRows : [];
  const headers = ['rowIndex', 'codiceArticolo', 'barcodeOriginale', 'motivo'];
  const csvRows = [headers.join(',')];

  for (const row of safeRows) {
    csvRows.push(
      [
        escapeCsvValue(row.rowIndex),
        escapeCsvValue(row.codiceArticolo),
        escapeCsvValue(row.barcodeOriginale),
        escapeCsvValue(row.motivo)
      ].join(',')
    );
  }

  return csvRows.join('\n');
}

export function buildErrorReportJson(errorRows) {
  const safeRows = Array.isArray(errorRows) ? errorRows : [];
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalErrors: safeRows.length,
      rows: safeRows
    },
    null,
    2
  );
}
