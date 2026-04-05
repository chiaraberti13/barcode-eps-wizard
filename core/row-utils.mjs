import { normalizeEAN13Input } from './ean13.mjs';

const EXCEL_DECIMAL_SUFFIX_REGEX = /^\d+\.0$/;
const INVALID_FILENAME_CHARS_REGEX = /[<>:"/\\|?*\u0000-\u001f]/g;
const CONTROL_CHARS_REGEX = /[\u0000-\u001f\u007f]/;
const MAX_ARTICLE_CODE_LENGTH = 180;
const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

export function normalizeBarcode(rawBarcode, rowNumber) {
  if (rawBarcode === null || rawBarcode === undefined || rawBarcode === '') {
    throw new Error(`Riga ${rowNumber}: barcode mancante.`);
  }

  let normalizedCandidate = String(rawBarcode).trim();

  if (typeof rawBarcode === 'number' && Number.isFinite(rawBarcode)) {
    normalizedCandidate = Number.isInteger(rawBarcode) ? String(rawBarcode) : '';
  }

  if (EXCEL_DECIMAL_SUFFIX_REGEX.test(normalizedCandidate)) {
    normalizedCandidate = normalizedCandidate.slice(0, -2);
  }

  if (!/^\d{12,13}$/.test(normalizedCandidate)) {
    throw new Error(`Riga ${rowNumber}: barcode non valido (richieste 12 o 13 cifre numeriche).`);
  }

  try {
    return normalizeEAN13Input(normalizedCandidate);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'barcode non valido.';
    throw new Error(`Riga ${rowNumber}: ${message}`);
  }
}

export function normalizeArticleCode(rawArticleCode, rowNumber) {
  const normalizedArticleCode = String(rawArticleCode ?? '').trim();

  if (!normalizedArticleCode) {
    throw new Error(`Riga ${rowNumber}: codice articolo mancante.`);
  }

  if (normalizedArticleCode.length > MAX_ARTICLE_CODE_LENGTH) {
    throw new Error(`Riga ${rowNumber}: codice articolo troppo lungo (max ${MAX_ARTICLE_CODE_LENGTH} caratteri).`);
  }

  if (CONTROL_CHARS_REGEX.test(normalizedArticleCode)) {
    throw new Error(`Riga ${rowNumber}: codice articolo contiene caratteri non consentiti.`);
  }

  return normalizedArticleCode;
}

export function sanitizeEpsFilename(codiceArticolo, rowNumber) {
  const normalizedValue = String(codiceArticolo ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(INVALID_FILENAME_CHARS_REGEX, '-')
    .replace(/[.\s]+$/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '-')
    .trim();

  let safeBaseName = normalizedValue || `articolo_riga_${rowNumber}`;
  if (WINDOWS_RESERVED_NAMES.has(safeBaseName.toUpperCase())) {
    safeBaseName = `${safeBaseName}_file`;
  }

  const maxLength = 120;
  if (safeBaseName.length > maxLength) {
    safeBaseName = safeBaseName.slice(0, maxLength);
  }

  return `${safeBaseName}.eps`;
}

export function ensureUniqueFilename(filename, filenameCounters) {
  const safeFilename = String(filename || 'barcode.eps');
  const extensionIndex = safeFilename.lastIndexOf('.');
  const hasExtension = extensionIndex > 0;
  const baseName = hasExtension ? safeFilename.slice(0, extensionIndex) : safeFilename;
  const extension = hasExtension ? safeFilename.slice(extensionIndex) : '';

  const counter = filenameCounters.get(safeFilename) ?? 0;
  filenameCounters.set(safeFilename, counter + 1);

  if (counter === 0) {
    return safeFilename;
  }

  return `${baseName}_${counter + 1}${extension}`;
}
