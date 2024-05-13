const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');
const RoomModel = require('../models/Room');
const RegistrationModel = require('../models/Registration');
const { requireAdmin } = require('../middlewares/auth');

router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await UserModel.find({}, '-password -usertype -created_at -__v')
            .populate('occupied_room');
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

router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findByIdAndUpdate(id, req.body, { new: true, fields: '-password -usertype -created_at -__v' });
        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/users/:id/room', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { roomId } = req.body;
        const room = await RoomModel.findById(roomId);
        if (!room){
            return res.status(400).json({ error: 'Room not found' });
        }
        const user = await UserModel.findByIdAndUpdate(id, { occupied_room: roomId }, { new: true, fields: '-password -usertype -created_at -__v' });
        room.tenants.push({ id: id, username: user.username, profile_img: user.profile_img });
        await room.save();
        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.occupied_room) {
            const room = await RoomModel.findById(user.occupied_room);
            if (room) {
                room.tenants = room.tenants.filter(tenant => tenant.id.toString() !== id);
                await room.save();
            }
        }
        await RegistrationModel.deleteOne({ user_id: id });
        await UserModel.deleteOne({ _id: id });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
