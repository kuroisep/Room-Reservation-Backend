const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
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
        type: Date,
        default: Date.now,
    },
    Status_Approve: {
        type: String,
        default: "Unapproved"
    },
    Seat: {
        type: String,
    }
}, { timestamp: true });

const EventModel = mongoose.model('requests', EventSchema)

module.exports = EventModel;