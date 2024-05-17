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

PaymentSchema.pre('findByIdAndDelete', async function(next) {
    try{
        const doc = await this.model.findOne(this.getQuery());
        await updateLeasePaymentStatusAmount(doc.room, doc.amount, true);
    } catch (error) {
        console.error('Error updating lease payment status:', error);
    }
    next();
});

async function updateLeasePaymentStatusAmount(roomId, amount, isDelete=false) {
    const amount_payment = isDelete ? amount : -amount;
    console.log("amount payment: ", amount_payment)
    const room = await RoomModel.findByIdAndUpdate(
        { _id: roomId }, {
            $inc: {
                'lease.payment_periods.$[element].payments_until_paid': amount_payment
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
    console.log(room.lease.payment_periods)
    await updateLeasePaymentStatus(room, mode=(isDelete ? "delete" : "add"));
}

async function updateLeasePaymentStatus(room, mode="add") {
    if (mode == "add"){
        let lease_payment_status = "unpaid";
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
    
            if (room.lease.payment_periods[i].start_date <= new Date() && room.lease.payment_periods[i].end_date >= new Date()) {
                lease_payment_status = room.lease.payment_periods[i].payment_status;
            }
        }
    }else {
        let lease_payment_status = "unpaid";
        let carry_over = 0;
        for (let i = room.lease.payment_periods.length-1; i >= 0; i--) {
            if (carry_over > 0) {
                room.lease.payment_periods[i].payments_until_paid -= carry_over;
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
    
            if (room.lease.payment_periods[i].start_date <= new Date() && room.lease.payment_periods[i].end_date >= new Date()) {
                lease_payment_status = room.lease.payment_periods[i].payment_status;
            }
        }
    }
    room.lease.payment_status = lease_payment_status;
    await room.save();
}

const PaymentModel = mongoose.model('payments', PaymentSchema);
module.exports = PaymentModel
