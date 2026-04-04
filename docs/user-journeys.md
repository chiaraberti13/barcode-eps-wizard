# User Journeys — Barcode EPS Wizard

Questo documento formalizza i flussi principali per ridurre attriti UX e rendere verificabile il comportamento dell'app in scenari reali.

## Journey 1 — Nuovo utente (first run)

### Obiettivo
Generare un primo lotto EPS senza conoscenza pregressa del formato input.

### Step e decision point
1. **Atterraggio su pagina**
   - L'utente vede area upload, istruzioni sintetiche e CTA primaria.
   - **Decision point:** capisce il formato richiesto?
     - Sì → procede al caricamento file.
     - No → apre README / tooltip formato colonne (`Codice articolo`, `Barcode`).
2. **Upload file Excel/CSV**
   - Drag&drop o click su selettore file.
   - Validazioni immediate: tipo file, dimensione, presenza colonne richieste.
   - **Decision point:** validazione upload superata?
     - Sì → stato `file_ready`.
     - No → stato `error` con messaggio azionabile.
3. **Generazione batch**
   - Avvio con pulsante `Genera EPS`.
   - Progress bar + contatori successi/errori in tempo reale.
   - **Decision point:** ci sono righe invalide?
     - No → completamento con download ZIP validi.
     - Sì → completamento con doppia azione: `Scarica validi (ZIP)` + report errori (CSV/JSON).
4. **Uscita o reset**
   - L'utente scarica output e può fare `Reset sessione` per un nuovo file.

### Frizioni UX rilevate
- Per utenti non tecnici, la distinzione tra errori bloccanti upload e errori per-riga va resa sempre esplicita nei messaggi.

---

## Journey 2 — Utente esperto (operativo batch)

### Obiettivo
Processare rapidamente lotti multipli minimizzando tempi morti.

### Step e decision point
1. **Carica dataset già conforme**
   - Si aspetta passaggio immediato a `file_ready`.
2. **Lancia generazione**
   - Monitora solo indicatori quantitativi e tempi.
   - **Decision point:** errore globale (es. parsing) o solo errori dati?
     - Errore globale → corregge file sorgente e ricarica.
     - Errori dati → scarica subito ZIP validi, rimanda fix ai report errori.
3. **Diagnostica rapida**
   - Usa filtri preview (`Tutti`, `Successi`, `Errori`) per campionamento.
4. **Iterazione batch**
   - `Reset sessione` e nuovo upload senza ricaricare la pagina.

### Frizioni UX rilevate
- Mancano ETA e tempo medio per record: utile aggiungere feedback progressivo per lotti grandi.

---

## Journey 3 — Caso errore (data quality / input non valido)

### Obiettivo
Capire rapidamente causa errore e azione correttiva, evitando blocchi operativi.

### Step e decision point
1. **Errore in upload (file/colonne/limiti)**
   - L'app blocca il flusso prima della generazione con messaggio specifico.
   - **Decision point:** problema correggibile subito?
     - Sì → utente corregge file e ricarica.
     - No → utente segnala issue con dettaglio errore.
2. **Errore su righe durante la generazione**
   - Flusso non si interrompe: vengono processate le righe valide.
   - **Decision point:** percentuale errori accettabile?
     - Sì → procede con ZIP validi e backlog correzioni.
     - No → scarica report errori, corregge dataset, riesegue.
3. **Errore tecnico inatteso**
   - L'app mostra messaggio user-friendly senza leak sensibili.
   - Console disponibile per debug tecnico locale.

### Frizioni UX rilevate
- Serve uniformare ulteriormente il microcopy in chiave “causa + correzione” per tutti i messaggi utente.

---

## Requisiti UX derivati (azione)

1. Ogni errore deve includere:
   - **Causa** (cosa non va)
   - **Impatto** (cosa è stato bloccato)
   - **Correzione** (passo successivo consigliato)
2. Gli stati applicativi devono restare espliciti (`idle`, `file_ready`, `generating`, `completed`, `error`).
3. Le azioni principali in chiusura processo devono sempre essere visibili: download validi, export errori, reset.
4. Per dataset grandi va previsto feedback progressivo avanzato (ETA e item corrente), già tracciato come task successivo.
