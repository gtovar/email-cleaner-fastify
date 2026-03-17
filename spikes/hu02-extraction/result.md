# HU_02 Extraction Spike — Result

## Final recommendation

- Chosen path: `Node-first`

## Why this path won

- A minimal Node-first prototype was implemented locally without touching production code.
- The prototype was executed against the six base fixtures defined for the spike.
- Result: `6/6` fixtures passed.
- The prototype kept the contract small and explicit:
  - `amount: string | null`
  - `due_date: YYYY-MM-DD | null`
- Fallback behavior remained safe with `null` for ambiguous or negative cases.
- At this stage, Node-first is sufficient to unblock an initial HU_02 implementation path.

## Why the alternatives lost

- `Python-first` was not required yet to reduce the current uncertainty.
- The current dataset did not expose enough friction to justify introducing cross-service complexity at this stage.
- A Python comparison remains optional only if later cases exceed the current Node-first simplicity threshold.

## Frozen minimum contract

```json
{
  "amount": "string | null",
  "due_date": "YYYY-MM-DD | null"
}
```

## Safe fallback

- If extraction cannot be performed with confidence, return:
  - `amount: null`
  - `due_date: null`

## Evidence

- Prototype path:
  - `spikes/hu02-extraction/node-prototype/extract.js`
  - `spikes/hu02-extraction/node-prototype/run-fixtures.js`
- Dataset:
  - 3 positive fixtures
  - 2 ambiguous fixtures
  - 1 negative fixture
- Execution result:
  - `total: 6`
  - `passed: 6`
  - `failed: 0`

## Does HU_02 become implementation-ready?

- Yes, for an initial local Node-first implementation slice.

## If not, what remains blocked?

- No hard blocker remains for the first implementation slice.
- A later comparison with Python may still be considered if future fixture complexity grows beyond simple parsing and normalization.
