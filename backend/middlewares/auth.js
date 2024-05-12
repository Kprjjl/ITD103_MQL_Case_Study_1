const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
const UserModel = require('../models/User');

const requireAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const decoded = jwt.verify(token, secretKey);
        const user = await UserModel.findById(decoded.userId);
        if (decoded.userType !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { requireAdmin };