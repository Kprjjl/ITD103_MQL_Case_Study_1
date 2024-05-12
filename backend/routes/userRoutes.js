const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');
const { requireAdmin } = require('../middlewares/auth');

router.get('/users', requireAdmin, async (req, res) => {
    try {
        // '_id profile_img firstname lastname username email status occupied_room contact_no'
        const users = await UserModel.find({}, '-password -usertype -created_at -__v');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id, '-password -usertype -created_at -__v').exec();
        res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
