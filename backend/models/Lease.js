const mongoose = require('mongoose');

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

PaymentPeriodSchema.post('save', async function(next) {
    if (this.payments_until_paid <= 0) {
        this.payment_status = 'paid';
    } else if (this.payments_until_paid < this.rent_amount) {
        this.payment_status = 'partially paid';
    } else if ((this.end_date < new Date()) && (this.payments_until_paid > 0)) {
        this.payment_status = 'overdue';
    } else {
        this.payment_status = 'unpaid';
    }
    try{
        const leaseId = this.parent().id;
        const roomId = this.parent().parent().id;
        const lease = await LeaseModel.findById(leaseId);
        lease.payment_status = this.payment_status;
        await lease.save();
    } catch (error) {
        console.error('Error updating lease payment status:', error);
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

function generatePaymentPeriods(lease) {
    const { rent_amount, start_date, end_date, payment_frequency, num_terms } = lease;
    const payment_periods = [];
    const freq = payment_frequency.toLowerCase();
    let currentDate = new Date(start_date);

    for (let i = 0; i < num_terms; i++) {
        const start_date = new Date(currentDate);
        const end_date = new Date(currentDate);
        switch (freq) {
            case 'monthly':
                end_date.setMonth(end_date.getMonth() + 1);
                break;
            case 'quarterly':
                end_date.setMonth(end_date.getMonth() + 3);
                break;
            case 'semi-annually':
                end_date.setMonth(end_date.getMonth() + 6);
                break;
            case 'annually':
                end_date.setFullYear(end_date.getFullYear() + 1);
                break;
            default:
                break;
        }
        payment_periods.push({
            start_date: start_date,
            end_date: end_date,
            payment_status: 'unpaid',
            payments_until_paid: rent_amount,
            rent_amount: rent_amount
        });
        currentDate = new Date(end_date.getTime() + 60 * 60 * 24 * 1000);
    }
    return payment_periods;
}

module.exports = LeaseSchema;
