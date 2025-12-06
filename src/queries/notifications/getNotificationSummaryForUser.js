export async function getNotificationSummaryForUser({ models, userId }) {
  // Lee de donde tengas que leer: ActionHistory, NotificationEvent, etc.
  // No emite eventos, solo arma el summary.

  const { Suggetion } = models

  const suggetions = await Suggetion.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 20,
  });

  // Transformas a la forma que espera el frontend
  // Aquí invento un mapeo típico basado en lo que usas para suggestions.
  const summary = rows.map((row) => ({
    id: row.id,
    from: row.from,
    subject: row.subject,
    date: row.createdAt,
    isRead: row.isRead,
    category: row.category,
    attachmentSizeMb: row.attachmentSizeMb,
    suggestions: row.suggestions, // si guardas un array/JSON aquí
  }));

  return summary;
}
