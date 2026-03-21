import { Pool } from 'pg';
import config from '../config/config.js';

const pool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.db_port
});

export const connectDb = async () => {
  try {
    const client = await pool.connect();

    console.log("PostgreSQL connected");

    client.release();

  } catch (err: unknown) {
    console.error("Connection error", err);
    process.exit(1);
  }
};


pool.on("error", (err) => {
  console.error("PostgreSQL client error:", err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// export default pool;
