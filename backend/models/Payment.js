const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    paid_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lease: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const PaymentModel = mongoose.model('payments', PaymentSchema);
module.exports = PaymentModel;