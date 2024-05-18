// const LeaseModel = require('../models/Lease');
const RoomModel = require('../models/Room');


function generatePaymentPeriods(lease) {
    const { _id, rent_amount, start_date, end_date, payment_frequency, num_terms } = lease;
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

async function updateLeasePaymentStatusAmount(roomId, amount, isDelete=false) {
    const amount_payment = isDelete ? amount : -amount;
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
    await updateLeasePaymentStatus(room, mode=(isDelete ? "delete" : "add"));
}

async function updateLeasePaymentStatus(roomId, amount, isDelete=false) {
    const room = await RoomModel.findById(roomId).exec();
    if (!room) {
        throw new Error('Room not found');
    }
    let total_payments = 0;
    for (let i = 0; i < room.lease.payment_periods.length; i++) {
        total_payments += (room.lease.payment_periods[i].rent_amount - room.lease.payment_periods[i].payments_until_paid);
    }
    room.lease.payment_periods = generatePaymentPeriods(room.lease);

    let lease_payment_status = "unpaid";
    let carry_over =  (isDelete? (total_payments - amount) : (amount + total_payments));
    for (let i = 0; i < room.lease.payment_periods.length; i++) {
        if (carry_over > 0 && room.lease.payment_periods[i].payments_until_paid > 0) {
            if (room.lease.payment_periods[i].payments_until_paid >= carry_over) {
                room.lease.payment_periods[i].payments_until_paid -= carry_over;
                carry_over = 0;
            } else {
                carry_over -= room.lease.payment_periods[i].payments_until_paid;
                room.lease.payment_periods[i].payments_until_paid = 0;
            }
        }
        if (room.lease.payment_periods[i].payments_until_paid <= 0) {
            room.lease.payment_periods[i].payment_status = 'paid';
        } else if (room.lease.payment_periods[i].payments_until_paid < room.lease.payment_periods[i].rent_amount) {
            room.lease.payment_periods[i].payment_status = 'partially paid';
        } else if (room.lease.payment_periods[i].end_date < new Date()) {
            room.lease.payment_periods[i].payment_status = 'overdue';
        }

        if (room.lease.payment_periods[i].start_date <= new Date() && room.lease.payment_periods[i].end_date >= new Date()) {
            lease_payment_status = room.lease.payment_periods[i].payment_status;
        }
    }

    room.lease.payment_status = lease_payment_status;
    room.markModified('lease.payment_periods');

    await room.save();
}


module.exports = {
    generatePaymentPeriods,
    updateLeasePaymentStatusAmount,
    updateLeasePaymentStatus,
};
