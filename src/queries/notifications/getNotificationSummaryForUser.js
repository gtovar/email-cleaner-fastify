// src/queries/notifications/getNotificationSummaryForUser.js

/**
 * Query CQRS-lite para el summary de notificaciones.
 *
 * FASE ACTUAL (HU16 / experimental)
 * ---------------------------------
 * - Solo devuelve datos demo (los mismos que tus tests esperan).
 * - No lee de la base de datos todavía.
 * - No emite eventos, no escribe nada.
 *
 * Firma estable para el futuro:
 *   getNotificationSummaryForUser({ models, userId })
 */
export async function getNotificationSummaryForUser({ models, userId }) {
  // Por ahora ignoramos models y userId, porque el sistema aún es single-user/demo.
  // Futuro: usar Notification / NotificationEvent filtrando por userId, fechas, etc.

  return [
    {
      id: 'test1',
      from: 'demo@example.com',
      subject: 'Demo summary',
      date: '2024-01-01',
      isRead: false,
      category: 'primary',
      attachmentSizeMb: 0,
      suggestions: ['archive'],
    },
    {
      id: 'test2',
      from: 'alerts@example.com',
      subject: 'Otra sugerencia demo',
      date: '2024-01-02',
      isRead: false,
      category: 'updates',
      attachmentSizeMb: 0,
      suggestions: ['keep'],
    },
  ];
}

