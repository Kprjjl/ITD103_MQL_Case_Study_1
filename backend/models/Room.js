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
    },
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

const RoomModel = mongoose.model('rooms', RoomSchema);
module.exports = RoomModel;
