# Macchina a stati UI — Barcode EPS Wizard

## Stati supportati

- `idle`: nessun dataset caricato, nessuna azione disponibile.
- `file_ready`: file valido caricato e pronto alla generazione.
- `generating`: generazione in corso con progresso visibile.
- `completed`: processo terminato con preview, download ZIP e report errori (se presenti).
- `error`: errore gestito lato UI senza leak tecnici verso l'utente.

## Transizioni principali

1. `idle` → `file_ready` dopo upload e validazione completati.
2. `file_ready` → `generating` quando l'utente avvia la generazione.
3. `generating` → `completed` al termine del batch.
4. `*` → `error` su errori di validazione, lettura file o esportazione ZIP.
5. `error` → `file_ready` caricando un file valido.

## Regole UX/Sicurezza implementate

- Stati critici (generazione in corso) bloccano azioni incoerenti.
- Download nascosti finché non esistono output effettivi.
- Gli errori tecnici sono loggati solo su console; in UI arrivano messaggi sanitizzati.
- Le statistiche vengono azzerate a ogni nuovo caricamento per evitare ambiguità.
