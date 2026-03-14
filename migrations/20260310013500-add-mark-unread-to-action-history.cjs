'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_ActionHistories_action\" ADD VALUE IF NOT EXISTS 'mark_unread';"
    );
  },

  async down() {
    // PostgreSQL enum value removal is intentionally not automated here.
    return Promise.resolve();
  }
};
