import fs from 'node:fs';

const TARGET_FILES = ['app.js', 'styles.css', 'barcode-eps-wizard.html'];
const issues = [];

for (const filePath of TARGET_FILES) {
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('\r\n')) {
    issues.push(`${filePath}: usa terminatori CRLF, atteso LF.`);
  }

  if (!content.endsWith('\n')) {
    issues.push(`${filePath}: manca newline finale.`);
  }

  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (/\s+$/.test(line)) {
      issues.push(`${filePath}:${lineNumber} contiene trailing whitespace.`);
    }

    const leadingWhitespace = line.match(/^\s*/)?.[0] ?? '';
    if (leadingWhitespace.includes('\t')) {
      issues.push(`${filePath}:${lineNumber} usa tab invece di spazi.`);
    }
  });
}

if (issues.length > 0) {
  console.error('Format check fallito:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log('Format check OK: regole base di formattazione rispettate.');
