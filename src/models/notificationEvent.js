// src/models/notificationEvent.js
export default (sequelize, DataTypes) => {
  return sequelize.define('NotificationEvent', {
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    summary: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true
  });
};
