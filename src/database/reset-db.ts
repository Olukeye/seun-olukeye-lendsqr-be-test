import knex from 'knex';
import config from './knexfile';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// A temporary connection (no DB selected)
const rootConnection = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
});

async function resetDatabase() {
  const dbName = process.env.DB_NAME!;

  try {
    console.log(`Dropping database '${dbName}' if it exists...`);
    await rootConnection.raw(`DROP DATABASE IF EXISTS \`${dbName}\`;`);

    console.log(`Creating database '${dbName}'...`);
    await rootConnection.raw(`CREATE DATABASE \`${dbName}\`;`);

    console.log('Running migrations...');
    const db = knex(dbConfig);
    await db.migrate.latest();

    console.log('Running seeds...');
    await db.seed.run();

    console.log(`Database '${dbName}' has been reset successfully.`);
    await db.destroy();
    await rootConnection.destroy();
  } catch (error) {
    console.error('Error resetting database:', error);
    await rootConnection.destroy();
    process.exit(1);
  }
}

resetDatabase();
