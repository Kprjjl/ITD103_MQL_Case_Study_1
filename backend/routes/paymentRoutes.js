const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middlewares/auth');

const PaymentModel = require('../models/Payment');
const RoomModel = require('../models/Room');
const UserModel = require('../models/User');

router.get('/payments', requireAdmin, async (req, res) => {
    try {
        const payments = await PaymentModel.find({}, '-__v -created_at').populate('paid_by').populate('room');
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error retrieving payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/payments', requireAdmin, async (req, res) => {
    try {
        // const { amount, paid_by, room: roomId } = req.body;
        // const room = await RoomModel.findOne({ _id: roomId }).exec();
        // if (!room) {
        //     return res.status(400).json({ error: 'Room not found' });
        // }
        // const user = await UserModel.findOne({ _id: paid_by }).exec();
        // if (!user) {
        //     return res.status(400).json({ error: 'User not found' });
        // }

        // if (room.lease) {
        //     const paymentPeriods = room.lease.payment_periods.filter(period => new Date() >= period.start_date && new Date() <= period.end_date);
        //     if (!paymentPeriods.length) {
        //         return res.status(400).json({ error: 'No payment period found' });
        //     }

        //     const currentPeriod = paymentPeriods[0];
        //     if (currentPeriod.payments_until_paid <= 0) {
        //         return res.status(400).json({ error: 'Payment period fully paid' });
        //     }
        // }


        const payment = new PaymentModel(req.body);
        await payment.save();
        const populatedPayment = await PaymentModel.findOne({_id: payment._id}).populate('paid_by').populate('room');
        res.status(201).json({_id: populatedPayment._id, room: populatedPayment.room.name, paid_by: populatedPayment.paid_by.username, 
            amount: populatedPayment.amount, date: populatedPayment.date, created_at: populatedPayment.created_at});
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/payments/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PaymentModel.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(payment);
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/payments/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await PaymentModel.findByIdAndDelete(id);
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
