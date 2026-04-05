# OWASP Top 10 2021 — Assessment (Barcode EPS Wizard)

Data assessment: 2026-04-05  
Ambito: applicazione web client-side statica (`barcode-eps-wizard.html`, `app.js`, moduli `core/*`).

## Metodo

- Analisi del flusso reale: upload file tabellare, validazione righe, generazione EPS, export singolo/ZIP.
- Mappatura controlli esistenti su OWASP Top 10 2021.
- Classificazione stato:
  - **Mitigato**: controllo già implementato e verificabile nel codice.
  - **Parziale**: controllo presente ma incompleto o non formalizzato.
  - **Da implementare**: gap aperto.

## Checklist

| OWASP | Rischio nel contesto app | Stato | Mitigazioni/evidenze implementate | Azioni residue |
|---|---|---|---|---|
| A01: Broken Access Control | Rischio limitato: app senza autenticazione, dati solo locali nel browser. | Mitigato (perimetro attuale) | Nessun backend/API, nessun ruolo utente, nessun dato persistente condiviso tra utenti. | Se in futuro si aggiunge backend: RBAC e autorizzazioni lato server obbligatorie. |
| A02: Cryptographic Failures | Possibile esposizione dati durante caricamento librerie CDN in rete non fidata. | Parziale | Dati utente processati solo in locale; nessun invio applicativo verso backend. | Completare policy dipendenze CDN con pin versioni + SRI + fallback locale e imporre HTTPS in deployment. |
| A03: Injection | Possibile injection HTML/JS/PS da campi file input. | Mitigato | Rendering preview senza `innerHTML`; uso `textContent`; escaping literal PostScript + sanitizzazione metadati EPS; validazione stretta barcode/codice articolo. | Mantenere test regressione su payload malevoli ad ogni release. |
| A04: Insecure Design | Flussi non guidati possono portare errori operativi su file non conformi. | Parziale | State machine UI, messaggi action-oriented, blocchi preventivi su colonne/file/righe. | Consolidare onboarding in-page e stati vuoti/errore dedicati (task UX aperti). |
| A05: Security Misconfiguration | Hardening browser dipende dall'hosting, non ancora formalizzato. | Parziale | Limiti hard/soft su file e righe; gestione errori centralizzata con messaggi safe. | Formalizzare profilo header (`CSP`, `Referrer-Policy`, `X-Content-Type-Options`) e verificarlo in ambiente target. |
| A06: Vulnerable and Outdated Components | Dipendenze CDN non ancora governate formalmente. | Parziale | Versione JSZip già pin-ata (`3.10.1`). | Definire policy aggiornamento/version pin per tutte le CDN, introdurre verifica periodica e fallback offline. |
| A07: Identification and Authentication Failures | Non applicabile nel perimetro attuale (nessun login/sessione). | N/A (perimetro attuale) | Nessuna feature di autenticazione presente. | Se introdotti account: MFA opzionale, policy password, session management robusto. |
| A08: Software and Data Integrity Failures | Rischio supply-chain su script esterni caricati runtime. | Parziale | Build locale con script di quality gate (`lint`, `test`, `test:e2e`, `build-check`). | Completare integrità dipendenze frontend con SRI e strategia lock/controllo versioni. |
| A09: Security Logging and Monitoring Failures | Nessun monitoraggio centralizzato (app locale), ma logging debug presente. | Parziale | Logging tecnico contestualizzato (`handleError`) e messaggi utente non sensibili. | Se deployment enterprise: aggiungere telemetria privacy-safe opzionale e policy retention log. |
| A10: Server-Side Request Forgery (SSRF) | Non applicabile: nessuna chiamata server-side. | N/A (architettura attuale) | App totalmente client-side senza fetch verso endpoint backend proprietari. | Rieseguire assessment se si introduce backend/proxy. |

## Rischi prioritari residui

1. **Supply chain CDN** (A02/A06/A08): priorità alta finché non sono presenti SRI + fallback locale.
2. **Security headers di hosting** (A05): priorità alta in fase di deploy pubblico.
3. **UX di prevenzione errore umano** (A04): priorità media, impatto operativo su lotti ampi.

## Piano di chiusura suggerito

1. Chiudere task "policy dipendenze CDN e fallback offline sicuro".
2. Chiudere task "hardening browser-side (header sicurezza)" con profilo pronto per hosting statico.
3. Rieseguire questa checklist ad ogni release minore e registrare outcome in changelog.
