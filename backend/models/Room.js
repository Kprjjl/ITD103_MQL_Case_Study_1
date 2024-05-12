const mongoose = require('mongoose');
const LeaseSchema = require('./Lease');

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
