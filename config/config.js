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
  }
  
};

export default dbConfig;
