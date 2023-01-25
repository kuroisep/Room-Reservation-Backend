const mongoose = require('mongoose')
const Building = require('../models/Building')

const RoomSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Detail: {
        type: String,
        required: true,
    },
    Contributor: {
        type: String,
        required: true,
    },

    RoomType: {
        type: String,
        required: true,
    },

    Building: {
        type: String,
        required: true
    },

    Seat: {
        type: Number,
        required: true,
    },

    Size: {
        type: String,
        required: true,
    },

    Equipment: {
        type: [],
    },
});

const RoomsModel = mongoose.model('rooms', RoomSchema)

module.exports = RoomsModel;