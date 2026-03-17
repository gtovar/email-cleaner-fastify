import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractInvoiceFields } from './extract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

function isEqualResult(actual, expected) {
  return actual.amount === expected.amount && actual.due_date === expected.due_date;
}

function formatValue(value) {
  return JSON.stringify(value);
}

async function loadFixtures() {
  const files = await readdir(FIXTURES_DIR);
  const fixtureFiles = files.filter((file) => file.endsWith('.json')).sort();

  return Promise.all(
    fixtureFiles.map(async (fileName) => {
      const filePath = path.join(FIXTURES_DIR, fileName);
      const content = await readFile(filePath, 'utf8');
      return JSON.parse(content);
    })
  );
}

async function main() {
  const fixtures = await loadFixtures();
  let passed = 0;
  let failed = 0;

  for (const fixture of fixtures) {
    const actual = extractInvoiceFields({
      subject: fixture.subject,
      body: fixture.body,
      html: fixture.html,
    });
    const ok = isEqualResult(actual, fixture.expected);

    if (ok) {
      passed += 1;
    } else {
      failed += 1;
    }

    console.log(`\n[${ok ? 'PASS' : 'FAIL'}] ${fixture.id}`);
    console.log(`  expected: ${formatValue(fixture.expected)}`);
    console.log(`  actual:   ${formatValue(actual)}`);
  }

  console.log('\nSummary');
  console.log(`  total:  ${fixtures.length}`);
  console.log(`  passed: ${passed}`);
  console.log(`  failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Failed to run extraction fixtures:', error);
  process.exitCode = 1;
});
