import dotenv from 'dotenv';
import { Knex } from 'knex';
import path from 'path';
import { ensureDatabaseExists } from '../utils/dbInit';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const migrationsDir = path.resolve(__dirname, './migrations');
const seedsDir = path.resolve(__dirname, './seeds');

(async () => {
  await ensureDatabaseExists();
})();


const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD  || '',
      database: process.env.DB_NAME  || 'lendqr_demo_credit',
      charset: 'utf8mb4',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'user_migrations',
      directory: migrationsDir,
      extension: 'ts',
    },
    seeds: {
     directory: seedsDir,
      extension: 'ts',
    },
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
      extension: 'ts',
    },
  },
  test: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'demo_credit_test',
      charset: 'utf8mb4',
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: seedsDir,
      extension: 'ts',
    },
  },
};

export default config;