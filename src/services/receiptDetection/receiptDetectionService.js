import { extractInvoiceFields } from './electricityInvoiceExtractor.js';

export function detectReceiptFields({ subject, body, html }) {
  const result = extractInvoiceFields({ subject, body, html });
  return result;
}
