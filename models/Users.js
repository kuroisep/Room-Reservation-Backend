const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    pass: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    Email: {
        type: String,
        required: true,
    },
    statusID: {
        type: String
    },
    Role: {
        type: String
    },
    Profile: {
        type: String
    },
    orgID: {
        type: String
    },
    reqID: {
        type: String
    }
});

module.exports = mongoose.model('users', UserSchema)