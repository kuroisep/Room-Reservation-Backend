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
    status: {
        type: String
    },
    Role: {
        type: String
    },
    img: {
        data: Buffer,
        contentType: String
    },
    org: {
        type: String
    }
});

module.exports = mongoose.model('users', UserSchema)