import 'dotenv/config';

type dbType = {
  host: string,
  user: string,
  password: string,
  database: string,
  db_port: number,
  db_url: string
}

type appType = {
  port: string
}

type smtpType = {
  host: string,
  port: number,
  user: string,
  pass: string
}

interface dbConfigType{
  db: dbType,
  app: appType,
  smtp: smtpType,
  jwt: string,
  bcrypt_salt_rounds: number,
  encryption_key: string
}


const dbConfig:dbConfigType = {
  db:{
    host: process.env.HOST!,
    user: process.env.USER!,
    password: process.env.PASSWORD!,
    database: process.env.DATABASE!,
    db_port: Number(process.env.DB_PORT),
    db_url: process.env.DATABASE_URL!
  },
  app:{
    port: process.env.PORT!
  },
  smtp:{
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT)!,
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!
  },
  jwt: process.env.JWT_SECRET || "JWT_SECRET",
  bcrypt_salt_rounds: parseInt(process.env.BCRYPT_SALT_ROUNDS||"10") || 10,
  encryption_key: process.env.ENCRYPTION_KEY!
};

export default dbConfig;
