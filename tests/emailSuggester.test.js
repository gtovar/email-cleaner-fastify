import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';

const fetchMock = jest.fn();

jest.unstable_mockModule('node-fetch', () => ({
  default: fetchMock
}));

const { suggestActions } = await import('../src/services/emailSuggester.js');

describe('suggestActions', () => {
  const originalEnv = process.env.FASTAPI_URL;

  beforeEach(() => {
    fetchMock.mockReset();
    delete process.env.FASTAPI_URL;
  });

  afterEach(() => {
    process.env.FASTAPI_URL = originalEnv;
  });

  it('enriches emails with parsed suggestions from classifier service', async () => {
    const emails = [
      { id: '1', subject: 'Hello', suggestions: [] },
      { id: '2', subject: 'Promo', suggestions: [] }
    ];

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        1: [
          JSON.stringify({ action: 'archive', category: 'promotions', confidence_score: 0.91 })
        ],
        2: [{ action: 'keep', category: 'inbox', confidence_score: 0.42 }]
      })
    });

    const result = await suggestActions(emails);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/suggest',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    expect(result.emails).toHaveLength(2);
    expect(result.emails[0].suggestions).toEqual([
      { action: 'archive', category: 'promotions', confidence_score: 0.91 }
    ]);
    expect(result.emails[1].suggestions).toEqual([
      { action: 'keep', category: 'inbox', confidence_score: 0.42 }
    ]);
  });

  it('returns empty suggestions when classifier request fails', async () => {
    const emails = [{ id: '1', subject: 'Hello' }];
    fetchMock.mockRejectedValue(new Error('network down'));

    const result = await suggestActions(emails);

    expect(result.emails).toEqual([
      {
        id: '1',
        subject: 'Hello',
        suggestions: []
      }
    ]);
  });
});
