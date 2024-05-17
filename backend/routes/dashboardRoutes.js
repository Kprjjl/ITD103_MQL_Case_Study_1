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

// sales this year and last year (for comparison) response format should be like this: { thisYear: 10000, lastYear: 9000 }
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


// --------------------------------------------------------------

// TENANT DASHBOARD ROUTES

module.exports = router;
