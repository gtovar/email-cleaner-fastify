# SPIKE/HU_02 — Define initial extraction path for `amount` and `due_date`

## 1. Purpose

This spike exists to determine the safest and most maintainable initial path for extracting `amount` and `due_date` from emails already classified as invoices.

This is **not** the production implementation of HU_02.

The goal is to reduce technical uncertainty before coding the real feature.

---

## 2. Status

- **Type:** Technical Spike / Knowledge-Acquisition Story
- **Scope:** Backend-only research
- **Repo:** `email-cleaner-fastify`
- **Branch:** `spike/hu02-extraction-path`
- **Status:** Planned
- **Timebox:** 4 to 8 hours maximum

---

## 3. Background

HU_01 already introduced a backend-only local rules-based classifier for electricity-bill detection.

The next pending step is HU_02, which requires extracting structured values from invoice-like email content.

Before implementing HU_02, we need to answer a technical question:

> What is the safest and most efficient initial path for extracting `amount` and `due_date` locally, without paid external dependencies?

---

## 4. Technical Question

Which initial implementation path should be chosen for HU_02?

- **Node-first**
- **Python-first**
- **Another minimal local approach**

The answer must be justified with evidence from a controlled prototype, not by intuition alone.

---

## 5. Expected Output of the Spike

At the end of this spike, we must have:

- a clear recommendation: `Node-first`, `Python-first`, or another minimal path
- a frozen minimum contract
- a safe fallback strategy with `null`
- a small controlled dataset
- a lightweight decision note, or an ADR only if the contract/architecture really changes

---

## 6. Minimum Experiment Contract

### Input

```json
{
  "subject": "string",
  "body": "string",
  "html": "string | optional"
}
```

### Output

```json
{
  "amount": null,
  "due_date": null
}
```

### Rules

- If extraction fails, return `null`
- Do not invent values
- Do not break the flow
- Do not introduce side effects
- Do not depend on Gmail live integration for this spike

---

## 7. Scope

### In scope

- Prototype a minimal extraction approach in Node.js
- Prototype a minimal extraction approach in Python only if it fits inside the timebox
- Compare both options against the same small dataset
- Document the recommendation and why it won

### Out of scope

- Production-ready extractor
- Gmail live integration
- Frontend changes
- Notifications
- n8n flows
- Twilio / WhatsApp delivery
- OCR / PDF as required path
- End-to-end integration
- Broad invoice coverage beyond the first controlled slice

---

## 8. Evaluation Criteria

The spike compares alternatives using these criteria:

1. **Complexity**
   - How hard is the first implementation?
   - How much incidental complexity does it introduce?

2. **Maintainability**
   - How easy is it to test, debug, and extend?
   - Does it fit the current backend architecture cleanly?

3. **Contract clarity**
   - Can the extraction result be represented with a small, stable contract?
   - Is fallback behavior obvious and safe?

4. **Initial viability**
   - Can it produce useful results on a minimal local dataset?
   - Does it reduce uncertainty enough to unblock HU_02?

---

## 9. Minimal Dataset

The spike must use a small controlled dataset.

### Required minimum

- **3 positive cases**
  - clear invoice with amount and due date
  - clear invoice with imperfect sender but strong content
  - payment reminder with strong due-date wording

- **2 ambiguous cases**
  - payment-related email without enough invoice context
  - generic service statement without extractable structure

- **1 negative case**
  - promotional or unrelated email

### Dataset rules

- Store fixtures locally
- Keep examples explicit and readable
- Prefer deterministic text over noisy real-world samples for the first pass

---

## 10. Working Hypotheses

These are working hypotheses, not final truths.

### Hypothesis A — Node-first

Node may be enough for the first slice if the extraction can be handled with simple parsing rules, regex patterns, and deterministic normalization.

Potential advantage:

- Keeps the first implementation close to the current backend flow

Potential risk:

- Parsing logic may become messy if text variability grows quickly

### Hypothesis B — Python-first

Python may be the better first slice if extraction benefits from stronger text-processing ergonomics or if this path naturally leads into later document-processing work.

Potential advantage:

- Better long-term fit if extraction evolves toward richer parsing

Potential risk:

- Adds cross-service complexity too early if the first slice is still simple

---

## 11. Deliverables

This spike should leave behind only small, explicit artifacts.

### Required deliverables

- this README
- a minimal fixture dataset
- prototype notes or small isolated prototype code
- a final decision note

### Optional deliverables

- ADR, only if the spike changes architecture or contract boundaries
- a tiny comparison matrix
- a short follow-up implementation recommendation for HU_02

---

## 12. File / Folder Suggestion

Suggested local structure for the spike:

```text
spikes/
└── hu02-extraction/
    ├── README.md
    ├── fixtures/
    │   ├── positive-clear-invoice.json
    │   ├── positive-imperfect-sender.json
    │   ├── positive-payment-reminder.json
    │   ├── ambiguous-payment.json
    │   ├── ambiguous-services-statement.json
    │   └── negative-promo.json
    ├── node-prototype/
    ├── python-prototype/
    └── result.md
```

Notes:

- `python-prototype/` is optional if the timebox does not allow it
- experimental code must stay isolated from production code

---

## 13. Decision Log Template

Use this section or `result.md` to record the final outcome.

### Final recommendation

- **Chosen path:** `TBD`

### Why this path won

- `TBD`

### Why the alternatives lost

- `TBD`

### Frozen minimum contract

- `TBD`

### Safe fallback

- `TBD`

### Does HU_02 become implementation-ready?

- `Yes / No`

### If not, what remains blocked?

- `TBD`

---

## 14. Definition of Done

The spike is done only if:

- the timebox was respected
- at least one minimal path was evaluated
- a second path was evaluated only if it fit the timebox
- the output contract is explicit
- fallback with `null` is explicit
- a technical recommendation is documented
- HU_02 is either:
  - unblocked for implementation, or
  - still blocked with an explicit documented reason

---

## 15. Anti-Scope Guardrails

If any of these starts happening, the spike is drifting and must be cut back:

- adding UI
- integrating Gmail live data
- trying to solve PDFs/OCR "just in case"
- broadening to all invoice types at once
- writing production-grade pipelines before making the decision
- mixing extraction with notifications or automation delivery

---

## 16. Closure Condition

The spike closes with one of these outcomes:

### Outcome A

HU_02 is ready to move into implementation with a chosen path and a frozen minimum contract.

### Outcome B

HU_02 remains blocked, but the blocker is now explicit, technical, and documented.

---

## 17. Notes

This spike is intended to reduce uncertainty, not to maximize feature output.

A small clear answer is better than a large ambiguous prototype.
