'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('Tokens', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      email: { type: S.STRING, allowNull: false, unique: true },
      access_token: { type: S.TEXT, allowNull: false },
      refresh_token: { type: S.TEXT },
      expiry_date: { type: S.DATE },
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
    });
  },
  async down(q) { await q.dropTable('Tokens'); }
};

