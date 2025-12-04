'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NotificationEvents', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      userId: { type: Sequelize.STRING, allowNull: false },
      summary: { type: Sequelize.JSONB, defaultValue: {} },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('NotificationEvents', ['userId']);
    await queryInterface.addIndex('NotificationEvents', ['type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('NotificationEvents');
  }
};
