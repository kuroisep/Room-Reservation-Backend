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
        id: { type: String },
        name: { type: String }
    },
    RoomType: {
        id: { type: String },
        name: { type: String }
    },

    Building: {
        id: { type: String },
        name: { type: String }
    },
    Org: {
        id: { type: String },
        name: { type: String }
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
    },
    active: {
        type: Boolean,
        default: true
    }
});

const RoomsModel = mongoose.model('rooms', RoomSchema)

module.exports = RoomsModel;