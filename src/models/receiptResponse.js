export default (sequelize, DataTypes) => {
  return sequelize.define(
    'ReceiptResponse',
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emailId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      response: {
        type: DataTypes.ENUM('paid', 'ignore'),
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['userId', 'emailId'],
        },
      ],
    },
  );
};
