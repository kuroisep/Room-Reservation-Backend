const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    priority: {
        type: String,
        require: true
    },
    userID: {
        type: []
    },
    org: {
        type: String
    }
})

const StatusModel = mongoose.model('status', StatusSchema)

module.exports = StatusModel;