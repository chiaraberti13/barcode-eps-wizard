# Versioning & Release Policy

## Obiettivo
Questa policy definisce come versionare e rilasciare Barcode EPS Wizard in modo ripetibile, verificabile e allineato ai quality gate del repository.

## Standard adottato
- **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`.
- **Changelog strutturato**: formato Keep a Changelog in `CHANGELOG.md`.

## Regole di incremento versione
- **MAJOR**: cambiamenti incompatibili (breaking) su comportamento utente, formato output EPS o contratti dei moduli core.
- **MINOR**: nuove feature backward-compatible (es. nuovi report, miglioramenti UX non breaking, nuovi controlli sicurezza).
- **PATCH**: correzioni bug, hardening o refactor senza cambiamenti funzionali breaking.

## Processo di release
1. **Freeze scope**: confermare le issue incluse nella release.
2. **Quality gate locale**: eseguire `npm run build-check` in verde.
3. **Aggiornamento changelog**:
   - spostare contenuti da `Unreleased` a una nuova sezione versionata con data ISO (`YYYY-MM-DD`);
   - classificare voci in `Added`, `Changed`, `Fixed`, `Security`.
4. **Version bump**: aggiornare `version` in `package.json`.
5. **Tag Git**: creare tag annotato `vX.Y.Z` con note sintetiche.
6. **Release notes**: pubblicare note coerenti con `CHANGELOG.md`.

## Criteri minimi per pubblicazione
- Lint e test unitari green.
- Test e2e previsti dal repository green.
- Nessun blocco critico aperto in `upgrade.md` relativo alla release.

## Gestione hotfix
- Branch dedicato `hotfix/vX.Y.Z+1` partendo dal tag in produzione.
- Solo fix urgenti e minimali.
- Release come incremento **PATCH** con entry dedicata in changelog.

## Sicurezza e tracciabilità
- Le correzioni sicurezza devono essere annotate nella sezione `Security` del changelog.
- Ogni release deve essere riconducibile a commit/tag verificabili.
