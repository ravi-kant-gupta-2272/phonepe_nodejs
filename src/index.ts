import express, {Application} from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js"
import config from './config/config.js';
import userRouter from './routes/user.routes.js';
import merchantRoute from './routes/merchant.account.routes.js'
import subscriptionsPlanRouter from './routes/subscriptions.plan.routes.js';
import paymentRouter from "../src/routes/payment.routes.js"
import globalError from './utils/global.error.js';
import {connectDb} from "./db/db.js";
import requestLogger from './middlewares/requestLogger.js';



const app:Application = express();

const port: number = Number(config.app.port) || 3000;

connectDb();

app.use(cors());

app.use(morgan('dev'));

app.use(express.json());

app.use(requestLogger);

// ***** user Routes ***** //
app.use("/api/user", userRouter);

// ***** merchant Routes ***** //
app.use("/api/merchant", merchantRoute);

// ***** Subscriptions Routes ***** //
app.use("/api/subscriptions", subscriptionsPlanRouter);

// ***** Payment Routes ***** //
app.use("/api",paymentRouter);

if (config.node_env !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ***** global error handle ***** //
app.use(globalError);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
