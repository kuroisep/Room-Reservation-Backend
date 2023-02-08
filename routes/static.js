const { application } = require('express');
const express = require('express');
const router = express.Router();
const RequestsModel = require('../models/Requests')
const RoomModel = require('../models/Rooms')

router.get('/getRecord', async (req, res) => {
    try {
        RoomModel.find({}).sort({ useCount: 1 }).exec()
    } catch (err) {
        console.log(err)
    }
})

module.exports = router