import 'dotenv/config';

const dbConfig = {
  db:{
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    db_port: process.env.DB_PORT,
    db_url: process.env.DATABASE_URL
  },
  app:{
    port: process.env.PORT
  },
  smtp:{
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  jwt: process.env.JWT_SECRET || "JWT_SECRET",
  bcrypt_salt_rounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  encryption_key: process.env.ENCRYPTION_KEY,
  base_url: process.env.DEV_BASE_URL
};

export default dbConfig;
