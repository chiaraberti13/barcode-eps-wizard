import { generateEPS } from './core/ean13.mjs';
import { ensureUniqueFilename, normalizeBarcode, sanitizeEpsFilename } from './core/row-utils.mjs';
import { buildErrorReportCsv, buildErrorReportJson } from './core/error-report.mjs';

// Inizializza le icone Lucide
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

let currentData = [];
let generatedBarcodes = [];
let generationErrors = [];
let barcodeSequence = 0;
const REQUIRED_COLUMNS = {
    codiceArticolo: ['codicearticolo'],
    barcode: ['barcode']
};
const VALID_FILE_EXTENSIONS = new Set(['xlsx', 'xls', 'csv']);
const MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const SOFT_UPLOAD_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const MAX_PROCESSABLE_ROWS = 5000;
const SOFT_PROCESSABLE_ROWS = 3000;
const SAFE_USER_ERROR_PATTERNS = [
    /^Nessun file selezionato\./,
    /^Formato file non supportato\./,
    /^File troppo grande\./,
    /^Il file non contiene righe dati\./,
    /^Il file contiene \d+ righe\./,
    /^Colonna obbligatoria mancante:/,
    /^Riga \d+:/
];

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const generateBtn = document.getElementById('generateBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const downloadErrorsCsvBtn = document.getElementById('downloadErrorsCsvBtn');
const downloadErrorsJsonBtn = document.getElementById('downloadErrorsJsonBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const stats = document.getElementById('stats');
const preview = document.getElementById('preview');
const successAlert = document.getElementById('successAlert');
const warningAlert = document.getElementById('warningAlert');
const errorAlert = document.getElementById('errorAlert');

// Upload area events
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    try {
        validateSelectedFile(file);
    } catch (error) {
        handleError({
            context: 'FILE_VALIDATION',
            error,
            fallbackMessage: 'Il file selezionato non è valido. Controlla formato e dimensione e riprova.'
        });
        currentData = [];
        generateBtn.disabled = true;
        stats.style.display = 'none';
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            const preparedData = prepareDataRows(jsonData);
            const datasetWarnings = getDatasetWarnings(file, preparedData.length);

            currentData = preparedData;
            document.getElementById('totalCount').textContent = preparedData.length;
            generateBtn.disabled = false;
            stats.style.display = 'block';

            showAlert('success', `File caricato con successo! ${preparedData.length} righe trovate.`);
            if (datasetWarnings.length > 0) {
                showAlert('warning', datasetWarnings.join(' '), 9000);
            }
        } catch (error) {
            handleError({
                context: 'FILE_READ',
                error,
                fallbackMessage: 'Impossibile leggere il file. Verifica che contenga un foglio valido con le colonne richieste.'
            });
            currentData = [];
            generateBtn.disabled = true;
            stats.style.display = 'none';
        }
    };

    reader.readAsArrayBuffer(file);
}

function getDatasetWarnings(file, rowCount) {
    const warnings = [];
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);

    if (file.size >= SOFT_UPLOAD_FILE_SIZE_BYTES) {
        warnings.push(
            `File grande (${fileSizeMb}MB): la generazione potrebbe richiedere più tempo.`
        );
    }

    if (rowCount >= SOFT_PROCESSABLE_ROWS) {
        warnings.push(
            `Dataset esteso (${rowCount} righe): evita altre app aperte per ridurre rallentamenti.`
        );
    }

    return warnings;
}

generateBtn.addEventListener('click', generateBarcodes);

