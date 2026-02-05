import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/config.js';
import userRouter from './routes/user.routes.js';
import merchantRoute from './routes/merchant.account.routes.js'
import globalError from './utils/global.error.js';
import pool from "./db/db.js";


const app = express();

const port = config.app.port || 3000;

app.use(cors());

// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, 'project.log'),
//   { flags: 'a' } // append mode
// );

app.use(morgan('dev'));
// app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json());
// console.log('Log file will be created at:', path.join(__dirname, 'project.log'));

// ***** user Routes ***** //
app.use("/api/user", userRouter);

// ***** merchant Routes ***** //
app.use("/api/merchant", merchantRoute);

app.get('/', (req, res) => {
  res.send('Phonepe APIs is running');
});

// ***** global error handle ***** //
app.use(globalError);

app.listen(port,'0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
