// Inizializza le icone Lucide
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

let currentData = [];
let generatedBarcodes = [];
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
const INVALID_FILENAME_CHARS_REGEX = /[<>:"/\\|?*\u0000-\u001f]/g;
const WINDOWS_RESERVED_NAMES = new Set([
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);
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
    barcodeSequence = 0;
    progressContainer.style.display = 'block';
    preview.style.display = 'block';
    preview.innerHTML = '';
    generateBtn.disabled = true;
    downloadAllBtn.style.display = 'none';

    let successCount = 0;
    let errorCount = 0;

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
            const barcodeId = `barcode-${barcodeSequence++}`;
            generatedBarcodes.push({
                id: barcodeId,
                filename: sanitizedFilename,
                content: epsContent,
                codiceArticolo,
                codiceBarcode: normalizedBarcode
            });

            addPreviewItem(codiceArticolo, normalizedBarcode, true, '', barcodeId);
            successCount++;
        } catch (error) {
            addPreviewItem(codiceArticolo, previewBarcode, false, error.message);
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

function calculateEAN13CheckDigit(code12) {
    let sumOdd = 0;
    let sumEven = 0;

    for (let i = 0; i < 12; i++) {
        if (i % 2 === 0) {
            sumOdd += parseInt(code12[i], 10);
        } else {
            sumEven += parseInt(code12[i], 10);
        }
    }

    const total = sumOdd + (sumEven * 3);
    const remainder = total % 10;
    return remainder === 0 ? 0 : 10 - remainder;
}

function normalizeBarcode(rawBarcode, rowNumber) {
    if (rawBarcode === null || rawBarcode === undefined || rawBarcode === '') {
        throw new Error(`Riga ${rowNumber}: barcode mancante.`);
    }

    const normalized = normalizeBarcodeInput(rawBarcode, rowNumber);

    if (normalized.length !== 12 && normalized.length !== 13) {
        throw new Error(`Riga ${rowNumber}: barcode deve avere 12 o 13 cifre (trovate ${normalized.length}).`);
    }

    if (normalized.length === 13) {
        const expectedCheckDigit = calculateEAN13CheckDigit(normalized.slice(0, 12));
        const providedCheckDigit = parseInt(normalized[12], 10);
        if (expectedCheckDigit !== providedCheckDigit) {
            throw new Error(`Riga ${rowNumber}: check digit non valido (atteso ${expectedCheckDigit}).`);
        }
        return normalized;
    }

    return `${normalized}${calculateEAN13CheckDigit(normalized)}`;
}

function normalizeBarcodeInput(rawBarcode, rowNumber) {
    if (typeof rawBarcode === 'number') {
        if (!Number.isFinite(rawBarcode) || !Number.isInteger(rawBarcode) || rawBarcode < 0) {
            throw new Error(`Riga ${rowNumber}: barcode numerico non valido.`);
        }
        return String(rawBarcode);
    }

    const rawValue = String(rawBarcode).trim();
    if (!rawValue) {
        throw new Error(`Riga ${rowNumber}: barcode vuoto.`);
    }

    const compactValue = rawValue.replace(/\s+/g, '');
    if (/^\d+$/.test(compactValue)) {
        return compactValue;
    }

    if (/^\d+\.0+$/.test(compactValue)) {
        return compactValue.split('.')[0];
    }

    throw new Error(`Riga ${rowNumber}: barcode contiene caratteri non numerici.`);
}

function sanitizeEpsFilename(codiceArticolo, rowNumber) {
    const sourceValue = String(codiceArticolo || '').trim();
    const normalizedValue = sourceValue
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '');

    let safeName = normalizedValue
        .replace(INVALID_FILENAME_CHARS_REGEX, '_')
        .replace(/\s+/g, '_')
        .replace(/[. ]+$/g, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');

    if (!safeName) {
        safeName = `articolo_riga_${rowNumber}`;
    }

    if (WINDOWS_RESERVED_NAMES.has(safeName.toUpperCase())) {
        safeName = `${safeName}_file`;
    }

    const maxLength = 120;
    if (safeName.length > maxLength) {
        safeName = safeName.slice(0, maxLength).replace(/[. ]+$/g, '');
    }

    return `${safeName}.eps`;
}

function encodeEAN13(code) {
    const L_codes = {
        '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101',
        '4': '0100011', '5': '0110001', '6': '0101111', '7': '0111011',
        '8': '0110111', '9': '0001011'
    };

    const G_codes = {
        '0': '0100111', '1': '0110011', '2': '0011011', '3': '0100001',
        '4': '0011101', '5': '0111001', '6': '0000101', '7': '0010001',
        '8': '0001001', '9': '0010111'
    };

    const R_codes = {
        '0': '1110010', '1': '1100110', '2': '1101100', '3': '1000010',
        '4': '1011100', '5': '1001110', '6': '1010000', '7': '1000100',
        '8': '1001000', '9': '1110100'
    };

    const firstDigitPatterns = [
        'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
        'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
    ];

    if (code.length === 12) {
        code = code + calculateEAN13CheckDigit(code);
    } else if (code.length !== 13) {
        throw new Error(`Codice deve avere 12 o 13 cifre, ha ${code.length}`);
    }

    const firstDigit = code[0];
    const pattern = firstDigitPatterns[parseInt(firstDigit)];

    let bars = '101'; // Start

    for (let i = 0; i < 6; i++) {
        const digit = code[i + 1];
        bars += pattern[i] === 'L' ? L_codes[digit] : G_codes[digit];
    }

    bars += '01010'; // Center

    for (let i = 0; i < 6; i++) {
        const digit = code[i + 7];
        bars += R_codes[digit];
    }

    bars += '101'; // End

    return bars;
}

function generateEPS(codiceBarcode, codiceArticolo) {
    const bars = encodeEAN13(codiceBarcode);
    const barWidth = 1.0;
    const barHeight = 50.0;
    const textHeight = 5.0;
    const quietZone = 10.0;

    const totalWidth = bars.length * barWidth + (2 * quietZone);
    const totalHeight = barHeight + textHeight + 6.0;

    let eps = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: Century Italia Barcode Generator
%%Title: ${codiceBarcode}
%%Pages: 0
%%BoundingBox: 0 0 ${Math.round(totalWidth)} ${Math.round(totalHeight)}
%%EndComments
/TL { setlinewidth moveto lineto stroke } bind def
/TC { moveto 0 360 arc 360 0 arcn fill } bind def
/TH { 0 setlinewidth moveto lineto lineto lineto lineto lineto closepath fill } bind def
/TB { 2 copy } bind def
/TR { newpath 4 1 roll exch moveto 1 index 0 rlineto 0 exch rlineto neg 0 rlineto closepath fill } bind def
/TE { pop pop } bind def
newpath
0.00 0.00 0.00 setrgbcolor
1.00 1.00 1.00 setrgbcolor
${totalHeight.toFixed(2)} 0.00 TB 0.00 ${totalWidth.toFixed(2)} TR
TE
0.00 0.00 0.00 setrgbcolor
`;

    // Disegna le barre
    let xPos = quietZone;
    eps += `${barHeight.toFixed(2)} ${(textHeight + 5.0).toFixed(2)} TB `;

    for (let i = 0; i < bars.length; i++) {
        if (bars[i] === '1') {
            eps += `${xPos.toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
            if (i < bars.length - 1) {
                eps += 'TB ';
            }
        }
        xPos += barWidth;
    }

    eps += 'TE\n';

    // Guard bars (più lunghe)
    eps += `0.00 0.00 0.00 setrgbcolor\n`;
    eps += `${textHeight.toFixed(2)} ${textHeight.toFixed(2)} TB `;

    eps += `${quietZone.toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
    eps += `TB ${(quietZone + barWidth * 2).toFixed(2)} ${barWidth.toFixed(2)} TR\n`;

    const centerX = quietZone + (bars.length / 2 * barWidth) - barWidth;
    eps += `TB ${centerX.toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
    eps += `TB ${(centerX + barWidth * 2).toFixed(2)} ${barWidth.toFixed(2)} TR\n`;

    const endX = quietZone + (bars.length - 3) * barWidth;
    eps += `TB ${endX.toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
    eps += `TB ${(endX + barWidth * 2).toFixed(2)} ${barWidth.toFixed(2)} TR\n`;
    eps += 'TE\n';

    // Testo
    eps += `0.00 0.00 0.00 setrgbcolor
matrix currentmatrix
/Helvetica findfont
11.00 scalefont setfont
`;

    // Prima cifra
    const firstDigitX = quietZone - 6.0;
    eps += ` 0 0 moveto ${firstDigitX.toFixed(2)} 1.50 translate 0.00 rotate 0 0 moveto
 (${codiceBarcode[0]}) stringwidth
pop
-2 div 0 rmoveto
 (${codiceBarcode[0]}) show
setmatrix
`;

    // Prime 6 cifre
    const leftText = codiceBarcode.substring(1, 7);
    const leftTextX = quietZone + (bars.length / 4 * barWidth);
    eps += `matrix currentmatrix
/Helvetica findfont
11.00 scalefont setfont
 0 0 moveto ${leftTextX.toFixed(2)} 1.50 translate 0.00 rotate 0 0 moveto
 (${leftText}) stringwidth
pop
-2 div 0 rmoveto
 (${leftText}) show
setmatrix
`;

    // Ultime 6 cifre
    const rightText = codiceBarcode.substring(7, 13);
    const rightTextX = quietZone + (3 * bars.length / 4 * barWidth);
    eps += `matrix currentmatrix
/Helvetica findfont
11.00 scalefont setfont
 0 0 moveto ${rightTextX.toFixed(2)} 1.50 translate 0.00 rotate 0 0 moveto
 (${rightText}) stringwidth
pop
-2 div 0 rmoveto
 (${rightText}) show
setmatrix

showpage
`;

    return eps;
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

window.downloadSingle = downloadSingle;

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'application/postscript' });
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
