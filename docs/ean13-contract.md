# Contratto tecnico modulo EAN-13 / EPS

Questo documento formalizza il contratto I/O del modulo `core/ean13.mjs`.

## API pubbliche

### `calculateEAN13CheckDigit(code12)`
- **Input atteso:** stringa di **12 cifre numeriche** (`^\d{12}$`).
- **Comportamento:** calcola il check digit EAN-13 secondo standard GS1.
- **Output:** numero intero `0-9`.
- **Errori:** genera `Error` se l'input non è una stringa numerica a 12 cifre.

### `normalizeEAN13Input(code)`
- **Input atteso:** valore convertibile in stringa contenente:
  - 12 cifre numeriche (`^\d{12}$`) **oppure**
  - 13 cifre numeriche (`^\d{13}$`).
- **Comportamento:**
  - se 12 cifre, aggiunge il check digit calcolato;
  - se 13 cifre, verifica che il check digit sia coerente.
- **Output:** stringa EAN-13 normalizzata a 13 cifre.
- **Errori:**
  - `Error` se il formato non è numerico/12-13 cifre;
  - `Error` se il check digit di un EAN-13 è errato.

### `encodeEAN13(code)`
- **Input atteso:** stesso contratto di `normalizeEAN13Input`.
- **Comportamento:** normalizza/valida l'EAN e produce il pattern a barre EAN-13.
- **Output:** stringa binaria di 95 moduli (`1` barra, `0` spazio), con guardie start/center/end.
- **Errori:** propagati da `normalizeEAN13Input`.

### `generateEPS(codiceBarcode, codiceArticolo)`
- **Input atteso:**
  - `codiceBarcode`: stesso contratto di `normalizeEAN13Input`;
  - `codiceArticolo`: parametro opzionale (non usato nel payload EPS corrente).
- **Comportamento:** genera payload EPS (`PostScript`) per barcode EAN-13 validato.
- **Output:** stringa EPS con:
  - header `%!PS-Adobe-3.0 EPSF-3.0`;
  - `%%BoundingBox` coerente con il layout;
  - blocco disegno barre + testo cifre;
  - terminazione `showpage`.
- **Errori:** propagati da `normalizeEAN13Input` se barcode invalido.

## Note di sicurezza
- Il modulo accetta solo digit per la parte barcode, riducendo input ambiguo/malformato.
- La validazione del check digit impedisce output EPS semanticamente errati su EAN-13 a 13 cifre.
- `codiceArticolo` non viene serializzato nell'EPS attuale, quindi non influenza la sintassi PostScript.
