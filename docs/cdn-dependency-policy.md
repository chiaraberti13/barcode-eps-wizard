# Policy dipendenze CDN e fallback offline

## Librerie esterne autorizzate
- `xlsx@0.18.5`
- `jszip@3.10.1`
- `lucide@0.468.0`

## Regole sicurezza supply-chain
1. Versioni pinate (no `latest`).
2. `integrity` + `crossorigin=anonymous` su ogni script CDN.
3. `referrerpolicy=no-referrer` sugli script esterni.
4. Fallback locale su `./vendor/*.min.js` in caso di blocco CDN.
5. Aggiornamento dipendenze solo dopo smoke + `npm run build-check`.

## Procedura aggiornamento
1. Aggiornare versione script in `barcode-eps-wizard.html`.
2. Aggiornare file locale in `vendor/`.
3. Validare con `npm run build-check`.
4. Annotare nel `CHANGELOG.md`.
