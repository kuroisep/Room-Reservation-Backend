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
        id: {
            type: String
        },
        name: {
            type: String
        }
    },
    role: {
        type: String
    },
    org: {
        id: {
            type: String
        },
        name: {
            type: String
        }
    },
    image: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    },
    token: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    }
});

const UserModel = mongoose.model('users', UserSchema)

module.exports = UserModel;
