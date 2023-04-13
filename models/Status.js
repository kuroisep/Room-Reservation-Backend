const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    userID: {
        type: []
    },
    org: {
        id: { type: String },
        name: { type: String }
    },
    active: {
        type: Boolean,
        default: true
    }
})

const StatusModel = mongoose.model('status', StatusSchema)

module.exports = StatusModel;