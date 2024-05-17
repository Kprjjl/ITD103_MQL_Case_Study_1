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

// RoomSchema.pre('save', async function (next) {
//     if (!this.lease) {
//         return next();
//     }
//     let carry_over = 0;
//     for (let i = 0; i < this.lease.payment_periods.length; i++) {
//         if (carry_over > 0) {
//             this.lease.payment_periods[i].payments_until_paid += carry_over;
//             carry_over = 0;
//         }

//         if (this.lease.payment_periods[i].payments_until_paid <= 0) {
//             this.lease.payment_periods[i].payment_status = 'paid';
//             if (this.lease.payment_periods[i].payments_until_paid < 0) {
//                 carry_over = Math.abs(this.lease.payment_periods[i].payments_until_paid);
//                 this.lease.payment_periods[i].payments_until_paid = 0;
//             }
//         } else if (this.lease.payment_periods[i].payments_until_paid < this.lease.payment_periods[i].rent_amount) {
//             this.lease.payment_periods[i].payment_status = 'partially paid';
//         }
//         if (this.lease.payment_periods[i].end_date < new Date()) {
//             this.lease.payment_periods[i].payment_status = 'overdue';
//         }
//     }
//     console.log("this.lease.payment_periods", this.lease.payment_periods)
//     next();
// });

// RoomSchema.post('findByIdAndUpdate', async function (result) {
//     const room = result;
//     if (!room.lease) {
//         return;
//     }
//     let carry_over = 0;
//     for (let i = 0; i < room.lease.payment_periods.length; i++) {
//         if (carry_over > 0) {
//             room.lease.payment_periods[i].payments_until_paid += carry_over;
//             carry_over = 0;
//         }
//         if (room.lease.payment_periods[i].payments_until_paid < room.lease.payment_periods[i].rent_amount) {
//             console.log("true")
//         }
//         if (room.lease.payment_periods[i].payments_until_paid <= 0) {
//             room.lease.payment_periods[i].payment_status = 'paid';
//             if (room.lease.payment_periods[i].payments_until_paid < 0) {
//                 carry_over = Math.abs(room.lease.payment_periods[i].payments_until_paid);
//                 room.lease.payment_periods[i].payments_until_paid = 0;
//             }
//         } else if (room.lease.payment_periods[i].payments_until_paid < room.lease.payment_periods[i].rent_amount) {
//             room.lease.payment_periods[i].payment_status = 'partially paid';
//         }
//         if (room.lease.payment_periods[i].end_date < new Date()) {
//             room.lease.payment_periods[i].payment_status = 'overdue';
//         }
//     }
//     console.log("room.lease.payment_periods", room.lease.payment_periods)
//     await room.save();
// });

// RoomSchema.pre('save', async function (next) {
//     const room = this;
//     // if (!room.lease) {
//     //     return next();
//     // }
//     let carry_over = 0;
//     for (let i = 0; i < room.lease.payment_periods.length; i++) {
//         if (carry_over > 0) {
//             room.lease.payment_periods[i].payments_until_paid += carry_over;
//             carry_over = 0;
//         }

//         if (room.lease.payment_periods[i].payments_until_paid <= 0) {
//             room.lease.payment_periods[i].payment_status = 'paid';
//             if (room.lease.payment_periods[i].payments_until_paid < 0) {
//                 carry_over = Math.abs(room.lease.payment_periods[i].payments_until_paid);
//                 room.lease.payment_periods[i].payments_until_paid = 0;
//             }
//         } else if (room.lease.payment_periods[i].payments_until_paid < room.lease.payment_periods[i].rent_amount) {
//             room.lease.payment_periods[i].payment_status = 'partially paid';
//         }
//         if (room.lease.payment_periods[i].end_date < new Date()) {
//             room.lease.payment_periods[i].payment_status = 'overdue';
//         }
//     }
//     next();
// });

const RoomModel = mongoose.model('rooms', RoomSchema);
module.exports = RoomModel;
