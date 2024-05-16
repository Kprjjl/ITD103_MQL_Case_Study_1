const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    paid_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rooms',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

PaymentSchema.post('save', async function(doc) {
    try{
        await updateLeasePaymentStatus(doc.room, doc.amount);
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
});

PaymentSchema.post('findOneAndUpdate', async function(result) {
    try{
        await updateLeasePaymentStatus(result.room, doc.amount);
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
});

async function updateLeasePaymentStatus(roomId) {
    console.log("model: ", RoomModel)
    const room = await RoomModel.findById(roomId).exec();
    const lease = room.lease;
    const payment_periods = lease.payment_periods;
    const dateNow = new Date();
    const currentPeriod = payment_periods.find(period => dateNow >= period.start_date && dateNow <= period.end_date);
    currentPeriod.payments_until_paid -= doc.amount;
    await currentPeriod.save();
}

const PaymentModel = mongoose.model('payments', PaymentSchema);
module.exports = PaymentModel
