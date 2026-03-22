let installHusky;

try {
  ({ default: installHusky } = await import('husky'));
} catch {
  console.log('prepare-husky: husky not installed; skipping hook installation');
  process.exit(0);
}

const result = installHusky();

if (result) {
  console.error(`prepare-husky: ${result}`);
  process.exit(1);
}
