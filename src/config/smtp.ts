import nodemailer from 'nodemailer';
import dbConfig from './config.js';

const transporter = nodemailer.createTransport({
  host: dbConfig.smtp.host,
  port: dbConfig.smtp.port,
  secure: false, // TLS
  auth: {
    user: dbConfig.smtp.user,
    pass: dbConfig.smtp.pass,
  },
});

export default transporter;