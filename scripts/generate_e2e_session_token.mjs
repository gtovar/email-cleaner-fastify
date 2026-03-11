#!/usr/bin/env node
// Governance note: helper for local/E2E authenticated sessions. Do not delete casually.
// Purpose: generate a session_token compatible with authMiddleware without running live Google OAuth.

import jwt from 'jsonwebtoken';

const emailArg = process.argv.find((arg, index) => index > 1 && !arg.startsWith('--'));
const email = emailArg || 'e2e-user@example.com';
const secret = process.env.INTERNAL_JWT_SECRET;
const ttl = Number(process.env.SESSION_JWT_TTL_SECONDS || 3600);
const mode = process.argv.includes('--raw') ? 'raw' : process.argv.includes('--cookie') ? 'cookie' : 'default';

if (!secret) {
  console.error('INTERNAL_JWT_SECRET is required to generate an E2E session token.');
  process.exit(1);
}

const token = jwt.sign({ email }, secret, { expiresIn: ttl });

if (mode === 'raw') {
  console.log(token);
  process.exit(0);
}

if (mode === 'cookie') {
  console.log(`session_token=${token}`);
  process.exit(0);
}

console.log(`email=${email}`);
console.log(`session_token=${token}`);
