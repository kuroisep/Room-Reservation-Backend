const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String
    },
    role: {
        type: String
    },
    org: {
        type: String
    },
    image: {
        type: String
    },
    token: {
        type: String
    }
});

module.exports = mongoose.model('users', UserSchema)