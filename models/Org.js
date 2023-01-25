const mongoose = require('mongoose')

const OrgSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    orgType: {
        type: String
    },
    profile: {
        type: String
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
});

const OrgModel = mongoose.model('orgs', OrgSchema)

module.exports = OrgModel;