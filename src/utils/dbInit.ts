import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function ensureDatabaseExists(): Promise<void> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'demo_credit';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database "${dbName}" is ready.`);
    await connection.end();
  } catch (error) {
    console.error('Failed to ensure database exists:', error);
    process.exit(1);
  }
}
