const cron = require('node-cron');
const PendingReg = require('../models/Registration');

cron.schedule('0 0 * * *', async () => {
    try {
        await cleanupStalePendingRegistrations();
        console.log('Cleanup task completed successfully');
    } catch (error) {
        console.error('Error cleaning up pending registrations:', error);
    }
});

async function cleanupStalePendingRegistrations() {
    const thresholdDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    await PendingReg.deleteMany({ date_created: { $lt: thresholdDate } });
}

module.exports = {
    cleanupStalePendingRegistrations
};
