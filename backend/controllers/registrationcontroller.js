const mongoose = require('mongoose');
const RegistrationModel = require('../models/Registration');
const UserModel = require('../models/User');

async function validateAndInsertPendingRegistration(registration) {
    try {
        const existingUser = await UserModel.findOne({ username: registration.username });
        if (existingUser) {
            throw new Error("Username already exists");
        }

        const existingEmail = await UserModel.findOne({ email: registration.email });
        if (existingEmail) {
            throw new Error("Email already exists");
        }

        const existingPendingEmail = await RegistrationModel.findOne({ email: registration.email, status: 'pending'});
        if (existingPendingEmail) {
            throw new Error("Email already pending approval");
        }

        const existingPendingUsername = await RegistrationModel.findOne({ username: registration.username, status: 'pending'});
        if (existingPendingUsername) {
            throw new Error("Username already pending approval");
        }

        const newPendingRegistration = await RegistrationModel.create(registration);
        return newPendingRegistration;
    } catch (error) {
        throw error;
    }
}

async function approvePendingRegistration(pendingRegistrationId) {
    try {
        const pendingRegistration = await RegistrationModel.findById(pendingRegistrationId);
        if (!pendingRegistration) {
            throw new Error("Pending registration not found");
        }

        await UserModel.create({
            firstname: pendingRegistration.firstname,
            lastname: pendingRegistration.lastname,
            username: pendingRegistration.username,
            email: pendingRegistration.email,
            password: pendingRegistration.password,
            usertype: pendingRegistration.usertype
        });

        pendingRegistration.status = 'approved';
        await pendingRegistration.save();

        return pendingRegistration;
    } catch (error) {
        throw error;
    }
}

async function disapprovePendingRegistration(pendingRegistrationId) {
    try {
        const pendingRegistration = await RegistrationModel.findById(pendingRegistrationId);
        if (!pendingRegistration) {
            throw new Error("Pending registration not found");
        }

        if (pendingRegistration.status === 'disapproved') {
            return pendingRegistration;
        }
        pendingRegistration.status = 'disapproved';
        await pendingRegistration.save();

        return pendingRegistration;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    validateAndInsertPendingRegistration,
    approvePendingRegistration,
    disapprovePendingRegistration
};
