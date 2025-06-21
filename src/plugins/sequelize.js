import fp from 'fastify-plugin';
import { Sequelize } from 'sequelize';
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';


// Para resolver rutas con ESM
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

  // Carga todos los modelos (puedes automatizar esto en proyectos grandes)
  const Token = (await import(path.join(__dirname, '../models/token.js'))).default(sequelize);

  // Agrega los modelos y la instancia a fastify
  fastify.decorate('sequelize', sequelize);
  fastify.decorate('models', { Token });
}

export default fp(dbConnector);
