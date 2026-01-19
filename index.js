const express = require('express');
const cors = require('cors');
const config = require('./config');
const userRouter = require('./routes/user.routes')
// const merchantRoute = require('./routes/merchant.account.routes')
const globalError = require("./utils/global.error")
const pool = require("./db/db");

const app = express();

const port = config.app.port || 3000;

app.use(cors());
app.use(express.json());

// ***** user Routes *****
app.use("/api", userRouter);

// ***** merchant Routes *****
// app.use("/api", merchantRoute);

app.get('/', (req, res) => {
  res.send('Phonepe APIs is running');
});

// ***** global error handle *****
app.use(globalError);



app.listen(port,'0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
