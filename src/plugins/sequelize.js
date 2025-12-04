import fp from 'fastify-plugin';
import { Sequelize, DataTypes } from 'sequelize';
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function dbConnector(fastify, options) {
  const sequelize = new Sequelize(process.env.DATABASE_URL);

  try {
    await sequelize.authenticate();
    fastify.log.info('Connection has been established successfully.');
  } catch (err) {
    fastify.log.error('Unable to connect to the database:', err);
    throw err;
  }

  const Token = (await import(path.join(__dirname, '../models/token.js'))).default(sequelize, DataTypes);
  const ActionHistory = (await import(path.join(__dirname, '../models/actionHistory.js'))).default(sequelize, DataTypes);
  const Notification = (await import(path.join(__dirname, '../models/notification.js'))).default(sequelize, DataTypes);
  const NotificationEvent = (await import(path.join(__dirname, '../models/notificationEvent.js'))).default(sequelize, DataTypes);

  fastify.decorate('sequelize', sequelize);
  fastify.decorate('models', { Token, ActionHistory, Notification, NotificationEvent });
}

export default fp(dbConnector);
