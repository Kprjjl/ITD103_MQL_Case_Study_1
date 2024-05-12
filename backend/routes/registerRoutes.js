const express = require('express');
const router = express.Router();
const { approvePendingRegistration, disapprovePendingRegistration } = require('../controllers/registrationcontroller');
const { requireAdmin } = require('../middlewares/auth');

const RegistrationModel = require('../models/Registration');

router.get('/registrations', requireAdmin, async (req, res) => {
    try {
        const registrations = await RegistrationModel.find({}, '_id firstname lastname email username status').exec();
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error retrieving registrations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/approve-registration/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await approvePendingRegistration(id);
        res.status(200).json({ message: 'Pending registration approved successfully' });
    } catch (error) {
        console.error('Error approving registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/disapprove-registration/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await disapprovePendingRegistration(id);
        res.status(200).json({ message: 'Pending registration disapproved successfully' });
    } catch (error) {
        console.error('Error disapproving registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
