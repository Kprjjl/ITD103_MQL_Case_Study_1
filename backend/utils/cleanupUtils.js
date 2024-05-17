const cron = require('node-cron');
const PendingReg = require('../models/Registration');
const RoomModel = require('../models/Room');

cron.schedule('0 0 * * *', async () => {
    try {
        await cleanupStalePendingRegistrations();
        console.log('Cleanup task completed successfully');
    } catch (error) {
        console.error('Error cleaning up pending registrations:', error);
    }
});

cron.schedule('* * * * *', async () => {
    try {
        await updateLeasePaymentStatus();
        console.log('Lease payment status updated successfully');
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
});

async function cleanupStalePendingRegistrations() {
    const thresholdDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    await PendingReg.deleteMany({ date_created: { $lt: thresholdDate } });
}

async function updateLeasePaymentStatus(){
    const rooms = await RoomModel.find({}).exec();
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (!room.lease) {
            return;
        }
        let carry_over = 0;
        for (let i = 0; i < room.lease.payment_periods.length; i++) {
            if (carry_over > 0) {
                room.lease.payment_periods[i].payments_until_paid += carry_over;
                carry_over = 0;
            }
            if (room.lease.payment_periods[i].payments_until_paid <= 0) {
                room.lease.payment_periods[i].payment_status = 'paid';
                if (room.lease.payment_periods[i].payments_until_paid < 0) {
                    carry_over = Math.abs(room.lease.payment_periods[i].payments_until_paid);
                    room.lease.payment_periods[i].payments_until_paid = 0;
                }
            } else if (room.lease.payment_periods[i].payments_until_paid < room.lease.payment_periods[i].rent_amount) {
                room.lease.payment_periods[i].payment_status = 'partially paid';
            }
            if (room.lease.payment_periods[i].end_date < new Date()) {
                room.lease.payment_periods[i].payment_status = 'overdue';
            }
        }
        await room.save();
    }
}

module.exports = {
    cleanupStalePendingRegistrations,
    updateLeasePaymentStatus
};
