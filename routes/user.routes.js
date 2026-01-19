const express = require('express');
const registerUser = require('../controllers/user/user.register');
const loginUser = require('../controllers/user/user.login');
const resetUserPassword = require("../controllers/user/password.reset")
const refeshTokenController = require("../controllers/user/refresh.token")


const userRouter = express.Router();

// Register user route
userRouter.post("/register", registerUser);

// Login user route
userRouter.post("/login", loginUser);

// Reset Password route
userRouter.post("/reset", resetUserPassword);

// Refresh token route
userRouter.post('/refresh/token', refeshTokenController);

module.exports = userRouter;