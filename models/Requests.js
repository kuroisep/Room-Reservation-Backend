const mongoose = require('mongoose')

const RequestSchema = new mongoose.Schema({
    Room: {
        type: String,
        required: true
    },
    Building: {
        type: String
    },
    UserID: {
        type: String,
        required: true,
    },
    username: {
        type: String,
    },
    Object: {
        type: [],
        required: true,
    },
    startTime: {
        type: Array,
        default: [Date]
    },
    endTime: {
        type: Array,
        default: [Date]
    },
    repeatDate: {
        type: Number
    },
    recurrance: {
        type: Number
    },
    endDate: {
        type: Date
    },
    allDay: {
        type: Boolean
    },
    Purpose: {
        type: String,
        required: true
    },
    Status_Approve: {
        type: String,
    },
    Seat: {
        type: String,
    }
}, { timestamp: true });


const RequestsModel = mongoose.model('requests', RequestSchema)

module.exports = RequestsModel;