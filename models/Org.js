const { boolean } = require('joi');
const mongoose = require('mongoose')

const OrgSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    roomID: {
        type: []
    },
    roomTypeID: {
        type: []
    },
    buildingID: {
        type: [],
    },
    userID: {
        type: []
    },
    statusID: {
        type: []
    },
    active: {
        type: Boolean,
        default: true
    }
});

const OrgModel = mongoose.model('orgs', OrgSchema)

module.exports = OrgModel;