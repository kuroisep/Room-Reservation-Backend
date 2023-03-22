const { number } = require('joi');
const mongoose = require('mongoose')
const Building = require('../models/Building')

const RoomSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Detail: {
        type: String
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
    Org: {
        type: String
    },
    Seat: {
        type: Number,
        required: true,
    },

    Size: {
        type: String,
        required: true,
    },

    Object: {
        type: [],
    },

    useCount: {
        type: Number,
        default: 0
    },

    image: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    }
});

const RoomsModel = mongoose.model('rooms', RoomSchema)

module.exports = RoomsModel;