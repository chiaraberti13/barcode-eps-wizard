#!/usr/bin/env node

import { spawn } from 'node:child_process';

const STEPS = [
  { label: 'lint', command: 'node', args: ['scripts/lint.mjs'] },
  { label: 'format', command: 'node', args: ['scripts/format-check.mjs'] },
  { label: 'test', command: 'node', args: ['--test', 'tests/unit/*.test.mjs'] },
  { label: 'test:e2e', command: 'node', args: ['tests/e2e/smoke.mjs'] },
];

function runStep(step) {
  return new Promise((resolve, reject) => {
    const child = spawn(step.command, step.args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Step "${step.label}" failed with exit code ${code ?? 'unknown'}.`));
    });
  });
}

for (const step of STEPS) {
  // eslint-disable-next-line no-console
  console.log(`\n▶ Running ${step.label}...`);
  await runStep(step);
}

// eslint-disable-next-line no-console
console.log('\n✅ build-check completed successfully.');
