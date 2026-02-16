import { Pool } from 'pg';
import config from '../config/config.js';

const pool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.db_port
});

pool.connect()
  .then(() => {
    console.log("PostgreSQL connected");
  })
  .catch(err => console.error("Connection error", err));

pool.on("error", (err) => {
  console.error("PostgreSQL client error:", err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

export default pool;
