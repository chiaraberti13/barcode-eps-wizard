# Changelog

Tutte le modifiche rilevanti del progetto **Barcode EPS Wizard** saranno documentate in questo file.

Il formato segue [Keep a Changelog](https://keepachangelog.com/it-IT/1.1.0/) e il progetto adotta [Semantic Versioning](https://semver.org/lang/it/).

## [Unreleased]

### Added
- Placeholder per nuove funzionalità in sviluppo.

### Changed
- Placeholder per modifiche comportamentali non breaking.

### Fixed
- Placeholder per bug fix.

### Security
- Placeholder per hardening e fix sicurezza.

## [2.1.0] - 2026-04-05

### Added
- Separazione asset in `app.js` e `styles.css` e baseline multi-file mantenendo UX invariata.
- Tooling locale con script `lint`, `test`, `test:e2e`, `build-check`.
- Moduli core isolati (`core/ean13.mjs`, `core/data-rows.mjs`, `core/row-utils.mjs`, `core/error-report.mjs`, `core/progress-feedback.mjs`, `core/preview-filter.mjs`) con test unitari.
- Report errori esportabile in CSV/JSON e filtro preview (tutti/successi/errori).
- Documentazione tecnica (`docs/architecture.md`, `docs/ean13-contract.md`, `docs/ui-state-machine.md`, `docs/user-journeys.md`).

### Changed
- Flusso UI con macchina a stati esplicita (`idle`, `file_ready`, `generating`, `completed`, `error`).
- Copy UX orientata all'azione per upload, error handling e progress feedback.
- Download bulk rinominato a `Scarica validi (ZIP)` e aggiunto reset sessione.

### Fixed
- Sanitizzazione robusta dei nomi file EPS cross-platform e gestione duplicati deterministica.
- Validazione barcode con normalizzazione sicura e check digit su EAN-13.
- Escaping metadata/literal EPS per mitigare injection PostScript.

### Security
- Limiti hard/soft su dimensione file e numero righe per ridurre rischio DoS client-side.
- Gestione errori centralizzata con messaggi user-friendly e senza leak di dettagli tecnici.

[Unreleased]: https://example.invalid/barcode-eps-wizard/compare/v2.1.0...HEAD
[2.1.0]: https://example.invalid/barcode-eps-wizard/releases/tag/v2.1.0
