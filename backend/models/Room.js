const mongoose = require('mongoose');
const { generatePaymentPeriods } = require('../utils/leaseUtils');


const PaymentPeriodSchema = new mongoose.Schema({
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    payment_status: {
        type: String,
        enum: ['paid', 'unpaid', 'overdue', 'partially paid'],
        default: 'unpaid'
    },
    rent_amount: {
        type: Number,
        required: true
    },
    payments_until_paid: {
        type: Number,
        required: true
    }
});


const LeaseSchema = new mongoose.Schema({
    rent_amount: {
        type: Number,
        required: true
    },
    payment_frequency: {
        type: String,
        enum: ['monthly', 'quarterly', 'semi-annually', 'annually', 'one-time'],
        default: 'monthly'
    },
    num_terms: {
        type: Number,
        required: true,
        default: 1
    },
    start_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    end_date: {
        type: Date,
        required: true,
        default: function () {
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            return oneYearFromNow;
        }
    },
    payment_periods: [PaymentPeriodSchema],
    payment_status: {
        type: String,
        enum: ['paid', 'unpaid', 'overdue', 'partially paid'],
        default: 'unpaid'
    },

    created_at: {
        type: Date,
        default: Date.now
    }
});

LeaseSchema.pre('save', async function (next) {
    const lease = this;
    lease.payment_periods = generatePaymentPeriods(lease);
    next();
});


const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    details: {
        type: String,
        default: ''
    },
    lease: {
        type: LeaseSchema
    },
    tenants: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username:{
            type: String
        },
        profile_img: {
            type: String
        }
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});


// PaymentPeriodSchema.post('save', async function(doc) {
//     if (this.payments_until_paid <= 0) {
//         this.payment_status = 'paid';
//     } else if (this.payments_until_paid < this.rent_amount) {
//         this.payment_status = 'partially paid';
//     } else if ((this.end_date < new Date()) && (this.payments_until_paid > 0)) {
//         this.payment_status = 'overdue';
//     } else {
//         this.payment_status = 'unpaid';
//     }
//     try{
//         const lease = this.parent();
//         lease.payment_status = this.payment_status;
//         await lease.save();
//     } catch (error) {
//         console.error('Error updating lease payment status:', error);
//     }
// });

PaymentPeriodSchema.post('save', async function(doc) {
    try {
        const room = await RoomModel.findOne({ 'lease.payment_periods._id': this._id });
        if (!room) {
            throw new Error('Room not found');
        }
        const lease = room.lease;

        let paymentStatus;
        if (this.payments_until_paid <= 0) {
            paymentStatus = 'paid';
        } else if (this.payments_until_paid < this.rent_amount) {
            paymentStatus = 'partially paid';
        } else if (this.end_date < new Date()) {
            paymentStatus = 'overdue';
        } else {
            paymentStatus = 'unpaid';
        }

        lease.payment_status = paymentStatus;
        await lease.save();
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
});

const RoomModel = mongoose.model('rooms', RoomSchema);
module.exports = RoomModel;