async function generateBarcodes() {
    if (currentData.length === 0) return;

    generatedBarcodes = [];
    generationErrors = [];
    barcodeSequence = 0;
    progressContainer.style.display = 'block';
    preview.style.display = 'block';
    preview.innerHTML = '';
    generateBtn.disabled = true;
    downloadAllBtn.style.display = 'none';
    downloadErrorsCsvBtn.style.display = 'none';
    downloadErrorsJsonBtn.style.display = 'none';

    let successCount = 0;
    let errorCount = 0;
    const filenameCounters = new Map();

    for (let i = 0; i < currentData.length; i++) {
        const item = currentData[i];
        const rowNumber = i + 2;
        const codiceArticolo = String(item.codiceArticolo || '').trim();
        const rawBarcode = item.barcode;
        const previewBarcode = rawBarcode === undefined || rawBarcode === null ? '' : String(rawBarcode).trim();

        try {
            const normalizedBarcode = normalizeBarcode(rawBarcode, rowNumber);
            const epsContent = generateEPS(normalizedBarcode, codiceArticolo);
            const sanitizedFilename = sanitizeEpsFilename(codiceArticolo, rowNumber);
            const uniqueFilename = ensureUniqueFilename(sanitizedFilename, filenameCounters);
            const barcodeId = `barcode-${barcodeSequence++}`;
            generatedBarcodes.push({
                id: barcodeId,
                filename: uniqueFilename,
                content: epsContent,
                codiceArticolo,
                codiceBarcode: normalizedBarcode
            });

            addPreviewItem(codiceArticolo, normalizedBarcode, true, '', barcodeId);
            successCount++;
        } catch (error) {
            addPreviewItem(codiceArticolo, previewBarcode, false, error.message);
            generationErrors.push({
                rowIndex: rowNumber,
                codiceArticolo,
                barcodeOriginale: previewBarcode,
                motivo: error.message
            });
            errorCount++;
        }

        const progress = ((i + 1) / currentData.length) * 100;
        progressFill.style.width = progress + '%';
        progressText.textContent = `${i + 1} / ${currentData.length}`;

        document.getElementById('successCount').textContent = successCount;
        document.getElementById('errorCount').textContent = errorCount;

        // Piccola pausa per non bloccare l'UI
        if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    generateBtn.disabled = false;
    downloadAllBtn.style.display = 'inline-flex';
    if (generationErrors.length > 0) {
        downloadErrorsCsvBtn.style.display = 'inline-flex';
        downloadErrorsJsonBtn.style.display = 'inline-flex';
    }
    showAlert('success', `Generazione completata! ${successCount} barcode generati con successo.`);
}

function normalizeColumnName(name) {
    return String(name || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toLowerCase();
}

function getFileExtension(filename) {
    const safeFilename = String(filename || '');
    const lastDotIndex = safeFilename.lastIndexOf('.');

    if (lastDotIndex === -1 || lastDotIndex === safeFilename.length - 1) {
        return '';
    }

    return safeFilename.slice(lastDotIndex + 1).toLowerCase();
}

function validateSelectedFile(file) {
    if (!file) {
        throw new Error('Nessun file selezionato.');
    }

    const extension = getFileExtension(file.name);
    if (!VALID_FILE_EXTENSIONS.has(extension)) {
        throw new Error('Formato file non supportato. Carica solo file .xlsx, .xls o .csv.');
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        const maxSizeMb = Math.round(MAX_UPLOAD_FILE_SIZE_BYTES / (1024 * 1024));
        throw new Error(`File troppo grande. Dimensione massima consentita: ${maxSizeMb}MB.`);
    }
}

function resolveRequiredColumns(headers) {
    const normalizedHeaders = new Map();

    headers.forEach((header) => {
        const normalized = normalizeColumnName(header);
        if (normalized) {
            normalizedHeaders.set(normalized, header);
        }
    });

    const resolvedColumns = {};

    for (const [field, acceptedNames] of Object.entries(REQUIRED_COLUMNS)) {
        const matchedNormalizedName = acceptedNames.find((candidate) => normalizedHeaders.has(candidate));

        if (!matchedNormalizedName) {
            throw new Error(`Colonna obbligatoria mancante: ${field === 'codiceArticolo' ? 'Codice articolo' : 'Barcode'}.`);
        }

        resolvedColumns[field] = normalizedHeaders.get(matchedNormalizedName);
    }

    return resolvedColumns;
}

function prepareDataRows(jsonData) {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('Il file non contiene righe dati.');
    }

    if (jsonData.length > MAX_PROCESSABLE_ROWS) {
        throw new Error(`Il file contiene ${jsonData.length} righe. Limite massimo supportato: ${MAX_PROCESSABLE_ROWS}.`);
    }

    const headers = Object.keys(jsonData[0] || {});
    const resolvedColumns = resolveRequiredColumns(headers);

    return jsonData.map((row) => ({
        codiceArticolo: row[resolvedColumns.codiceArticolo],
        barcode: row[resolvedColumns.barcode]
    }));
}

function addPreviewItem(codiceArticolo, codiceBarcode, success, errorMsg = '', barcodeId = '') {
    const item = document.createElement('div');
    item.className = 'preview-item';

    const statusContainer = document.createElement('div');
    statusContainer.className = 'preview-status';
    const statusIcon = document.createElement('i');
    statusIcon.setAttribute('data-lucide', success ? 'check-circle-2' : 'x-circle');
    statusIcon.setAttribute('size', '20');
    statusIcon.style.color = success ? '#22c55e' : '#dc2626';
    statusContainer.appendChild(statusIcon);

    const infoContainer = document.createElement('div');
    infoContainer.className = 'preview-info';

    const articleCodeElement = document.createElement('div');
    articleCodeElement.className = 'preview-code';
    articleCodeElement.textContent = String(codiceArticolo || '');
    infoContainer.appendChild(articleCodeElement);

    const barcodeElement = document.createElement('div');
    barcodeElement.className = 'preview-number';
    barcodeElement.textContent = String(codiceBarcode || '');
    infoContainer.appendChild(barcodeElement);

    if (!success && errorMsg) {
        const errorElement = document.createElement('div');
        errorElement.className = 'preview-error';
        errorElement.textContent = String(errorMsg);
        infoContainer.appendChild(errorElement);
    }

    item.appendChild(statusContainer);
    item.appendChild(infoContainer);

    if (success) {
        const downloadButton = document.createElement('button');
        downloadButton.className = 'btn btn-secondary';
        downloadButton.style.padding = '8px 16px';
        downloadButton.style.fontSize = '14px';
        downloadButton.type = 'button';

        const downloadIcon = document.createElement('i');
        downloadIcon.setAttribute('data-lucide', 'download');
        downloadIcon.setAttribute('size', '16');

        const buttonText = document.createTextNode(' Scarica');

        downloadButton.appendChild(downloadIcon);
        downloadButton.appendChild(buttonText);
        downloadButton.addEventListener('click', () => {
            downloadSingle(barcodeId);
        });

        item.appendChild(downloadButton);
    }

    preview.appendChild(item);
    lucide.createIcons(); // Re-render icons
}

function downloadSingle(barcodeId) {
    const barcode = generatedBarcodes.find(b => b.id === barcodeId);
    if (barcode) {
        downloadFile(barcode.filename, barcode.content);
    }
}

function downloadFile(filename, content, mimeType = 'application/postscript') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

downloadAllBtn.addEventListener('click', async () => {
    showAlert('success', 'Creazione file ZIP in corso...');

    try {
        // Crea un nuovo file ZIP
        const zip = new JSZip();

        // Aggiungi tutti i barcode allo ZIP
        for (const barcode of generatedBarcodes) {
            zip.file(barcode.filename, barcode.content);
        }

        // Genera il file ZIP
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });

        // Scarica il file ZIP
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `barcode_eps_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('success', `File ZIP creato con successo! ${generatedBarcodes.length} barcode inclusi.`);
    } catch (error) {
        handleError({
            context: 'ZIP_EXPORT',
            error,
            fallbackMessage: 'Errore durante la creazione del file ZIP. Riprova tra qualche secondo.'
        });
    }
});

downloadErrorsCsvBtn.addEventListener('click', () => {
    const csvContent = buildErrorReportCsv(generationErrors);
    downloadFile(
        `errori_barcode_${new Date().getTime()}.csv`,
        csvContent,
        'text/csv;charset=utf-8'
    );
    showAlert('success', `Report CSV errori scaricato (${generationErrors.length} righe).`);
});

downloadErrorsJsonBtn.addEventListener('click', () => {
    const jsonContent = buildErrorReportJson(generationErrors);
    downloadFile(
        `errori_barcode_${new Date().getTime()}.json`,
        jsonContent,
        'application/json;charset=utf-8'
    );
    showAlert('success', `Report JSON errori scaricato (${generationErrors.length} righe).`);
});

function showAlert(type, message, durationMs = 5000) {
    const alertConfig = {
        success: { alert: successAlert, textElement: document.getElementById('successText') },
        warning: { alert: warningAlert, textElement: document.getElementById('warningText') },
        error: { alert: errorAlert, textElement: document.getElementById('errorText') }
    };
    const selectedConfig = alertConfig[type] || alertConfig.error;
    const allAlerts = [successAlert, warningAlert, errorAlert];

    allAlerts.forEach((alertElement) => {
        alertElement.style.display = 'none';
    });

    const { alert, textElement } = selectedConfig;
    textElement.textContent = message;
    alert.style.display = 'flex';

    // Re-render icons
    lucide.createIcons();

    setTimeout(() => {
        alert.style.display = 'none';
    }, durationMs);
}

function isSafeUserErrorMessage(message) {
    return SAFE_USER_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

function getUserSafeErrorMessage(error, fallbackMessage) {
    if (error instanceof Error && typeof error.message === 'string') {
        const trimmedMessage = error.message.trim();
        if (trimmedMessage && isSafeUserErrorMessage(trimmedMessage)) {
            return trimmedMessage;
        }
    }

    return fallbackMessage;
}

function handleError({ context, error, fallbackMessage }) {
    console.error(`[${context}]`, error);
    showAlert('error', getUserSafeErrorMessage(error, fallbackMessage));
}
