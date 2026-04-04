import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const issues = [];

const jsSyntaxCheck = spawnSync(process.execPath, ['--check', 'app.js'], { encoding: 'utf8' });
if (jsSyntaxCheck.status !== 0) {
  issues.push(`Sintassi JavaScript non valida in app.js: ${jsSyntaxCheck.stderr || jsSyntaxCheck.stdout}`);
}

const html = fs.readFileSync('barcode-eps-wizard.html', 'utf8');
if (!html.includes('id="uploadArea"') || !html.includes('id="generateBtn"')) {
  issues.push('Markup HTML incompleto: upload area o bottone principale non trovati.');
}

const css = fs.readFileSync('styles.css', 'utf8');
if (!css.includes('@media')) {
  issues.push('styles.css non contiene media query responsive.');
}

if (issues.length > 0) {
  console.error('Lint fallito:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log('Lint OK: controlli statici minimi superati.');
