const MONTH_MAP = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  setiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
};

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function normalizeAmount(rawAmount) {
  if (!rawAmount) {
    return null;
  }

  const cleaned = rawAmount.replace(/[$,\s]|MXN/gi, '').trim();
  if (!cleaned) {
    return null;
  }

  const numeric = Number.parseFloat(cleaned);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return numeric.toFixed(2);
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function normalizeDelimitedDate(day, month, year) {
  const numericDay = Number.parseInt(day, 10);
  const numericMonth = Number.parseInt(month, 10);
  const numericYear = Number.parseInt(year, 10);

  if (
    Number.isNaN(numericDay) ||
    Number.isNaN(numericMonth) ||
    Number.isNaN(numericYear) ||
    numericDay < 1 ||
    numericDay > 31 ||
    numericMonth < 1 ||
    numericMonth > 12
  ) {
    return null;
  }

  return `${numericYear}-${pad(numericMonth)}-${pad(numericDay)}`;
}

function normalizeMonthNameDate(day, monthName, year) {
  const normalizedMonth = MONTH_MAP[monthName.toLowerCase()];
  if (!normalizedMonth) {
    return null;
  }

  return normalizeDelimitedDate(day, normalizedMonth, year);
}

function extractAmount(haystack) {
  const amountPatterns = [
    /(?:total\s+a\s+pagar|importe\s+total|saldo\s+pendiente)\s*:\s*\$?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2}))/i,
    /\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2}))/i,
  ];

  for (const pattern of amountPatterns) {
    const match = haystack.match(pattern);
    if (match) {
      const normalized = normalizeAmount(match[1]);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function extractDueDate(haystack) {
  const delimitedPatterns = [
    /(?:fecha\s+l[ií]mite\s+de\s+pago|pagar\s+antes\s+del?)\s*:??\s*([0-3]?\d)[\/-]([0-1]?\d)[\/-](20\d{2})/i,
    /\b([0-3]?\d)[\/-]([0-1]?\d)[\/-](20\d{2})\b/,
  ];

  for (const pattern of delimitedPatterns) {
    const match = haystack.match(pattern);
    if (match) {
      const normalized = normalizeDelimitedDate(match[1], match[2], match[3]);
      if (normalized) {
        return normalized;
      }
    }
  }

  const monthNamePatterns = [
    /(?:fecha\s+l[ií]mite\s+de\s+pago\s+es|fecha\s+l[ií]mite\s+de\s+pago|pagar\s+antes\s+del?)\s*:??\s*([0-3]?\d)\s+([a-záéíóúñ]+)\s+(20\d{2})/i,
    /\b([0-3]?\d)\s+([a-záéíóúñ]+)\s+(20\d{2})\b/i,
  ];

  for (const pattern of monthNamePatterns) {
    const match = haystack.match(pattern);
    if (match) {
      const normalized = normalizeMonthNameDate(match[1], match[2], match[3]);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

export function extractInvoiceFields({ subject, body, html } = {}) {
  const haystack = [subject, body, html]
    .map(normalizeText)
    .filter(Boolean)
    .join('\n');

  if (!haystack) {
    return {
      amount: null,
      due_date: null,
    };
  }

  return {
    amount: extractAmount(haystack),
    due_date: extractDueDate(haystack),
  };
}
