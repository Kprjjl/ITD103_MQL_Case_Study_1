const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middlewares/auth');

const RoomModel = require('../models/Room');
const UserModel = require('../models/User');
const PaymentModel = require('../models/Payment');
const RegistrationModel = require('../models/Registration');

// ADMIN DASHBOARD ROUTES

// --------------------------- CARDS ---------------------------
// total number of rooms due to pay this month
// just use existing /rooms route

// total number of registrations
// just use existing /registrations route

// total number of users
// just use existing /users route

router.get('/sales-statistics', requireAdmin, async (req, res) => {
    try {
        const thisYear = await PaymentModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(new Date().getFullYear(), 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);
        const lastYear = await PaymentModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(new Date().getFullYear() - 1, 0, 1),
                        $lt: new Date(new Date().getFullYear(), 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);
        res.status(200).json({
            thisYear: thisYear.length ? thisYear[0].total : 0,
            lastYear: lastYear.length ? lastYear[0].total : 0,
        });
    } catch (error) {
        console.error('Error retrieving sales:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// -------------------------------------------------------------

// --------------------------- CHARTS ---------------------------
router.get('/room-payment-status-counts', requireAdmin, async (req, res) => {
    try {
        const rooms = await RoomModel.find({ 'lease.tenants': { $ne: [] } });
        const paid = rooms.filter(room => room.lease.payment_status === 'paid').length;
        const unpaid = rooms.filter(room => room.lease.payment_status === 'unpaid').length;
        const partiallyPaid = rooms.filter(room => room.lease.payment_status === 'partially paid').length;
        const overdue = rooms.filter(room => room.lease.payment_status === 'overdue').length;
        res.status(200).json({ paid, unpaid, partiallyPaid, overdue });
    } catch (error) {
        console.error('Error retrieving room payment status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/payments-per-month', requireAdmin, async (req, res) => {
    try {
        const payments = await PaymentModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(new Date().getFullYear(), 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$created_at' },
                    total: { $sum: '$amount' },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
        res.status(200).json(payments.map(payment => payment.total));
    } catch (error) {
        console.error('Error retrieving payments per month:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/payments-per-year', requireAdmin, async (req, res) => {
    try {
        const payments = await PaymentModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(new Date().getFullYear() - 4, 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: { $year: '$created_at' },
                    total: { $sum: '$amount' },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
        res.status(200).json(payments.map(payment => payment.total));
    } catch (error) {
        console.error('Error retrieving payments per year:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --------------------------------------------------------------

// TENANT DASHBOARD ROUTES

module.exports = router;
