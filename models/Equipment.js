const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },

    model: {
        type: String,
    },
})

const EquipmentModel = mongoose.model('equipment', EquipmentSchema)

module.exports = EquipmentModel;