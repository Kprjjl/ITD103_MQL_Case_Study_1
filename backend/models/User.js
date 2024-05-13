const mongoose = require('mongoose');

const statusOptions = ['online', 'offline'];

const UserSchema = new mongoose.Schema({
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
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: statusOptions,
        default: 'offline'
    },
    profile_img: {
        type: String,
        default: null
    },
    contact_no: {
        type: String,
        default: null
    },
    occupied_room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rooms'
    },

    usertype: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', function(next) {
    if (!this.username) {
        this.username = this.firstname + " " + this.lastname;
    }
    next();
});
UserSchema.index({ email: 1, username: 1 }, { unique: true });

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
