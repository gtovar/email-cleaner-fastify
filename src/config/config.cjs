require('dotenv').config();

const parseDatabaseUrl = (url) => {
  try {
    const { URL } = require('url');
    const u = new URL(url);
    return {
      username: u.username || 'postgres',
      password: u.password || null,
      database: (u.pathname || '/postgres').slice(1),
      host: u.hostname || 'localhost',
      port: Number(u.port || 5432),
      dialect: 'postgres'
    };
  } catch {
    return null;
  }
};

const fromUrl = process.env.DATABASE_URL ? parseDatabaseUrl(process.env.DATABASE_URL) : null;


// Fallback por entorno si no hay DATABASE_URL
const base = fromUrl || {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || 'email_cleaner',
    host: process.env.DB_HOST || '127.0.0.1',
    port:     Number(process.env.DB_PORT || 5432),
    dialect:  'postgres'
};

module.exports = {
    development: base,
    test:        base,
    production:  base
};
