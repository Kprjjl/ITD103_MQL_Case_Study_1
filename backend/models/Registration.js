const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    usertype: {
        type: String,
        required: true,
        default: 'user'
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'disapproved']
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    time_interacted: {
        type: Date,
        default: Date.now
    }
});

RegistrationSchema.pre('save', function(next) {
    this.time_interacted = new Date();
    next();
});

const RegistrationModel = mongoose.model('registrations', RegistrationSchema);
module.exports = RegistrationModel;
