const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
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
    Object: {
        type: [],
        required: true,
    },
    Date_Reserve: {
        type: Date,
    },
    Purpose: {
        type: String,
    },
    Status_Approve: {
        type: String,
        default: "Unapproved"
    },
    Seat: {
        type: String,
    }
}, { timestamp: true });

const EventModel = mongoose.model('events', EventSchema)

module.exports = EventModel;