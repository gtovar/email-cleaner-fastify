'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('Notifications', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      emailId: S.STRING, subject: S.STRING, from: S.STRING,
      action: S.STRING, category: S.STRING,
      confidenceScore: S.FLOAT, confirmed: S.BOOLEAN,
      confirmedAt: S.DATE,
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
    });
  },
  async down(q) { await q.dropTable('Notifications'); }
};
