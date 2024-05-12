const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middlewares/auth');
const RoomModel = require('../models/Room');

router.get('/rooms', requireAdmin, async (req, res) => {
    try {
        const rooms = await RoomModel.find({}, '-__v -created_at');
        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error retrieving rooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/rooms/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const room = await RoomModel.findById(id, '-__v -created_at').exec();
        res.status(200).json(room);
    } catch (error) {
        console.error('Error retrieving room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/rooms', requireAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const newRoom = new RoomModel({ name });
        await newRoom.save();
        res.status(200).json({ message: 'Room added successfully', room: newRoom});
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/rooms/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Room name is required' });
        }
        const room = await RoomModel
            .findByIdAndUpdate(id, {
                name
            }, { new: true })
            .exec();
        res.status(200).json({ message: 'Room updated successfully', room });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/rooms/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await RoomModel.findByIdAndDelete(id).exec();
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/rooms/:id/lease', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { rent_amount, start_date, end_date, payment_frequency, num_terms } = req.body;
        if (!rent_amount) {
            return res.status(400).json({ error: 'Rent amount is required' });
        }
        const room = await RoomModel.findById(id).exec();
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        if (!room.lease) {
            room.lease = {};
        }
        room.lease.rent_amount = rent_amount;
        if (start_date) {
            room.lease.start_date = start_date;
        }
        if (end_date) {
            room.lease.end_date = end_date;
        }
        if (payment_frequency) {
            room.lease.payment_frequency = payment_frequency;
        }
        if (num_terms) {
            room.lease.num_terms = num_terms;
        }
        await room.save();
        res.status(200).json({ message: 'Room lease updated successfully', room });
    } catch (error) {
        console.error('Error updating room lease:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
