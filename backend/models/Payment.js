const mongoose = require('mongoose');
const RoomModel = require('./Room');
const { updateLeasePaymentStatus } = require('../utils/leaseUtils');

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
        await updateLeasePaymentStatus(result.room, result.amount);
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
});

PaymentSchema.pre('findByIdAndDelete', async function(next) {
    try{
        await updateLeasePaymentStatus(this.room, this.amount, isDelete=true);
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
    next();
});

PaymentSchema.pre('findByOneAndDelete', async function(next) {
    try{
        await updateLeasePaymentStatus(this.room, this.amount, isDelete=true);
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
    next();
});


const PaymentModel = mongoose.model('payments', PaymentSchema);
module.exports = PaymentModel
