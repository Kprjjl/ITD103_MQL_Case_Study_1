const mongoose = require('mongoose');
const RoomModel = require('./Room');

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
        await updateLeasePaymentStatusAmount(doc.room, doc.amount);
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
});

PaymentSchema.post('findOneAndUpdate', async function(result) {
    try{
        await updateLeasePaymentStatusAmount(result.room, doc.amount);
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
});

PaymentSchema.post('findByIdAndDelete', async function(doc) {
    try{
        await updateLeasePaymentStatusAmount(doc.room, doc.amount);
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
});

async function updateLeasePaymentStatusAmount(roomId, amount) {
    const room = await RoomModel.findByIdAndUpdate(
            { _id: roomId }, {
            $inc: {
                'lease.payment_periods.$[element].payments_until_paid': -amount
            }
        }, {
            arrayFilters: [{
                'element.start_date': { $lte: new Date() },
                'element.end_date': { $gte: new Date() }
            }],
            new: true
        }).exec();
    if (!room) {
        throw new Error('Room not found');
    }
    // await updateLeasePaymentStatus2(room);
}

// async function updateLeasePaymentStatus2(room) {
//     let carry_over = 0;
//     // console.log("room", room);
//     console.log("room.lease.payment_periods", room.lease.payment_periods);
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
//     console.log("room.lease.payment_periods", room.lease.payment_periods);
//     await room.save();
// }

// async function updateLeasePaymentStatus(roomId, amount) {
//     console.log("roomId", roomId);
//     console.log("amount", amount);
    
//     const room = await RoomModel.findById(roomId).exec();
//     if (!room) {
//         throw new Error('Room not found');
//     }
    
//     const lease = room.lease;
//     if (!lease) {
//         throw new Error('Lease not found');
//     }
    
//     const payment_periods = lease.payment_periods;
//     if (!payment_periods.length) {
//         throw new Error('No payment periods found');
//     }
    
//     const dateNow = new Date();
//     const currentPeriod = payment_periods.find(period => dateNow >= period.start_date && dateNow <= period.end_date);
    
//     if (!currentPeriod) {
//         throw new Error('Current payment period not found');
//     }

//     currentPeriod.payments_until_paid -= amount;

//     let paymentStatus;
//     if (currentPeriod.payments_until_paid <= 0) {
//         paymentStatus = 'paid';
//     } else if (currentPeriod.payments_until_paid < currentPeriod.rent_amount) {
//         paymentStatus = 'partially paid';
//     } else if (currentPeriod.end_date < new Date()) {
//         paymentStatus = 'overdue';
//     } else {
//         paymentStatus = 'unpaid';
//     }

//     console.log("paymentStatus", paymentStatus); 
//     currentPeriod.payment_status = paymentStatus;
    
//     // If the entire lease should have a payment status
//     lease.payment_status = paymentStatus;

//     // Updating the specific payment period in the array
//     const periodIndex = payment_periods.findIndex(period => period._id.equals(currentPeriod._id));
//     if (periodIndex !== -1) {
//         payment_periods[periodIndex] = currentPeriod;
//     } else {
//         throw new Error('Could not find the current period in the array');
//     }
    
//     room.lease = lease;
//     room.lease.payment_periods = payment_periods;
    
//     console.log("room", room);
//     console.log("room.lease.payment_periods", room.lease.payment_periods);

//     await room.save();
// }

const PaymentModel = mongoose.model('payments', PaymentSchema);
module.exports = PaymentModel
