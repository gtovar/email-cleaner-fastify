'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ReceiptResponses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      emailId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      response: {
        type: Sequelize.ENUM('paid', 'ignore'),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('ReceiptResponses', ['userId', 'emailId'], {
      unique: true,
      name: 'receipt_responses_user_email_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ReceiptResponses');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ReceiptResponses_response";');
  }
};
