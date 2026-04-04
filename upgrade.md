# Upgrade Checklist Operativa — Barcode EPS Wizard

## 1) Panoramica progetto

Web app **standalone in singolo file HTML** per generare barcode EAN-13 in formato EPS partendo da file Excel/CSV, con download singolo o bulk ZIP. L’app è pensata per uso operativo rapido (anche offline dopo primo caricamento librerie CDN) e integrazione con flussi grafici (Adobe Illustrator / DTP).

**Obiettivo finale:** rendere il progetto production-ready (affidabile, sicuro, manutenibile, testato), mantenendo la semplicità “apri file HTML e usa”.

**Stack rilevato (attuale):**
- Frontend: HTML + CSS + JavaScript vanilla (no framework).
- Parsing file tabellari: SheetJS (`xlsx.full.min.js`) via CDN.
- ZIP export: JSZip via CDN.
- Icone UI: Lucide via CDN.
- Nessun backend/server.

---

## 2) Stato attuale

### ✅ Già implementato
- UI base completa (upload, bottoni, progress bar, alert, lista preview).
- Upload file via click e drag&drop.
- Lettura foglio Excel/CSV (prima sheet).
- Pipeline di generazione EPS per EAN-13 (incluso check digit per input a 12 cifre).
- Download EPS singolo e download ZIP cumulativo.
- Statistiche base (totale / successi / errori).
- Layout responsive base (media query mobile).
- README molto dettagliato (uso, limiti, troubleshooting, specifiche).

### ⚠️ Parziale / da completare
- Validazione input incompleta (controlli su formato/barcode/campi non rigorosi).
- Gestione errori UX migliorabile (messaggi per riga, feedback persistente, stati vuoti).
- Robustezza nomi file non garantita (caratteri non validi nei nomi articolo).
- Accessibilità solo parziale (focus, ARIA, contrasti, annunci screen reader, tastiera).
- Coerenza documentale da verificare (README menziona nomi file diversi dal repo reale).
- Qualità EPS da validare con test comparativi su casi edge.

### ❌ Mancante
- Test automatici (unit/integration/e2e).
- Linting/formatting/static analysis.
- CI pipeline (build checks, test, quality gate).
- Hardening sicurezza strutturato (threat model, checklist OWASP, limiti input).
- Strategia performance misurata con benchmark ripetibile.
- Piano versionamento/release e changelog.
- Documentazione tecnica per contributori (architettura, convenzioni, debug).

---

## 3) Macro-aree di sviluppo

1. **Setup & Governance**
2. **Core Logica Barcode/EPS**
3. **Gestione dati input (Excel/CSV)**
4. **Frontend/UI componenti**
5. **UX & Accessibilità**
6. **Sicurezza & Hardening**
7. **Testing & QA automatizzata**
8. **Performance & Scalabilità client-side**
9. **Documentazione & Release**

---

## 4) Checklist operativa (CORE)

### A. Setup / Configurazione progetto

[ ] Definire struttura minima di progetto multi-file (separare HTML/CSS/JS senza cambiare feature)  
Descrizione: preparare baseline manutenibile mantenendo comportamento invariato.  
Done quando: file separati e caricati correttamente, app funzionante end-to-end come oggi.

[ ] Introdurre package manager e script standard (`lint`, `test`, `test:e2e`, `build-check`)  
Descrizione: aggiungere toolchain minima per qualità continua.  
Done quando: i comandi sono documentati ed eseguibili localmente.

[ ] Configurare linting/formatting (JS, HTML, CSS)  
Descrizione: imporre standard codice uniforme e prevenire errori banali.  
Done quando: lint e format passano senza warning bloccanti.

[ ] Aggiungere `.editorconfig` e convenzioni naming  
Descrizione: allineare indentazione, newline, encoding e naming file/funzioni.  
Done quando: regole visibili nel repo e rispettate dal codice.

### B. Backend logic (client-side core)

[ ] Estrarre la logica EAN-13 in modulo isolato testabile  
Descrizione: separare `calculateEAN13CheckDigit`, `encodeEAN13`, generator EPS dal DOM.  
Done quando: modulo puro richiamato dalla UI e coperto da unit test.

[ ] Formalizzare contratto input/output del generatore EPS  
Descrizione: definire precondizioni (cifre ammesse, lunghezza, caratteri) e output atteso.  
Done quando: documentazione tecnica e test su casi validi/non validi.

[ ] Gestire in modo deterministico i casi duplicati `Codice articolo`  
Descrizione: decidere policy (sovrascrivi/blocca/suffisso progressivo) e applicarla.  
Done quando: comportamento univoco e verificabile con test.

[ ] Sanificare nomi file EPS generati  
Descrizione: rimuovere o normalizzare caratteri non compatibili con filesystem.  
Done quando: nessun nome file invalido su Windows/macOS/Linux in test.

### C. Gestione dati (Excel/CSV)

[ ] Validare presenza colonne richieste con confronto robusto  
Descrizione: supportare varianti comuni (spazi, maiuscole/minuscole) con normalizzazione controllata.  
Done quando: file con header compatibili vengono accettati, gli altri rifiutati con errore chiaro.

