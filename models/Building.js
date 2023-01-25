const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },

    roomType: {
        type: []
    },

    roomID: {
        type: []
    },
    orgID: {
        type: String
    }
})

const BuildingModel = mongoose.model('building', BuildingSchema)

module.exports = BuildingModel;