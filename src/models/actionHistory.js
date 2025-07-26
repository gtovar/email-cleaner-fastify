// src/models/actionHistory.js
export default (sequelize, DataTypes) => {
  return sequelize.define('ActionHistory', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emailId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM('accept', 'reject', 'delete', 'archive', 'move'),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    details: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  });
};