[x] Validare barcode con regex e normalizzazione sicura  
Descrizione: accettare solo 12/13 cifre reali, prevenendo input sporco/ambiguo.  
Done quando: ogni riga invalida produce errore specifico e tracciabile.
Nota avanzamento: aggiunta validazione centralizzata con regex numerica, normalizzazione sicura (trim/spazi/rimozione suffisso .0), verifica check digit su EAN-13 e messaggi errore per riga in preview.

[ ] Introdurre report finale errori esportabile (CSV/JSON)  
Descrizione: permettere correzione batch delle righe fallite.  
Done quando: report scaricabile con indice riga, motivo, valore originale.

[ ] Definire limite configurabile numero righe processabili  
Descrizione: prevenire freeze browser con dataset eccessivi.  
Done quando: sopra soglia appare warning/blocco con motivazione.

### D. Frontend

[ ] Rifattorizzare UI in sezioni/stati espliciti (idle, file caricato, generazione, completato, errore)  
Descrizione: evitare transizioni implicite e bug di stato.  
Done quando: macchina a stati documentata e implementata.

[ ] Migliorare preview risultati con filtri (tutti/successi/errori)  
Descrizione: facilitare diagnosi su lotti grandi.  
Done quando: filtro attivo e conteggi coerenti.

[ ] Aggiungere azioni batch (download solo validi, reset sessione)  
Descrizione: rendere il flusso più rapido e meno ambiguo.  
Done quando: pulsanti disponibili e comportamento testato.

[ ] Allineare copy UI e naming file con documentazione  
Descrizione: eliminare mismatch tra README e file reali del repo.  
Done quando: README e UI non contengono riferimenti incoerenti.

### E. UX / UI

[ ] Definire user journey principali (nuovo utente, utente esperto, caso errore)  
Descrizione: mappare task reali e punti di frizione.  
Done quando: flussi documentati con step e decision point.

[ ] Aggiungere feedback progressivo più informativo  
Descrizione: mostrare tempo stimato, item corrente, stato completo.  
Done quando: utente capisce sempre “cosa sta succedendo”.

[ ] Ottimizzare microcopy errori e istruzioni upload  
Descrizione: messaggi orientati all’azione (causa + correzione).  
Done quando: ogni errore indica esattamente come risolvere.

[ ] Verificare responsive reale su breakpoint mobile/tablet/desktop  
Descrizione: controllare usabilità concreta, non solo adattamento layout.  
Done quando: checklist visuale completata su tutti i breakpoint previsti.

### F. Testing

[ ] Scrivere unit test per check digit/encoding EAN-13  
Descrizione: coprire casi standard, invalidi, edge numerici.  
Done quando: copertura logica core definita e green.

[ ] Scrivere unit test per generazione EPS  
Descrizione: verificare intestazioni EPS, bounding box, guard bars, testo cifre.  
Done quando: snapshot/asserzioni passano su dataset noto.

[ ] Scrivere test integrazione parsing file + pipeline generazione  
Descrizione: simulare file esempio e validare output atteso.  
Done quando: test riproduce flusso utente completo senza intervento manuale.

[ ] Scrivere e2e test UI (upload → generate → download)  
Descrizione: garantire comportamento funzionale in browser moderno.  
Done quando: suite e2e stabile e ripetibile in locale/CI.

### G. Performance

[ ] Introdurre processing a chunk configurabile  
Descrizione: ridurre blocchi UI su grandi volumi.  
Done quando: rendering resta responsivo con dataset ampi.

[ ] Misurare tempi/memoria per dataset benchmark (100, 1k, 5k record)  
Descrizione: creare baseline e target prestazionali.  
Done quando: tabella benchmark documentata con risultati riproducibili.

[ ] Ottimizzare rendering preview (virtualizzazione o append batch)  
Descrizione: evitare degrado DOM con molte righe.  
Done quando: scrolling e interazioni restano fluidi su 5k+ elementi.

### H. Documentazione / Release

[x] Correggere README rispetto ai nomi reali dei file nel repo  
Descrizione: allineare package description e quick-start ai file presenti.  
Done quando: un utente nuovo segue README senza ambiguità.
Nota avanzamento: aggiornato elenco file pacchetto e note dipendenze CDN per coerenza con repository e comportamento reale.

[ ] Aggiungere documentazione tecnica interna (architettura + decisioni)  
Descrizione: facilitare onboarding di nuovi sviluppatori/agenti.  
Done quando: esiste documento con moduli, flussi e responsabilità.

[ ] Aggiungere changelog e policy versioning  
Descrizione: tracciare evoluzione funzionale e fix.  
Done quando: ogni release include note verificabili.

[ ] Configurare CI con quality gate minimo  
Descrizione: bloccare merge se lint/test/e2e falliscono.  
Done quando: pipeline automatica attiva e documentata.

---

## 5) Sezione Sicurezza (OBBLIGATORIA)

