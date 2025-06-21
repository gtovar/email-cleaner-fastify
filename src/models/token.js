import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Token = sequelize.define('Token', {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    access_token: { type: DataTypes.TEXT, allowNull: false },
    refresh_token: { type: DataTypes.TEXT },
    expiry_date: { type: DataTypes.DATE }
  });
  return Token;
};
