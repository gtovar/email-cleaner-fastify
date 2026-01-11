# Testing with Jest

This project uses Jest as the test runner.

## Run the full suite

```bash
npm test
```

## Watch mode

```bash
npm run test:watch
```

## Coverage report

```bash
npm run coverage
```

## Configuration

The project uses ECMAScript Modules (`"type": "module"` in `package.json`). Jest is configured in `package.json` to run with Node ESM and no transforms:

```json
"jest": {
  "testEnvironment": "node",
  "transform": {}
}
```

If TypeScript or JSX is introduced, update the Jest configuration accordingly.

## Writing tests

Tests live under `tests/` and follow Jest conventions. Use `test()` / `expect()` or import from `@jest/globals`.

```js
import { test, expect } from '@jest/globals';
import { buildGmailQuery } from '../src/utils/filters.js';

test('buildGmailQuery adds flags', () => {
  const q = buildGmailQuery({ unread: 'true', category: 'promotions' });
  expect(q).toBe('is:unread category:promotions');
});
```

For async tests, use `async` or return a Promise.