[ ] Implementare validazione stretta di tutti gli input utente  
Descrizione: whitelist su estensioni file, colonne, barcode, nomi articolo.  
Done quando: input non conforme viene bloccato con errore esplicito.

[ ] Prevenire injection in output EPS (testo barcode/articolo)  
Descrizione: escaping/sanitizzazione dei caratteri prima della serializzazione PostScript.  
Done quando: payload malevoli non alterano la sintassi EPS.

[ ] Limitare dimensione file e numero record processabili  
Descrizione: mitigare DoS client-side e consumo memoria eccessivo.  
Done quando: soglie hard/soft presenti e testate.

[ ] Centralizzare gestione errori senza leak di dettagli sensibili  
Descrizione: distinguere errore tecnico interno da messaggio user-friendly.  
Done quando: UI non espone stack trace o dettagli inutili.

[ ] Definire policy dipendenze CDN e fallback offline sicuro  
Descrizione: pin versioni, verificare integrità (SRI), prevedere fallback locale.  
Done quando: librerie esterne controllate e aggiornabili in sicurezza.

[ ] Eseguire checklist OWASP Top 10 (contesto app client-side)  
Descrizione: valutare rischi pertinenti (injection, insecure design, dependency risks, data integrity).  
Done quando: report con rischio/mitigazione/stato per ogni voce rilevante.

[ ] Hardening browser-side (CSP, Referrer-Policy, X-Content-Type-Options via hosting)  
Descrizione: definire header consigliati per deployment web statico.  
Done quando: profilo header documentato e verificato in ambiente di test.

---

## 6) Sezione UX (OBBLIGATORIA)

[ ] Progettare onboarding in-page (istruzioni minime contestuali)  
Descrizione: guidare utente alla prima esecuzione senza leggere manuale lungo.  
Done quando: flow “upload → genera → scarica” è autoesplicativo.

[ ] Introdurre stati vuoti e stati errore dedicati  
Descrizione: evitare UI “silenziosa” quando non ci sono risultati o ci sono fallimenti totali.  
Done quando: ogni stato mostra call-to-action chiara.

[ ] Migliorare accessibilità tastiera e screen reader  
Descrizione: focus visibile, tab-order corretto, ARIA labels/live region sugli alert.  
Done quando: percorso completo eseguibile senza mouse.

[ ] Standardizzare componenti visuali (spaziature, tipografia, contrasti)  
Descrizione: rendere interfaccia coerente e leggibile in tutte le densità schermo.  
Done quando: design token/base style definiti e applicati.

[ ] Definire e validare feedback post-azione (download, errori, completamento)  
Descrizione: ridurre incertezza operativa durante lotti grandi.  
Done quando: ogni azione critica produce feedback immediato e persistente quanto basta.

---

## 7) Errori da correggere

[x] Correggere incoerenza naming file in documentazione (`barcode_generator.html` vs file reale)  
Descrizione: attualmente README e repository non risultano perfettamente allineati.  
Done quando: i nomi indicati in docs corrispondono ai file effettivi presenti.

[ ] Eliminare manipolazione fragile del barcode (`replace('.0', '')`)  
Descrizione: la pulizia corrente può produrre risultati inattesi su input anomali.  
Done quando: normalizzazione numerica esplicita e testata.

[ ] Gestire assenza colonne obbligatorie prima della generazione  
Descrizione: oggi la logica dipende da chiavi esatte in runtime.  
Done quando: blocco preventivo con messaggio di errore chiaro.

[ ] Evitare collisioni su `downloadSingle` con codici articolo duplicati  
Descrizione: ricerca per chiave non univoca può scaricare file errato.  
Done quando: identificatore univoco interno per ogni riga generata.

[ ] Migliorare robustezza rendering dinamico con `innerHTML`  
Descrizione: ridurre rischio di injection e bug HTML con contenuti non fidati.  
Done quando: rendering tramite nodi DOM/escaping centralizzato.

---

## Priorità di esecuzione consigliata

1. **Sicurezza input + stabilità core** (validazione, sanificazione filename, fix collisioni).  
2. **Rifattorizzazione moduli + test unit/integration**.  
3. **UX/accessibilità + miglioramenti stati UI**.  
4. **Performance su dataset grandi + benchmark**.  
5. **CI, documentazione tecnica, release process**.

---

## Criterio di completamento globale (Definition of Done progetto)

- Tutti i task checklist marcati completati con evidenza (commit/test/report).
- Nessun errore console nei flussi principali.
- Test automatici core + e2e green in CI.
- Validazione input robusta e copertura minima OWASP documentata.
- UX consistente su mobile/tablet/desktop, accessibilità tastiera verificata.
- README e documentazione tecnica completamente allineati al comportamento reale dell’app.


### Bug/failure pre-esistenti rilevati
- [ ] Possibile injection HTML/JS in preview/download: `codiceArticolo` viene interpolato in `innerHTML` e in `onclick` inline senza escaping (fuori scope del task corrente, da correggere con rendering DOM sicuro e listener non inline).
