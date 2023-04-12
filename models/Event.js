const boolean = require('@hapi/joi/lib/types/boolean');
const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
    Room: {
        id: {type: String},
        name: {type: String}
    },
    RoomType: {
        id: {type: String},
        name: {type: String}
    },
    Building: {
        id: { type: String },
        name: { type: String }
    },
    Org: {
        id: {type: String},
        name: {type: String}
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
        type: Date
    },
    endTime: {
        type: Date
    },
    allDay: {
        type: boolean
    },
    Purpose: {
        type: String,
    },
    Status_Approve: {
        type: String
    },
    Seat: {
        type: String,
    }
}, { timestamp: true });

const EventModel = mongoose.model('events', EventSchema)

module.exports = EventModel;