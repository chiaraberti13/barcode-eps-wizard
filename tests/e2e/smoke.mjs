import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('barcode-eps-wizard.html', 'utf8');

assert.match(html, /id="uploadArea"/, 'Manca la dropzone upload.');
assert.match(html, /id="generateBtn"/, 'Manca il bottone di generazione.');
assert.match(html, /id="downloadAllBtn"/, 'Manca il bottone di download validi.');
assert.match(html, /id="resetSessionBtn"/, 'Manca il bottone di reset sessione.');
assert.match(html, /id="previewFilterAllBtn"/, 'Manca il filtro preview "Tutti".');
assert.match(html, /id="previewFilterSuccessBtn"/, 'Manca il filtro preview "Successi".');
assert.match(html, /id="previewFilterErrorBtn"/, 'Manca il filtro preview "Errori".');
assert.match(html, /id="previewEmptyState"/, 'Manca lo stato vuoto dedicato della preview.');
assert.match(html, /id="progressMeta"/, 'Manca il dettaglio progressivo con ETA.');
assert.match(html, /Header richiesti: Codice articolo, Barcode/, "Manca l'istruzione upload sui campi obbligatori.");
assert.match(html, /id="onboardingPanel"/, 'Manca il pannello onboarding in-page.');
assert.match(html, /id="onboardingCurrentStep"/, "Manca l'indicatore del passo corrente onboarding.");
assert.match(html, /Guida rapida/, 'Manca il titolo onboarding "Guida rapida".');

console.log('E2E smoke OK: struttura UI minima presente.');
