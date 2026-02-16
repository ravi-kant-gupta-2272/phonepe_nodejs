import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/config.js';
import userRouter from './routes/user.routes.js';
import merchantRoute from './routes/merchant.account.routes.js'
import subscriptionsPlanRouter from './routes/subscriptions.plan.routes.js';
import globalError from './utils/global.error.js';
import pool from "./db/db.js";



const app = express();

const port = config.app.port || 3000;

app.use(cors());

app.use(morgan('dev'));

app.use(express.json());

// ***** user Routes ***** //
app.use("/api/user", userRouter);

// ***** merchant Routes ***** //
app.use("/api/merchant", merchantRoute);

// ***** Subscriptions Routes ***** //
app.use("/api/subscriptions", subscriptionsPlanRouter);

// ***** global error handle ***** //
app.use(globalError);

app.listen(port,'0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
