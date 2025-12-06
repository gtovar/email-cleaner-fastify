import models from "../db/models"

export async function getEventsQuery({ models, page = 1, perPage = 20, typei, userID }) {
  const { NotificationEvent } = models;

  const offset = (page - 1) * perPage;

  const where = {};
  if (type) where.type = type;
  if (userId) where.userId = userId;

  const { rows, count } = await NotificationEvent.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    offset,
    limit: perPage,
  });

  return {
    total: count,
    page,
    perPage,
    data: rows,
    data: rows.map((row) => row.toJSON())
  };
}
