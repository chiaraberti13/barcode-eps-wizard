import { generateEPS } from './core/ean13.mjs';
import {
    ensureUniqueFilename,
    normalizeArticleCode,
    normalizeBarcode,
    sanitizeEpsFilename
} from './core/row-utils.mjs';
import { buildErrorReportCsv, buildErrorReportJson } from './core/error-report.mjs';
import { buildProgressFeedback } from './core/progress-feedback.mjs';
import { prepareDataRows } from './core/data-rows.mjs';
import {
    PREVIEW_FILTERS,
    getFilteredPreviewEntries,
    getPreviewFilterCounts,
    normalizePreviewFilter
} from './core/preview-filter.mjs';

// Inizializza le icone Lucide
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

let currentData = [];
let generatedBarcodes = [];
let generationErrors = [];
let previewEntries = [];
let barcodeSequence = 0;
let currentPreviewFilter = PREVIEW_FILTERS.ALL;
let generationStartedAt = 0;
const APP_STATES = Object.freeze({
    IDLE: 'idle',
    FILE_READY: 'file_ready',
    GENERATING: 'generating',
    COMPLETED: 'completed',
    ERROR: 'error'
});
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
    /^Riga \d+: codice articolo /,
    /^Riga \d+:/
];
const REQUIRED_COLUMN_LABELS = Object.freeze({
    codiceArticolo: 'Codice articolo',
    barcode: 'Barcode'
});
const UPLOAD_INSTRUCTIONS = Object.freeze({
    supportedFormats: 'Formati supportati: .xlsx, .xls, .csv.',
    expectedColumns: 'Colonne obbligatorie: Codice articolo e Barcode (intestazioni non sensibili a maiuscole/spazi).',
    correctionHint: 'Correggi il file e ricaricalo per abilitare la generazione.'
});

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const generateBtn = document.getElementById('generateBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const downloadErrorsCsvBtn = document.getElementById('downloadErrorsCsvBtn');
const downloadErrorsJsonBtn = document.getElementById('downloadErrorsJsonBtn');
const resetSessionBtn = document.getElementById('resetSessionBtn');
const previewFilters = document.getElementById('previewFilters');
const previewFilterAllBtn = document.getElementById('previewFilterAllBtn');
const previewFilterSuccessBtn = document.getElementById('previewFilterSuccessBtn');
const previewFilterErrorBtn = document.getElementById('previewFilterErrorBtn');
const previewFilterAllCount = document.getElementById('previewFilterAllCount');
const previewFilterSuccessCount = document.getElementById('previewFilterSuccessCount');
const previewFilterErrorCount = document.getElementById('previewFilterErrorCount');
const previewEmptyState = document.getElementById('previewEmptyState');
const previewEmptyStateText = document.getElementById('previewEmptyStateText');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressMeta = document.getElementById('progressMeta');
const stats = document.getElementById('stats');
const preview = document.getElementById('preview');
const successAlert = document.getElementById('successAlert');
const warningAlert = document.getElementById('warningAlert');
const errorAlert = document.getElementById('errorAlert');

function toggleElementDisplay(element, shouldShow, displayMode = 'block') {
    element.style.display = shouldShow ? displayMode : 'none';
}

function setUiState(nextState) {
    const hasRows = currentData.length > 0;
    const hasGeneratedItems = generatedBarcodes.length > 0;
    const hasErrors = generationErrors.length > 0;
    const hasPreviewEntries = previewEntries.length > 0;

    switch (nextState) {
    case APP_STATES.IDLE:
        toggleElementDisplay(stats, false);
        toggleElementDisplay(progressContainer, false);
        toggleElementDisplay(preview, false);
        toggleElementDisplay(previewFilters, false);
        toggleElementDisplay(downloadAllBtn, false);
        toggleElementDisplay(downloadErrorsCsvBtn, false);
        toggleElementDisplay(downloadErrorsJsonBtn, false);
        toggleElementDisplay(resetSessionBtn, false);
        generateBtn.disabled = true;
        setPreviewEmptyStateMessage('Carica un file per vedere i risultati della generazione.');
        break;
    case APP_STATES.FILE_READY:
        toggleElementDisplay(stats, true, 'block');
        toggleElementDisplay(progressContainer, false);
        toggleElementDisplay(preview, false);
        toggleElementDisplay(previewFilters, false);
        toggleElementDisplay(downloadAllBtn, false);
        toggleElementDisplay(downloadErrorsCsvBtn, false);
        toggleElementDisplay(downloadErrorsJsonBtn, false);
        toggleElementDisplay(resetSessionBtn, true, 'inline-flex');
        generateBtn.disabled = !hasRows;
        setPreviewEmptyStateMessage('File pronto. Premi “Genera Barcode EPS” per avviare la lavorazione.');
        break;
    case APP_STATES.GENERATING:
        toggleElementDisplay(stats, true, 'block');
        toggleElementDisplay(progressContainer, true, 'block');
        toggleElementDisplay(preview, true, 'block');
        toggleElementDisplay(previewFilters, hasPreviewEntries, 'flex');
        toggleElementDisplay(downloadAllBtn, false);
        toggleElementDisplay(downloadErrorsCsvBtn, false);
        toggleElementDisplay(downloadErrorsJsonBtn, false);
        toggleElementDisplay(resetSessionBtn, true, 'inline-flex');
        generateBtn.disabled = true;
        setPreviewEmptyStateMessage('Generazione in corso: i risultati appariranno in questa sezione.');
        break;
    case APP_STATES.COMPLETED:
        toggleElementDisplay(stats, true, 'block');
        toggleElementDisplay(progressContainer, true, 'block');
        toggleElementDisplay(preview, true, 'block');
        toggleElementDisplay(previewFilters, hasPreviewEntries, 'flex');
        toggleElementDisplay(downloadAllBtn, hasGeneratedItems, 'inline-flex');
        toggleElementDisplay(downloadErrorsCsvBtn, hasErrors, 'inline-flex');
        toggleElementDisplay(downloadErrorsJsonBtn, hasErrors, 'inline-flex');
        toggleElementDisplay(resetSessionBtn, true, 'inline-flex');
        generateBtn.disabled = !hasRows;
        if (hasGeneratedItems || hasErrors) {
            setPreviewEmptyStateMessage('');
        } else {
            setPreviewEmptyStateMessage('Nessun risultato disponibile. Verifica i dati e riprova.');
        }
        break;
    case APP_STATES.ERROR:
        toggleElementDisplay(progressContainer, false);
        toggleElementDisplay(downloadAllBtn, false);
        toggleElementDisplay(downloadErrorsCsvBtn, false);
        toggleElementDisplay(downloadErrorsJsonBtn, false);
        toggleElementDisplay(resetSessionBtn, hasRows || hasGeneratedItems || hasErrors, 'inline-flex');
        toggleElementDisplay(preview, hasGeneratedItems || hasErrors, 'block');
        toggleElementDisplay(previewFilters, hasPreviewEntries, 'flex');
        toggleElementDisplay(stats, hasRows, 'block');
        generateBtn.disabled = !hasRows;
        setPreviewEmptyStateMessage('Si è verificato un errore. Correggi il file e riprova.');
        break;
    default:
        throw new Error(`Stato UI non supportato: ${nextState}`);
    }

    renderPreviewEmptyState(nextState);
}

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
            fallbackMessage: `Il file selezionato non è valido. ${UPLOAD_INSTRUCTIONS.supportedFormats} ${UPLOAD_INSTRUCTIONS.correctionHint}`
        });
        currentData = [];
        setUiState(APP_STATES.ERROR);
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            const preparedData = prepareDataRows(jsonData, {
                maxProcessableRows: MAX_PROCESSABLE_ROWS,
                requiredColumns: REQUIRED_COLUMNS,
                requiredColumnLabels: REQUIRED_COLUMN_LABELS,
                expectedColumnsMessage: `${UPLOAD_INSTRUCTIONS.expectedColumns} ${UPLOAD_INSTRUCTIONS.correctionHint}`
            });
            const datasetWarnings = getDatasetWarnings(file, preparedData.length);

            currentData = preparedData;
            document.getElementById('totalCount').textContent = preparedData.length;
            document.getElementById('successCount').textContent = 0;
            document.getElementById('errorCount').textContent = 0;
            preview.innerHTML = '';
            updateProgressUi({
                currentIndex: 0,
                totalItems: preparedData.length,
                currentArticleCode: '',
                startedAt: Date.now()
            });
            setUiState(APP_STATES.FILE_READY);

            showAlert('success', `File caricato con successo: ${preparedData.length} righe pronte. Controlla l'anteprima e avvia la generazione.`);
            if (datasetWarnings.length > 0) {
                showAlert('warning', datasetWarnings.join(' '), 9000);
            }
        } catch (error) {
            handleError({
                context: 'FILE_READ',
                error,
                fallbackMessage: `Impossibile leggere il file. ${UPLOAD_INSTRUCTIONS.supportedFormats} ${UPLOAD_INSTRUCTIONS.expectedColumns}`
            });
            currentData = [];
            setUiState(APP_STATES.ERROR);
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

function validateSelectedFile(file) {
    if (!file) {
        throw new Error('Nessun file selezionato.');
    }

    const fileName = String(file.name || '').trim();
    const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';

    if (!VALID_FILE_EXTENSIONS.has(extension)) {
        throw new Error(`Formato file non supportato. ${UPLOAD_INSTRUCTIONS.supportedFormats}`);
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        const maxSizeMb = (MAX_UPLOAD_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
        throw new Error(`File troppo grande. Dimensione massima consentita: ${maxSizeMb}MB.`);
    }
}

generateBtn.addEventListener('click', generateBarcodes);
previewFilterAllBtn.addEventListener('click', () => {
    setPreviewFilter(PREVIEW_FILTERS.ALL);
});
previewFilterSuccessBtn.addEventListener('click', () => {
    setPreviewFilter(PREVIEW_FILTERS.SUCCESS);
});
previewFilterErrorBtn.addEventListener('click', () => {
    setPreviewFilter(PREVIEW_FILTERS.ERROR);
});

async function generateBarcodes() {
    if (currentData.length === 0) return;

    generationStartedAt = Date.now();
    generatedBarcodes = [];
    generationErrors = [];
    previewEntries = [];
    barcodeSequence = 0;
    currentPreviewFilter = PREVIEW_FILTERS.ALL;
    preview.innerHTML = '';
    updateProgressUi({
        currentIndex: 0,
        totalItems: currentData.length,
        currentArticleCode: '',
        startedAt: generationStartedAt
    });
    setUiState(APP_STATES.GENERATING);

    let successCount = 0;
    let errorCount = 0;
    const filenameCounters = new Map();

    for (let i = 0; i < currentData.length; i++) {
        const item = currentData[i];
        const rowNumber = i + 2;
        let codiceArticolo = String(item.codiceArticolo || '').trim();
        const rawBarcode = item.barcode;
        const previewBarcode = rawBarcode === undefined || rawBarcode === null ? '' : String(rawBarcode).trim();

        try {
            codiceArticolo = normalizeArticleCode(item.codiceArticolo, rowNumber);
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

            addPreviewEntry({
                codiceArticolo,
                codiceBarcode: normalizedBarcode,
                success: true,
                errorMsg: '',
                barcodeId
            });
            successCount++;
        } catch (error) {
            addPreviewEntry({
                codiceArticolo,
                codiceBarcode: previewBarcode,
                success: false,
                errorMsg: error.message,
                barcodeId: ''
            });
            generationErrors.push({
                rowIndex: rowNumber,
                codiceArticolo,
                barcodeOriginale: previewBarcode,
                motivo: error.message
            });
            errorCount++;
        }

        updateProgressUi({
            currentIndex: i + 1,
            totalItems: currentData.length,
            currentArticleCode: codiceArticolo,
            startedAt: generationStartedAt
        });

        document.getElementById('successCount').textContent = successCount;
        document.getElementById('errorCount').textContent = errorCount;

        // Piccola pausa per non bloccare l'UI
        if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    setUiState(APP_STATES.COMPLETED);
    showAlert('success', `Generazione completata! ${successCount} barcode generati con successo.`);
}

function setPreviewFilter(nextFilter) {
    currentPreviewFilter = normalizePreviewFilter(nextFilter);
    renderPreview();
}

function addPreviewEntry(entry) {
    previewEntries.push(entry);
    renderPreview();
}

function renderPreview() {
    const filteredEntries = getFilteredPreviewEntries(previewEntries, currentPreviewFilter);

    preview.innerHTML = '';
    filteredEntries.forEach((entry) => {
        const item = createPreviewItem(entry);
        preview.appendChild(item);
    });

    updatePreviewFilterCounts();
    updatePreviewFilterButtons();
    renderPreviewEmptyState();
    lucide.createIcons();
}

function setPreviewEmptyStateMessage(message) {
    previewEmptyStateText.textContent = message;
}

function renderPreviewEmptyState(currentState = APP_STATES.IDLE) {
    const filteredEntries = getFilteredPreviewEntries(previewEntries, currentPreviewFilter);
    const shouldShow = filteredEntries.length === 0;
    toggleElementDisplay(previewEmptyState, shouldShow, 'flex');

    if (!shouldShow) {
        return;
    }

    if (previewEntries.length > 0 && currentPreviewFilter !== PREVIEW_FILTERS.ALL) {
        const filterLabels = {
            [PREVIEW_FILTERS.SUCCESS]: 'successi',
            [PREVIEW_FILTERS.ERROR]: 'errori'
        };
        const selectedFilterLabel = filterLabels[currentPreviewFilter] || 'risultati';
        setPreviewEmptyStateMessage(`Nessun ${selectedFilterLabel} con il filtro selezionato.`);
        return;
    }

    if (currentState === APP_STATES.COMPLETED && previewEntries.length === 0) {
        setPreviewEmptyStateMessage('Nessun risultato disponibile. Verifica i dati e riprova.');
    }
}

function updatePreviewFilterCounts() {
    const counts = getPreviewFilterCounts(previewEntries);

    previewFilterAllCount.textContent = String(counts.all);
    previewFilterSuccessCount.textContent = String(counts.success);
    previewFilterErrorCount.textContent = String(counts.error);
}

function updatePreviewFilterButtons() {
    const filters = [
        { value: PREVIEW_FILTERS.ALL, element: previewFilterAllBtn },
        { value: PREVIEW_FILTERS.SUCCESS, element: previewFilterSuccessBtn },
        { value: PREVIEW_FILTERS.ERROR, element: previewFilterErrorBtn }
    ];

    filters.forEach(({ value, element }) => {
        const isActive = value === currentPreviewFilter;
        element.classList.toggle('is-active', isActive);
        element.setAttribute('aria-pressed', String(isActive));
    });
}

function createPreviewItem({ codiceArticolo, codiceBarcode, success, errorMsg = '', barcodeId = '' }) {
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

    return item;
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
resetSessionBtn.addEventListener('click', resetSession);

function resetSession() {
    currentData = [];
    generatedBarcodes = [];
    generationErrors = [];
    previewEntries = [];
    barcodeSequence = 0;
    currentPreviewFilter = PREVIEW_FILTERS.ALL;

    fileInput.value = '';
    document.getElementById('totalCount').textContent = 0;
    document.getElementById('successCount').textContent = 0;
    document.getElementById('errorCount').textContent = 0;

    preview.innerHTML = '';
    updateProgressUi({
        currentIndex: 0,
        totalItems: 0,
        currentArticleCode: '',
        startedAt: Date.now()
    });

    showAlert('success', 'Sessione resettata. Carica un nuovo file per iniziare.');
    setUiState(APP_STATES.IDLE);
    updatePreviewFilterCounts();
    updatePreviewFilterButtons();
}

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

function updateProgressUi({ currentIndex, totalItems, currentArticleCode, startedAt }) {
    const progressFeedback = buildProgressFeedback({
        currentIndex,
        totalItems,
        currentArticleCode,
        startedAt
    });

    progressFill.style.width = `${progressFeedback.percentage}%`;
    progressText.textContent = progressFeedback.completedLabel;
    progressMeta.textContent = `${progressFeedback.detailLabel} · ${progressFeedback.etaLabel}`;
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
    setUiState(APP_STATES.ERROR);
    showAlert('error', getUserSafeErrorMessage(error, fallbackMessage));
}

setUiState(APP_STATES.IDLE);
