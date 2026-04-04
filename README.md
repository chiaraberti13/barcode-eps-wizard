# 📦 EPS Barcode Generator

> 🇬🇧 **English** | 🇮🇹 [Italiano](#-generatore-barcode-eps-italiano)

Standalone web app to generate EAN-13 barcodes in EPS format from Excel. No installation, works offline, bulk ZIP download. Perfect for Adobe Illustrator workflows.

---

## 🎯 COMPLETE PACKAGE

This package contains:
- **`barcode-eps-wizard.html`** - The complete web application
- **`app.js`** - Main application logic (UI state, parsing flow, generation pipeline)
- **`styles.css`** - Application styles and responsive layout
- **`example.xlsx`** - Sample Excel file with correct structure
- **`upgrade.md`** - Technical upgrade checklist and roadmap
- **`LICENSE`** - MIT License
- **`README.md`** - This documentation (English + Italian)

---

## ✅ INSTALLATION (NONE REQUIRED!)

This is a **completely standalone** web app. You don't need to install:
- ❌ Python, Node.js or other programming languages
- ❌ Libraries or dependencies
- ❌ Additional software

**Just open the HTML file in your browser!**

---

## 🧭 DEVELOPMENT CONVENTIONS

This repository includes an `.editorconfig` file to keep formatting consistent across editors and operating systems.

**Active standards:**
- UTF-8 encoding
- LF line endings
- Final newline required
- 2-space indentation for HTML/CSS/JS/JSON/YAML
- No trailing whitespace (except Markdown, where trailing spaces may be intentional)

**Naming conventions:**
- JavaScript: `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants
- CSS classes: `kebab-case`
- Files: `kebab-case` (except established filenames such as `README.md`)


## 🛠️ LOCAL QUALITY TOOLING (OPTIONAL FOR CONTRIBUTORS)

If you want repeatable quality checks during development, use Node.js 20+ and npm:

```bash
npm install
npm run lint
npm run format
npm run test
npm run test:e2e
npm run build-check
```

**Script meaning:**
- `npm run lint`: static checks + formatting gate for JavaScript, CSS and HTML
- `npm run format`: standalone formatting gate (LF, newline finale, trailing spaces, indentazione)
- `npm run test`: unit smoke checks for core project assumptions
- `npm run test:e2e`: end-to-end smoke check on core UI structure
- `npm run build-check`: aggregate command (`lint` + `test` + `test:e2e`) for CI/local gate

## 🚀 HOW TO USE IN 3 STEPS

### Step 1: Open the application
1. **Double-click** on `barcode-eps-wizard.html`
2. It will automatically open in your default browser
3. Works with: Chrome, Firefox, Safari, Edge

💡 **Note:** Internet connection is required on first load to fetch CDN libraries (SheetJS, JSZip, Lucide). After a successful load, offline usage depends on your browser cache policy.

### Step 2: Prepare your Excel file
Use `example.xlsx` as an example. The structure must be:

```
| Codice articolo | Barcode        |
|-----------------|----------------|
| CODE01          | 9090171029796  |
| CODE02          | 9090171029802  |
| CODE03          | 9090171029819  |
```

**Requirements:**
- Two required columns mapped robustly from the header: `Codice articolo` and `Barcode` (spacing and upper/lowercase variants are accepted)
- Barcodes must be **12-digit** numbers (EAN-13 without check digit) or **13-digit** (complete EAN-13)
- File format: `.xlsx` or `.xls` or `.csv`

### Step 3: Generate barcodes
1. **Drag** the Excel file into the upload area (or click to select it)
2. Click **"Genera Barcode EPS"** (Generate Barcode EPS)
3. Wait for completion (you'll see the progress bar)
4. Download files:
   - **Individually**: click "Scarica" (Download) on each barcode in the list
   - **Valid rows at once**: click "Scarica validi (ZIP)" to get a `.zip` file containing only valid EPS files

---

## 📊 TECHNICAL LIMITS

### Maximum number of barcodes

**Theoretical limit: ~10,000 barcodes**

The limit depends on:
- **Available RAM** - Each barcode takes ~5-10 KB in memory
- **Browser capacity** - Chrome/Firefox handle large quantities better
- **Operating system** - Desktop has more resources than mobile

**Practical recommendations:**
- ✅ **< 1,000 barcodes** - No problem, fast generation
- ⚠️ **1,000 - 5,000 barcodes** - Works well, may take 10-30 seconds
- ⚠️ **5,000 - 10,000 barcodes** - Possible, but requires time and lots of RAM
- ❌ **> 10,000 barcodes** - Not recommended, better to split into multiple files

### ZIP file

The generated ZIP file contains all compressed barcodes. Approximate size:
- 100 barcodes ≈ 0.5 MB
- 1,000 barcodes ≈ 5 MB  
- 5,000 barcodes ≈ 25 MB
- 10,000 barcodes ≈ 50 MB

**Note:** Browser may request confirmation to download ZIP files > 100 MB.

---

## 🎯 FEATURES

✅ **No installation** - just open the HTML file  
✅ **Works offline** - after first load  
✅ **Multi-platform** - Windows, Mac, Linux, Android, iOS  
✅ **True EPS files** - PostScript format compatible with Adobe Illustrator  
✅ **ZIP download** - all barcodes in a single compressed file  
✅ **Drag & Drop** - intuitive interface  
✅ **Real-time preview** - see barcodes as they're generated  
✅ **Live statistics** - total, successes, errors  
✅ **Responsive design** - adapts to desktop, tablet, smartphone  
✅ **Vector icons** - professional interface with Lucide Icons  
✅ **Blue color palette** - minimal and modern design  

---

## 💻 SYSTEM REQUIREMENTS

### Supported browsers
- ✅ Chrome 90+ (recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Operating system
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Debian, Fedora, etc.)
- ✅ Android 9+ (Chrome Mobile)
- ✅ iOS/iPadOS 14+ (Safari)

### Minimum resources
- **RAM:** 2 GB (4 GB recommended for > 1,000 barcodes)
- **Disk space:** 100 MB free for generated files
- **Internet connection:** Only for first load

---

## 🔧 TROUBLESHOOTING

### HTML file doesn't open in browser
**Solution:**
1. Right-click on `barcode-eps-wizard.html`
2. Select "Open with"
3. Choose your browser (Chrome recommended)

### Interface or export features don't work on first launch
**Cause:** CDN libraries not reachable (SheetJS, JSZip, Lucide).  
**Solution:**
1. Check your internet connection
2. Reload the page (F5 or Cmd+R)
3. If your network blocks CDNs, use another network or host libraries locally

### Error "Code must have 12 or 13 digits"
**Cause:** Invalid barcode in Excel file  
**Solution:**
1. Verify all barcodes have 12 or 13 digits
2. Remove spaces, dots or other characters
3. Make sure they're numbers only

### Browser crashes with many barcodes
**Cause:** Too many barcodes, insufficient memory  
**Solution:**
1. Split Excel file into parts (e.g., 2,000 barcodes per file)
2. Generate barcodes in multiple sessions
3. Close other browser tabs to free RAM
4. Use Chrome or Firefox for better performance

### EPS files don't open in Illustrator
**Solution:**
1. Files are in pure PostScript format
2. In Illustrator: File → Open
3. Select "All files" in filter
4. Files are 100% vector

### ZIP file is too large
**Solution:**
1. Browser download limit is ~2 GB
2. If you exceed this, generate barcodes in groups
3. Download files individually instead of ZIP

---

## 📁 GENERATED FILE STRUCTURE

Each barcode is saved as:
```
CODE01.eps
CODE02.eps
CODE03.eps
...
```

ZIP file is named:
```
barcode_eps_1234567890.zip
```
(where `1234567890` is a unique timestamp)

---

## 🎨 EPS FILE TECHNICAL SPECIFICATIONS

- **Format:** PostScript (EPS) version 3.0
- **Encoding:** EAN-13 standard (ISO/IEC 15420)
- **Check digit:** Automatically calculated according to Modulo 10 algorithm
- **Quiet zone:** 10 modules (GS1 General Specifications compliant)
- **Bar height:** 50 points (≈ 17.6 mm)
- **Module width:** 1 point (≈ 0.35 mm)
- **Font:** Helvetica 11pt
- **Colors:** 100% Black (K) on white
- **BoundingBox:** Automatically calculated
- **Compatibility:** Adobe Illustrator, CorelDRAW, Inkscape, Affinity Designer

---

## 🔒 PRIVACY AND SECURITY

✅ **All data stays on your computer**  
✅ **No files uploaded to external servers**  
✅ **No tracking or analytics**  
✅ **No account required**  
✅ **Open source** - you can inspect the code

The application processes files entirely in the local browser. No information is transmitted over the internet.

---

## 💾 SHARING

You can share the entire folder with colleagues:
1. Copy all files to a USB drive
2. Or share via email/WeTransfer/Google Drive
3. Recipients just need to open `barcode-eps-wizard.html`

**No installation required for recipients!**

---

## 📝 CHANGELOG

### Version 2.0 (Current)
- ✨ New minimal design inspired by Lucide
- ✨ Professional vector icons
- ✨ Blue color palette
- ✨ **ZIP download** for all barcodes
- ✨ Responsive interface for mobile
- ✨ Improved alerts with icons
- ✨ Progress bar with counter
- 🐛 Fixed bugs with Excel number formatting

### Version 1.0
- 🎉 First release
- ✅ EPS barcode generation
- ✅ Excel/CSV support
- ✅ Individual downloads

---

## 🆘 SUPPORT

For issues, questions or suggestions, please open an issue on GitHub.

---

## 📜 LICENSE

MIT License - see [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Chiara Berti 13

---

**EPS Barcode Generator v2.0 (Minimalist Edition)**  
By Chiara Berti - 2026

---
---

# 📦 Generatore Barcode EPS (Italiano)

> 🇬🇧 [English](#-eps-barcode-generator) | 🇮🇹 **Italiano**

Applicazione web standalone per generare barcode EAN-13 in formato EPS da Excel. Nessuna installazione, funziona offline, download ZIP massivo. Perfetto per flussi di lavoro Adobe Illustrator.

---

## 🎯 PACCHETTO COMPLETO

Questo pacchetto contiene:
- **`barcode-eps-wizard.html`** - L'applicazione web completa
- **`app.js`** - Logica principale applicativa (stati UI, parsing, pipeline generazione)
- **`styles.css`** - Stili applicativi e layout responsive
- **`example.xlsx`** - File Excel di esempio con la struttura corretta
- **`LICENSE`** - Licenza MIT
- **`README.md`** - Questa documentazione (Inglese + Italiano)

---

## ✅ INSTALLAZIONE (NESSUNA!)

Questa è una web app **completamente standalone**. Non devi installare:
- ❌ Python, Node.js o altri linguaggi di programmazione
- ❌ Librerie o dipendenze
- ❌ Software aggiuntivo

**Basta aprire il file HTML nel browser!**

---

## 🚀 COME USARE IN 3 PASSI

### Passo 1: Aprire l'applicazione
1. Fai **doppio click** sul file `barcode-eps-wizard.html`
2. Si aprirà automaticamente nel tuo browser predefinito
3. Funziona con: Chrome, Firefox, Safari, Edge

💡 **Nota:** Serve connessione internet solo per il primo caricamento (per scaricare librerie CDN: SheetJS, JSZip, Lucide). Dopo il primo avvio, l'uso offline dipende dalla cache del browser.

### Passo 2: Preparare il file Excel
Usa il file `example.xlsx` come esempio. La struttura deve essere:

```
| Codice articolo | Barcode        |
|-----------------|----------------|
| CODICE01        | 9090171029796  |
| CODICE02        | 9090171029802  |
| CODICE03        | 9090171029819  |
```

**Requisiti:**
- Due colonne obbligatorie riconosciute con mapping robusto: `Codice articolo` e `Barcode` (sono accettate varianti comuni di spazi e maiuscole/minuscole)
- I barcode devono essere numeri di **12 cifre** (EAN-13 senza check digit) o **13 cifre** (EAN-13 completo)
- Formato file: `.xlsx` o `.xls` o `.csv`

### Passo 3: Generare i barcode
1. **Trascina** il file Excel nell'area di caricamento (oppure clicca per selezionarlo)
2. Clicca su **"Genera Barcode EPS"**
3. Attendi il completamento (vedrai la barra di progresso)
4. Scarica i file:
   - **Singolarmente**: clicca "Scarica" su ogni barcode nella lista
   - **Validi in blocco**: clicca "Scarica validi (ZIP)" per ottenere un file `.zip` contenente solo gli EPS validi

---

## 📊 LIMITI TECNICI

### Numero massimo di barcode

**Limite teorico: ~10.000 barcode**

Il limite dipende da:
- **Memoria RAM disponibile** - Ogni barcode occupa ~5-10 KB in memoria
- **Capacità del browser** - Chrome/Firefox gestiscono meglio grandi quantità
- **Sistema operativo** - Desktop ha più risorse di mobile

**Consigli pratici:**
- ✅ **< 1.000 barcode** - Nessun problema, generazione veloce
- ⚠️ **1.000 - 5.000 barcode** - Funziona bene, potrebbe richiedere 10-30 secondi
- ⚠️ **5.000 - 10.000 barcode** - Possibile, ma richiede tempo e molta RAM
- ❌ **> 10.000 barcode** - Sconsigliato, meglio dividere in più file

### File ZIP

Il file ZIP generato contiene tutti i barcode compressi. Dimensione approssimativa:
- 100 barcode ≈ 0.5 MB
- 1.000 barcode ≈ 5 MB  
- 5.000 barcode ≈ 25 MB
- 10.000 barcode ≈ 50 MB

**Nota:** Il browser potrebbe richiedere conferma per scaricare file ZIP > 100 MB.

---

## 🎯 CARATTERISTICHE

✅ **Nessuna installazione** - basta aprire il file HTML  
✅ **Funziona offline** - dopo il primo caricamento  
✅ **Multi-piattaforma** - Windows, Mac, Linux, Android, iOS  
✅ **File EPS veri** - formato PostScript compatibile con Adobe Illustrator  
✅ **Download ZIP** - tutti i barcode in un unico file compresso  
✅ **Drag & Drop** - interfaccia intuitiva  
✅ **Anteprima in tempo reale** - vedi i barcode mentre vengono generati  
✅ **Statistiche live** - totale, successi, errori  
✅ **Design responsive** - si adatta a desktop, tablet, smartphone  
✅ **Icone vettoriali** - interfaccia professionale con Lucide Icons  
✅ **Palette azzurro/blu** - design minimale e moderno  

---

## 💻 REQUISITI SISTEMA

### Browser supportati
- ✅ Chrome 90+ (consigliato)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Sistema operativo
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Debian, Fedora, ecc.)
- ✅ Android 9+ (Chrome Mobile)
- ✅ iOS/iPadOS 14+ (Safari)

### Risorse minime
- **RAM:** 2 GB (4 GB consigliati per > 1.000 barcode)
- **Spazio disco:** 100 MB liberi per i file generati
- **Connessione internet:** Solo per il primo caricamento

---

## 🔧 RISOLUZIONE PROBLEMI

### Il file HTML non si apre nel browser
**Soluzione:**
1. Click destro su `barcode-eps-wizard.html`
2. Seleziona "Apri con"
3. Scegli il tuo browser (Chrome consigliato)

### Le icone non si vedono
**Causa:** Problema di connessione internet  
**Soluzione:**
1. Verifica la connessione
2. Ricarica la pagina (F5 o Cmd+R)
3. L'app funziona comunque anche senza icone

### Errore "Codice deve avere 12 o 13 cifre"
**Causa:** Il barcode nel file Excel non è valido  
**Soluzione:**
1. Verifica che tutti i barcode abbiano 12 o 13 cifre
2. Rimuovi spazi, punti o altri caratteri
3. Assicurati che siano solo numeri

### Il browser va in crash con molti barcode
**Causa:** Troppi barcode, memoria insufficiente  
**Soluzione:**
1. Dividi il file Excel in più parti (es: 2.000 barcode per file)
2. Genera i barcode in più sessioni
3. Chiudi altre schede del browser per liberare RAM
4. Usa Chrome o Firefox per prestazioni migliori

### I file EPS non si aprono in Illustrator
**Soluzione:**
1. I file sono in formato PostScript puro
2. In Illustrator: File → Apri
3. Seleziona "Tutti i file" nel filtro
4. I file sono vettoriali al 100%

### Il file ZIP è troppo grande
**Soluzione:**
1. Il limite di download del browser è ~2 GB
2. Se superi questo limite, genera i barcode in più gruppi
3. Scarica i file singolarmente invece dello ZIP

---

## 📁 STRUTTURA FILE GENERATI

Ogni barcode viene salvato come:
```
CODICE01.eps
CODICE02.eps
CODICE03.eps
...
```

Il file ZIP viene chiamato:
```
barcode_eps_1234567890.zip
```
(dove `1234567890` è un timestamp univoco)

---

## 🎨 SPECIFICHE TECNICHE FILE EPS

- **Formato:** PostScript (EPS) versione 3.0
- **Encoding:** EAN-13 standard (ISO/IEC 15420)
- **Check digit:** Calcolato automaticamente secondo algoritmo Modulo 10
- **Quiet zone:** 10 moduli (conforme GS1 General Specifications)
- **Altezza barre:** 50 punti (≈ 17.6 mm)
- **Larghezza modulo:** 1 punto (≈ 0.35 mm)
- **Font:** Helvetica 11pt
- **Colori:** Nero 100% (K) su bianco
- **BoundingBox:** Calcolato automaticamente
- **Compatibilità:** Adobe Illustrator, CorelDRAW, Inkscape, Affinity Designer

---

## 🔒 PRIVACY E SICUREZZA

✅ **Tutti i dati rimangono sul tuo computer**  
✅ **Nessun file viene caricato su server esterni**  
✅ **Nessun tracking o analytics**  
✅ **Nessun account richiesto**  
✅ **Open source** - puoi ispezionare il codice

L'applicazione elabora i file completamente nel browser locale. Nessuna informazione viene trasmessa su internet.

---

## 💾 CONDIVISIONE

Puoi condividere l'intera cartella con colleghi:
1. Copia tutti i file su una chiavetta USB
2. Oppure condividi via email/WeTransfer/Google Drive
3. Chi riceve deve solo aprire `barcode-eps-wizard.html`

**Nessuna installazione richiesta per chi riceve i file!**

---

## 📝 CHANGELOG

### Versione 2.0 (Attuale)
- ✨ Nuovo design minimale ispirato a Lucide
- ✨ Icone vettoriali professionali
- ✨ Palette azzurro/blu
- ✨ **Download ZIP** per tutti i barcode
- ✨ Interfaccia responsive per mobile
- ✨ Alert migliorati con icone
- ✨ Progress bar con conteggio
- 🐛 Corretti bug con Excel formattazione numeri

### Versione 1.0
- 🎉 Prima release
- ✅ Generazione barcode EPS
- ✅ Supporto Excel/CSV
- ✅ Download singoli

---

## 🆘 SUPPORTO

Per problemi, domande o suggerimenti, apri una issue su GitHub.

---

## 📜 LICENZA

Licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

Copyright (c) 2026 Chiara Berti 13

---

**Generatore Barcode EPS v2.0 (Minimalist Edition)**  
Di Chiara Berti 13 - 2026
