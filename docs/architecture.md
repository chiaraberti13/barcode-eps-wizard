# Architettura tecnica — Barcode EPS Wizard

## Obiettivo
Documentare i moduli, i flussi e le decisioni architetturali per facilitare onboarding, manutenzione e sviluppo incrementale senza regressioni.

## Panoramica ad alto livello
L'applicazione è una web app client-side standalone: il browser gestisce upload, parsing, validazione, generazione EPS e download. Non è previsto alcun backend.

```text
Utente -> UI (HTML/CSS/app.js)
           -> Parsing SheetJS (XLSX/CSV)
           -> Normalizzazione/validazione righe (core/data-rows.mjs + core/row-utils.mjs)
           -> Generazione EPS EAN-13 (core/ean13.mjs)
           -> Rendering preview e stato UI (app.js + core/preview-filter.mjs + core/progress-feedback.mjs)
           -> Download file singoli / ZIP (JSZip)
           -> Report errori (core/error-report.mjs)
```

## Struttura moduli

### Entry point UI
- `barcode-eps-wizard.html`: struttura pagina e mount point dei componenti UI.
- `styles.css`: design system base, layout responsive, stati visuali.
- `app.js`: orchestratore di stato e interazioni utente.

Responsabilità principali di `app.js`:
1. Gestione stato applicazione (`idle`, `file_ready`, `generating`, `completed`, `error`).
2. Wiring eventi UI (upload, drag&drop, generate, download, filtri preview, reset).
3. Coordinamento pipeline: file -> righe normalizzate -> EPS -> download/report.
4. Gestione errori centralizzata user-facing (`handleError`) con messaggi sanitizzati.

### Core domain modules
- `core/ean13.mjs`
  - Calcolo check digit EAN-13.
  - Normalizzazione input barcode (12/13 cifre).
  - Encoding barre.
  - Serializzazione EPS con escaping sicuro dei literal PostScript.
- `core/data-rows.mjs`
  - Validazione e preparazione dataset da SheetJS.
  - Verifica colonne richieste con mapping robusto.
  - Rifiuto dataset vuoti o oltre soglia.
- `core/row-utils.mjs`
  - Normalizzazione barcode input sporchi (incluse varianti da Excel).
  - Sanitizzazione filename cross-platform.
  - De-duplicazione filename con suffisso progressivo deterministico.
- `core/preview-filter.mjs`
  - Filtri preview (`all`, `success`, `error`) e conteggi coerenti.
- `core/progress-feedback.mjs`
  - Meta-informazioni progresso (indice corrente, totale, ETA).
- `core/error-report.mjs`
  - Generazione report errori scaricabili in CSV/JSON.

## Flussi applicativi

### 1) Upload e validazione iniziale
1. L'utente carica file via click o drag&drop.
2. `validateSelectedFile` applica whitelist estensioni e limiti dimensione.
3. SheetJS converte la prima sheet in JSON.
4. `prepareDataRows` verifica header obbligatori e prepara righe canonicali.
5. UI passa in stato `file_ready` con contatori aggiornati.

### 2) Generazione batch
1. Click su "Genera barcode".
2. Loop righe con progressivo aggiornamento stato/progress/preview.
3. Per ogni riga:
   - `normalizeBarcode`
   - `generateEPS`
   - sanitizzazione e de-duplicazione filename
4. Errori per-riga raccolti in `generationErrors` senza bloccare il batch.
5. A fine ciclo: stato `completed`, abilitazione download validi + report errori.

### 3) Download e report
- Download singolo: EPS della riga selezionata.
- Download bulk: ZIP dei soli validi via JSZip.
- Download errori: CSV/JSON con indice riga, articolo, valore originale, motivo.

## Decisioni architetturali rilevanti

1. **Core logico separato dalla UI**
   - Motivazione: testabilità e riduzione regressioni.
   - Impatto: moduli `core/*` unit-testati senza DOM.

2. **State machine UI esplicita**
   - Motivazione: evitare transizioni implicite e bug visivi.
   - Impatto: visibilità/disponibilità controlli determinata da stato unico.

3. **Validazione e normalizzazione conservative (fail-safe)**
   - Motivazione: sicurezza e robustezza dati eterogenei Excel/CSV.
   - Impatto: input ambiguo rifiutato con errore azionabile.

4. **Errore utente separato da errore tecnico**
   - Motivazione: non esporre dettagli sensibili e mantenere UX chiara.
   - Impatto: messaggi user-friendly + log tecnico in console.

5. **Standalone senza backend**
   - Motivazione: deployment semplice e uso offline-first.
   - Trade-off: hardening applicato lato input/UI; header di sicurezza demandati all'hosting statico.

## Convenzioni operative per contributori

### A) Aggiunta nuova logica core
- Implementare in `core/` come funzione pura (senza accesso DOM).
- Coprire con unit test dedicato in `tests/unit`.
- Collegare a `app.js` solo dopo test green.

### B) Modifica UI
- Aggiornare macchina a stati e visibilità controlli in `setUiState`.
- Garantire copy orientato all'azione e fallback errore.
- Aggiornare smoke/e2e se cambia un identificatore UI o flusso chiave.

### C) Sicurezza
- Non usare `innerHTML` con dati non fidati.
- Applicare sanitizzazione/escaping prima di serializzare output testuale (EPS/filename/report).
- Preservare limiti hard/soft su dimensione file e numero righe.

## Debug rapido

1. `npm run lint` per controlli statici.
2. `npm test` per unit/integration core.
3. `npm run test:e2e` per smoke UI.
4. In caso di errore runtime, ispezionare console e verificare transizione stato UI corrente.

## Limiti noti e roadmap tecnica
- Suite e2e attuale è smoke (DOM statico) e va evoluta verso browser automation reale.
- Mancano benchmark performance formalizzati (100/1k/5k righe).
- Mancano CI con quality gate automatico e policy versioning/changelog strutturata.
