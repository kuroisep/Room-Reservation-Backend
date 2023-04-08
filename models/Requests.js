const mongoose = require('mongoose')

const RequestSchema = new mongoose.Schema({
    Room: {
        id: { type: String },
        name: { type: String }
    },
    Building: {
        id: { type: String },
        name: { type: String }
    },
    User: {
        id: { type: String },
        username: { type: String }

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
        type: String
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
        default: "Pending"
    },
    Seat: {
        type: String,
    }
}, { timestamp: true });


const RequestsModel = mongoose.model('requests', RequestSchema)

module.exports = RequestsModel;