import { generateEPS } from '../core/ean13.mjs';

function createRows(size) {
  return Array.from({ length: size }, (_, index) => ({
    codiceArticolo: `ART-${String(index + 1).padStart(5, '0')}`,
    barcode: `80012345${String(index % 10000).padStart(4, '0')}`.slice(0, 12)
  }));
}

function runBenchmark(size) {
  const rows = createRows(size);
  const startMemory = process.memoryUsage().heapUsed;
  const start = performance.now();

  for (const row of rows) {
    generateEPS(row.barcode, row.codiceArticolo);
  }

  const end = performance.now();
  const endMemory = process.memoryUsage().heapUsed;
  return {
    size,
    elapsedMs: Number((end - start).toFixed(2)),
    heapDeltaMb: Number(((endMemory - startMemory) / (1024 * 1024)).toFixed(2))
  };
}

const scenarios = [100, 1000, 5000];
const results = scenarios.map(runBenchmark);

console.table(results);
