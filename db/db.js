const { Pool } = require("pg");
const config = require("../config");


const createUsersTable = async () => {
   const dropQuery = `DROP TABLE IF EXISTS users;`;

  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      token VARCHAR(255),
      is_active BOOLEAN DEFAULT FALSE,
      last_change_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  

  try {
    // await pool.query(dropQuery);
    await pool.query(query);

    console.log("Users table created successfully");
  } catch (error) {
    console.error("Error creating table:", error.message);
  }
};

const createMerchantTable = async () => {
  const dropQuery = `DROP TABLE IF EXISTS merchants;`;

  const createQuery = `
    CREATE TABLE IF NOT EXISTS merchants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        callback_url TEXT NOT NULL,
        webhook_username TEXT NOT NULL,
        webhook_password TEXT NOT NULL,
        client_id VARCHAR(150) NOT NULL,
        client_version VARCHAR(20) NOT NULL,
        client_secret TEXT NOT NULL,
        environment VARCHAR(20) NOT NULL
            CHECK (environment IN ('sandbox', 'production')),
        created_by INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );`;

  try {
    // Delete the table if it exists, then recreate it
    // await pool.query(dropQuery);
    await pool.query(createQuery);

    console.log("merchants table recreated successfully");
  } catch (error) {
    console.error("Error in creating merchants table:", error.message);
  }
};


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
    createUsersTable();
    createMerchantTable();
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

module.exports = pool;
