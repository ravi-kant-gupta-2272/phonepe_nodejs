import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import userRouter from './routes/user.routes.js';
import merchantRoute from './routes/merchant.account.routes.js'
import globalError from './utils/global.error.js';
import pool from "./db/db.js";


const app = express();

const port = config.app.port || 3000;

app.use(cors());
app.use(express.json());

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
