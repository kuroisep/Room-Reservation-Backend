const mongoose = require('mongoose');

const RoomTypeSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    org: {
        id: {
            type: String
        },
        name: {
            type: String
        }
    },
    roomID: {
        type: []
    },
    active: {
        type: Boolean,
        default: true
    }
})

const RoomTypeModel = mongoose.model('roomtype', RoomTypeSchema)

module.exports = RoomTypeModel;