const { application } = require('express');
const express = require('express');
const router = express.Router();
const RequestsModel = require('../models/Requests')
const RoomModel = require('../models/Rooms')

router.get('/', async (req, res) => {

    try {
        RoomModel.find({}).sort({ useCount: -1 })
            .select({
                "Name": 1,
                "useCount": 1
            }).exec((err, docs) => {
                if (err) {
                    responseObj = {
                        "status": "error"
                    }
                    res.status(500).send(responseObj);
                } else {
                    res.status(200).send(docs)
                }
            })
    } catch (err) {
        res.send(err);
    }
})

module.exports = router