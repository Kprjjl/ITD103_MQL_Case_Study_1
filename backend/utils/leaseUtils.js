// const LeaseModel = require('../models/Lease');
// const { updateLeasePaymentStatus } = require('../models/Payment');


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
    // updateLeasePaymentStatus(_id);
    return payment_periods;
}

module.exports = {
    generatePaymentPeriods
};
