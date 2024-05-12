const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const { validateAndInsertPendingRegistration } = require('../controllers/registrationcontroller');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if ((emailOrUsername === adminEmail || emailOrUsername === adminUsername) && password === adminPassword) {
            const token = jwt.sign({ userType: 'admin' }, secretKey, { expiresIn: '24h' });
            return res.status(200).json({ token, userType: 'admin'});
        }

        const user = await UserModel.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] })
            .select('-created_at -__v');
        if (!user) {
            return res.status(400).json("User not found");
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json("Password is incorrect");
        }

        const token = jwt.sign({ userId: user._id, userType: user.usertype  }, secretKey, { expiresIn: '24h' });
        await UserModel.updateOne({ _id: user._id }, { status: 'online' });
        res.status(200).json({ token, userType: user.usertype });
    } catch (error) {
        console.error('Error handling login:', error);
        res.status(500).json("Internal server error");
    }
});

router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, secretKey);
        if (decoded.userType === 'admin') {
            return res.status(200).json("Admin logged out successfully");
        }

        // need to block token from being used again

        await UserModel.updateOne({ _id: decoded.userId }, { status: 'offline' });
        res.status(200).json("User logged out successfully");
    } catch (error) {
        console.error('Error handling logout:', error);
        res.status(500).json("Internal server error");
    }
});

router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const registrationData = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        }

        await validateAndInsertPendingRegistration(registrationData);
        res.json("Registration request submitted successfully");
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
