const mongoose = require('mongoose');

const LeaseSchema = new mongoose.Schema({
    // room: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Room',
    //     required: true
    // },
    // tenants: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }],
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

    payment_status: {
        type: String,
        enum: ['paid', 'unpaid', 'overdue', 'cancelled', 'refunded'],
        default: 'unpaid'
    },
    // payment_days: {
    //     type: [Date],
    //     default: function() {
    //         return this.getPaymentDates();
    //     }
    // },
    payments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],

    created_at: {
        type: Date,
        default: Date.now
    }
});

// LeaseSchema.methods.getPaymentDates = function() {
//     const paymentDates = [];
//     const currentDate = new Date(this.start_date);
//     const endDate = new Date(this.end_date);
//     const frequency = this.payment_frequency;

//     if (frequency === 'one-time') {
//         paymentDates.push(new Date(endDate));
//     } else {
//         while (currentDate < endDate) {
//             switch (frequency) {
//                 case 'monthly':
//                     currentDate.setMonth(currentDate.getMonth() + 1);
//                     break;
//                 case 'quarterly':
//                     currentDate.setMonth(currentDate.getMonth() + 3);
//                     break;
//                 case 'semi-annually':
//                     currentDate.setMonth(currentDate.getMonth() + 6);
//                     break;
//                 case 'annually':
//                     currentDate.setFullYear(currentDate.getFullYear() + 1);
//                     break;
//             }
//             if (currentDate <= endDate) {
//                 paymentDates.push(new Date(currentDate));
//             }
//         }
//     }

//     return paymentDates;
// };

// LeaseSchema.pre('validate', function(next) {
//     if (this.start_date >= this.end_date) {
//         next(new Error('End date must be after start date.'));
//     }

//     const numPaymentDates = this.getPaymentDates().length;
//     if (numPaymentDates < 1) {
//         next(new Error('Payment frequency does not generate payment dates within the lease period.'));
//     } else {
//         next();
//     }
// });

LeaseSchema.virtual('current_required_payment').get(function() {
    const rentAmount = this.rent_amount || 0;
    const paymentDaysLength = this.payment_days.length || 0;
    return rentAmount * paymentDaysLength;
});

// const LeaseModel = mongoose.model('leases', LeaseSchema);
// module.exports = LeaseModel;
module.exports = LeaseSchema;
