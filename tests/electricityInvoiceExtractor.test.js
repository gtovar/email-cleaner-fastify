import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractInvoiceFields } from '../src/services/receiptDetection/electricityInvoiceExtractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, '../spikes/hu02-extraction/fixtures');

async function loadFixtures() {
  const entries = await readdir(FIXTURES_DIR);
  const fixtures = [];

  for (const entry of entries) {
    if (!entry.endsWith('.json')) {
      continue;
    }

    const content = await readFile(path.join(FIXTURES_DIR, entry), 'utf8');
    fixtures.push(JSON.parse(content));
  }

  return fixtures;
}

describe('electricityInvoiceExtractor', () => {
  let fixtures;

  beforeAll(async () => {
    fixtures = await loadFixtures();
  });

  it('passes the base spike fixtures', () => {
    expect(fixtures.length).toBe(6);

    for (const fixture of fixtures) {
      const actual = extractInvoiceFields({
        subject: fixture.subject,
        body: fixture.body,
        html: fixture.html,
      });

      expect(actual).toEqual(fixture.expected);
    }
  });
});
