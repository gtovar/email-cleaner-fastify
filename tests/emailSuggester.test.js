// tests/emailSuggester.test.js
// Tests para src/services/emailSuggester.js

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
const { suggestActions } = await import('../src/services/emailSuggester.js');

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
          '{"action":"archive","reason":"low_priority"}',
          { action: 'keep', reason: 'important_contact' },
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
        { action: 'archive', reason: 'low_priority' },
        { action: 'keep', reason: 'important_contact' },
        { action: '123' }
      ]
    });

    expect(second).toEqual({
      id: '2',
      subject: 'Promo',
      suggestions: [
        { action: 'delete' }
      ]
    });
  });

  it('falls back to empty suggestions when ML fails', async () => {
    const emails = [{ id: '1', subject: 'Hello' }];

    classifyEmailsMock.mockRejectedValue(new Error('network down'));

    const result = await suggestActions(emails);

    expect(result).toEqual({
      emails: [
        { id: '1', subject: 'Hello', suggestions: [] }
      ]
    });
  });

  it('throws TypeError when emails is not an array', async () => {
    await expect(suggestActions(null)).rejects.toThrow(TypeError);
  });
});

