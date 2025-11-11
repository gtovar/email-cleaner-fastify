import fp from 'fastify-plugin';
import { Sequelize, DataTypes } from 'sequelize';
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function dbConnector(fastify, options) {
  const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();
    fastify.log.info('Conexión a PostgreSQL exitosa');
  } catch (err) {
    fastify.log.error('Error conectando a DB:', err);
    throw err;
  }

  const Token = (await import(path.join(__dirname, '../models/token.js'))).default(sequelize, DataTypes);
  const ActionHistory = (await import(path.join(__dirname, '../models/actionHistory.js'))).default(sequelize, DataTypes);
  const Notification = (await import(path.join(__dirname, '../models/notification.js'))).default(sequelize, DataTypes);

  fastify.decorate('sequelize', sequelize);
  fastify.decorate('models', { Token, ActionHistory, Notification });
}

export default fp(dbConnector);
