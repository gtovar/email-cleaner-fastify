const POSITIVE_SENDER_PATTERNS = [
  /\bcfe\b/i,
  /comision\s+federal\s+de\s+electricidad/i,
  /factur/i,
  /recib/i,
];

const POSITIVE_CONTENT_PATTERNS = [
  /\brecibo\b/i,
  /\bfactura\b/i,
  /\bluz\b/i,
  /\belectricidad\b/i,
  /\bcfe\b/i,
  /\bvencim/i,
  /fecha\s+l[ií]mite\s+de\s+pago/i,
  /importe\s+a\s+pagar/i,
  /pago\s+pendiente/i,
];

const STRONG_NEGATIVE_PATTERNS = [
  /\bnewsletter\b/i,
  /\bunsubscribe\b/i,
  /\bpromoci[oó]n\b/i,
  /\boferta\b/i,
  /\bsale\b/i,
  /\bdescuento\b/i,
  /\bsuscr[ií]bete\b/i,
];

const WORK_CONTEXT_PATTERNS = [
  /\breuni[oó]n\b/i,
  /\bagenda\b/i,
  /\bequipo\b/i,
  /\bseguimiento\b/i,
];

export const ELECTRICITY_RECEIPT_TYPES = {
  INVOICE: 'invoice_electricity',
  NOT_INVOICE: 'not_invoice',
  UNKNOWN: 'unknown',
};

export const ELECTRICITY_RECEIPT_CONFIDENCE = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const ELECTRICITY_RECEIPT_METHOD = 'rules_v1';

export const ELECTRICITY_RECEIPT_REASON = {
  MATCHED_SENDER_AND_KEYWORDS: 'matched_sender_and_keywords',
  NEGATIVE_SIGNAL: 'negative_signal',
  INSUFFICIENT_SIGNAL: 'insufficient_signal',
};

function countMatches(value, patterns) {
  return patterns.reduce(
    (count, pattern) => count + (pattern.test(value) ? 1 : 0),
    0
  );
}

function normalizeEmailInput(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

export function classifyElectricityReceipt(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError('input must be an object');
  }

  const subject = normalizeEmailInput(input.subject);
  const sender = normalizeEmailInput(input.sender);
  const body = normalizeEmailInput(input.body);

  const haystack = [subject, body].filter(Boolean).join('\n');
  const senderSignals = countMatches(sender, POSITIVE_SENDER_PATTERNS);
  const contentSignals = countMatches(haystack, POSITIVE_CONTENT_PATTERNS);
  const fullText = [subject, sender, body].join('\n');
  const strongNegativeSignals = countMatches(fullText, STRONG_NEGATIVE_PATTERNS);
  const workContextSignals = countMatches(fullText, WORK_CONTEXT_PATTERNS);

  if (strongNegativeSignals > 0 && senderSignals === 0 && contentSignals === 0) {
    return {
      type: ELECTRICITY_RECEIPT_TYPES.NOT_INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.HIGH,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.NEGATIVE_SIGNAL,
    };
  }

  if (strongNegativeSignals > 0 && (senderSignals > 0 || contentSignals > 0)) {
    return {
      type: ELECTRICITY_RECEIPT_TYPES.UNKNOWN,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.LOW,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.INSUFFICIENT_SIGNAL,
    };
  }

  if (senderSignals >= 1 && contentSignals >= 1) {
    return {
      type: ELECTRICITY_RECEIPT_TYPES.INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.HIGH,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.MATCHED_SENDER_AND_KEYWORDS,
    };
  }

  if (senderSignals === 0 && contentSignals >= 2 && strongNegativeSignals === 0) {
    return {
      type: ELECTRICITY_RECEIPT_TYPES.INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.MEDIUM,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.MATCHED_SENDER_AND_KEYWORDS,
    };
  }

  if (
    senderSignals === 0 &&
    contentSignals === 0 &&
    workContextSignals > 0 &&
    strongNegativeSignals === 0
  ) {
    return {
      type: ELECTRICITY_RECEIPT_TYPES.NOT_INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.MEDIUM,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.NEGATIVE_SIGNAL,
    };
  }

  return {
    type: ELECTRICITY_RECEIPT_TYPES.UNKNOWN,
    confidence: ELECTRICITY_RECEIPT_CONFIDENCE.LOW,
    method: ELECTRICITY_RECEIPT_METHOD,
    reason: ELECTRICITY_RECEIPT_REASON.INSUFFICIENT_SIGNAL,
  };
}
