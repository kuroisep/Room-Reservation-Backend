const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    roomID: {
        type: []
    },
    org: {
        id: {
            type: String
        },
        name: {
            type: String
        }
    },
    active: {
        type: Boolean,
        default: true
    }
})

const BuildingModel = mongoose.model('building', BuildingSchema)

module.exports = BuildingModel;