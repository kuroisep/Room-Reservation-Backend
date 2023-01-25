const mongoose = require('mongoose')

const RequestSchema = new mongoose.Schema({
    Room: {
        type: String,
        required: true
    },
    UserID: {
        type: String,
        required: true,
    },
    Equipment: {
        type: [],
        required: true,
    },
    Date_Reserve: {
        type: Array,
        default: [Date]
    },
    Status_Approve: {
        type: String,
        default: "Unapproved"
    },
    Seat: {
        type: String,
    }
}, { timestamp: true });

const RequestsModel = mongoose.model('requests', RequestSchema)

module.exports = RequestsModel;