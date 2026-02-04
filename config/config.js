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
  jwt: process.env.JWT_SECRET || 'your_jwt_secret_key',
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 10
  
};

export default dbConfig;
