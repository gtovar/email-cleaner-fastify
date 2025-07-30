// src/models/notification.js
export default (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    emailId: DataTypes.STRING,
    subject: DataTypes.STRING,
    from: DataTypes.STRING,
    action: DataTypes.STRING, // 'archive', 'delete', etc.
    category: DataTypes.STRING,
    confidenceScore: DataTypes.FLOAT,
    confirmed: DataTypes.BOOLEAN, // true si el usuario la aceptó
    confirmedAt: DataTypes.DATE
  });

  return Notification;
};
