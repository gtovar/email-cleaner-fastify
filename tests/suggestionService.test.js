// tests/suggestionService.test.js
// Tests para src/services/suggestionService.js

import {
  describe,
  it,
  expect,
  beforeEach,
  jest
} from '@jest/globals';

// Mock del cliente ML
const classifyEmailsMock = jest.fn();

jest.unstable_mockModule('../src/services/mlClient.js', () => ({
  classifyEmails: classifyEmailsMock
}));

// Import dinámico del módulo bajo prueba (para que el mock ya esté aplicado)
const { suggestActions } = await import('../src/services/suggestionService.js');

describe('suggestActions', () => {
  const originalTimeout = process.env.ML_TIMEOUT_MS;

  beforeEach(() => {
    classifyEmailsMock.mockReset();
    delete process.env.ML_TIMEOUT_MS;
  });

  afterAll(() => {
    if (originalTimeout !== undefined) {
      process.env.ML_TIMEOUT_MS = originalTimeout;
    } else {
      delete process.env.ML_TIMEOUT_MS;
    }
  });

  it('enriches emails with normalized suggestions from ML', async () => {
    const emails = [
      { id: '1', subject: 'Hello' },
      { id: '2', subject: 'Promo' }
    ];

    classifyEmailsMock.mockResolvedValue({
      suggestionsById: {
        '1': [
          '{"action":"archive","clasificacion":"bulk","confidence_score":0.9}',
          { action: 'keep', clasificacion: 'important_contact', confidence_score: 0.8 },
          123
        ],
        '2': ['delete']
      }
    });

    process.env.ML_TIMEOUT_MS = '3000';

    const result = await suggestActions(emails);

    expect(classifyEmailsMock).toHaveBeenCalledTimes(1);
    expect(classifyEmailsMock).toHaveBeenCalledWith(emails, { timeoutMs: 3000 });

    expect(result.emails).toHaveLength(2);

    const [first, second] = result.emails;

    expect(first).toEqual({
      id: '1',
      subject: 'Hello',
      suggestions: [
        { action: 'archive', clasificacion: 'bulk', confidence_score: 0.9 },
        { action: 'keep', clasificacion: 'important_contact', confidence_score: 0.8 },
        { action: '123', clasificacion: 'unknown', confidence_score: 0.5 }
      ]
    });

    expect(second).toEqual({
      id: '2',
      subject: 'Promo',
      suggestions: [
        { action: 'delete', clasificacion: 'unknown', confidence_score: 0.5 }
      ]
    });
  });

  it('enriches emails when ML returns an array of enriched emails', async () => {
    const emails = [
      { id: '1', subject: 'Hello' },
      { id: '2', subject: 'Promo' }
    ];

    // Simulamos el formato real del microservicio Python:
    classifyEmailsMock.mockResolvedValue([
      {
        id: '1',
        suggestions: [
          { action: 'archive', clasificacion: 'promotions_old', confidence_score: 0.85 }
        ]
      },
      {
        id: '2',
        suggestions: [
          { action: 'delete', clasificacion: 'stale_unread', confidence_score: 0.9 }
        ]
      }
    ]);

    const result = await suggestActions(emails);

    expect(result.emails).toEqual([
      {
        id: '1',
        subject: 'Hello',
        suggestions: [
          { action: 'archive', clasificacion: 'promotions_old', confidence_score: 0.85 }
        ]
      },
      {
        id: '2',
        subject: 'Promo',
        suggestions: [
          { action: 'delete', clasificacion: 'stale_unread', confidence_score: 0.9 }
        ]
      }
    ]);
  });

  it('falls back to empty suggestions when ML fails', async () => {
    const emails = [{ id: '1', subject: 'Hello' }];

    classifyEmailsMock.mockRejectedValue(new Error('network down'));

    // Silenciar el console.error esperado en este escenario
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await suggestActions(emails);

    // (Opcional) verificar que efectivamente loggea el error
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();

    expect(result).toEqual({
      emails: [{ id: '1', subject: 'Hello', suggestions: [] }]
    });
  });

  it('throws TypeError when emails is not an array', async () => {
    await expect(suggestActions(null)).rejects.toThrow(TypeError);
  });
});
