# ADR 003: Adopt Jest as the backend test runner

- Status: accepted
- Date: 2025-11-14

## Context
The backend initially used `node:test` for unit tests. As the codebase grew, we needed a more expressive test runner with mocks, spies, snapshots, and coverage reporting.

## Decision
Adopt **Jest** as the primary test runner for the backend. Update npm scripts and migrate existing tests accordingly.

## Consequences
- Richer testing features (mocks, spies, snapshots, coverage).
- Industry-standard tooling.
- Slightly heavier setup for ESM and transforms.
