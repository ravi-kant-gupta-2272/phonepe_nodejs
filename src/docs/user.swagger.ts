/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication APIs
 *   - name: Merchant
 *     description: Merchant account management
 */
/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: User registered successfully
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /user/reset:
 *   post:
 *     summary: Reset password (protected)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password reset successful
 */

/**
 * @swagger
 * /user/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Token refreshed
 */

/**
 * @swagger
 * /user/reset-link:
 *   post:
 *     summary: Send reset password link
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Reset link sent
 */

/**
 * @swagger
 * /user/register-link:
 *   post:
 *     summary: Send register link
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Register link sent
 */

/**
 * @swagger
 * /user/token-status:
 *   get:
 *     summary: Check token expiry status
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token status fetched
 */


export {};
