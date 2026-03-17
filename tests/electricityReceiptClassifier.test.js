import { describe, expect, it } from '@jest/globals';

import {
  classifyElectricityReceipt,
  ELECTRICITY_RECEIPT_CONFIDENCE,
  ELECTRICITY_RECEIPT_METHOD,
  ELECTRICITY_RECEIPT_REASON,
  ELECTRICITY_RECEIPT_TYPES,
} from '../src/services/receiptDetection/electricityReceiptClassifier.js';

const DATASET = [
  {
    name: 'positive: clear bill by sender and content',
    input: {
      subject: 'Tu recibo CFE ya está disponible',
      sender: 'facturacion@cfe.mx',
      body: 'Consulta tu recibo de luz y realiza tu pago antes del vencimiento.',
    },
    expected: {
      type: ELECTRICITY_RECEIPT_TYPES.INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.HIGH,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.MATCHED_SENDER_AND_KEYWORDS,
    },
  },
  {
    name: 'positive: clear bill by content with imperfect sender',
    input: {
      subject: 'Aviso de pago de servicio eléctrico',
      sender: 'notificaciones@servicios-en-linea.com',
      body: 'Tu recibo de electricidad vence el 18 de abril. Importe pendiente disponible en portal.',
    },
    expected: {
      type: ELECTRICITY_RECEIPT_TYPES.INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.MEDIUM,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.MATCHED_SENDER_AND_KEYWORDS,
    },
  },
  {
    name: 'positive: payment reminder from trusted sender',
    input: {
      subject: 'Recordatorio: pago pendiente de luz',
      sender: 'avisos@cfe.mx',
      body: 'Evita recargos. Tu servicio de luz tiene pago pendiente y fecha límite próxima.',
    },
    expected: {
      type: ELECTRICITY_RECEIPT_TYPES.INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.HIGH,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.MATCHED_SENDER_AND_KEYWORDS,
    },
  },
  {
    name: 'negative: commercial promotion',
    input: {
      subject: 'Promoción especial: ahorra en electrodomésticos',
      sender: 'promo@tienda.com',
      body: 'Descuento por tiempo limitado. Suscríbete para recibir más ofertas.',
    },
    expected: {
      type: ELECTRICITY_RECEIPT_TYPES.NOT_INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.HIGH,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.NEGATIVE_SIGNAL,
    },
  },
  {
    name: 'negative: generic newsletter',
    input: {
      subject: 'Newsletter semanal de tecnología',
      sender: 'newsletter@blogtech.com',
      body: 'Estos son los artículos más leídos de la semana. Unsubscribe here.',
    },
    expected: {
      type: ELECTRICITY_RECEIPT_TYPES.NOT_INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.HIGH,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.NEGATIVE_SIGNAL,
    },
  },
  {
    name: 'negative: work email without invoice context',
    input: {
      subject: 'Reunión del equipo mañana',
      sender: 'manager@empresa.com',
      body: 'Te comparto agenda y pendientes para la reunión de seguimiento.',
    },
    expected: {
      type: ELECTRICITY_RECEIPT_TYPES.NOT_INVOICE,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.MEDIUM,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.NEGATIVE_SIGNAL,
    },
  },
  {
    name: 'ambiguous: payment with no electricity context',
    input: {
      subject: 'Confirmación de pago recibido',
      sender: 'pagos@servicios.com',
      body: 'Tu pago fue procesado correctamente. Gracias por utilizar nuestros servicios.',
    },
    expected: {
      type: ELECTRICITY_RECEIPT_TYPES.UNKNOWN,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.LOW,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.INSUFFICIENT_SIGNAL,
    },
  },
  {
    name: 'ambiguous: general services statement',
    input: {
      subject: 'Estado de cuenta de servicios',
      sender: 'cuentas@proveedor.com',
      body: 'Consulta el resumen de tus servicios contratados y movimientos recientes.',
    },
    expected: {
      type: ELECTRICITY_RECEIPT_TYPES.UNKNOWN,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.LOW,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.INSUFFICIENT_SIGNAL,
    },
  },
];

describe('classifyElectricityReceipt', () => {
  it.each(DATASET)('$name', ({ input, expected }) => {
    expect(classifyElectricityReceipt(input)).toEqual(expected);
  });

  it('returns unknown when strong negative and positive electricity signals are mixed', () => {
    expect(
      classifyElectricityReceipt({
        subject: 'Promoción CFE: descuento en tu factura de luz',
        sender: 'promo@cfe.mx',
        body: 'Unsubscribe aquí. Consulta tu factura de luz y tu pago pendiente.',
      })
    ).toEqual({
      type: ELECTRICITY_RECEIPT_TYPES.UNKNOWN,
      confidence: ELECTRICITY_RECEIPT_CONFIDENCE.LOW,
      method: ELECTRICITY_RECEIPT_METHOD,
      reason: ELECTRICITY_RECEIPT_REASON.INSUFFICIENT_SIGNAL,
    });
  });

  it('throws when input is not an object', () => {
    expect(() => classifyElectricityReceipt(null)).toThrow(TypeError);
  });
});
