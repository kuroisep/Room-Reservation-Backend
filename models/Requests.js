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
    Date_Reserve: {
        type: Array,
        default: [Date]
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