# Benchmark performance client-side

## Metodo
- Script: `node scripts/benchmark.mjs`
- Scenario: generazione EPS pura (core), senza rendering DOM e senza zip.
- Dataset: 100, 1.000, 5.000 record sintetici.

## Risultati baseline
| Record | Tempo (ms) | Delta heap (MB) |
| --- | ---: | ---: |
| 100 | 12.57 | 0.77 |
| 1.000 | 36.92 | 0.27 |
| 5.000 | 118.64 | 0.16 |

> Nota: i valori sono baseline indicativi e vanno rigenerati su macchina target prima della release.

## Obiettivi
- 5.000 record in meno di 1 secondo per la sola pipeline core.
- UI responsiva grazie a chunking configurabile (`GENERATION_CHUNK_SIZE`).
- Nessun freeze percepibile durante la preview.
