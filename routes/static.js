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

router.get('/search/:key', async (req, res) => {

    let result = await RequestsModel.find({
        "$or": [
            { Room: { $regex: req.params.key } },
            { Equipment: { $regex: req.params.key } },
            { Status_Approve: { $regex: req.params.key } },
        ]
    })
    res.send(result);
})

router.get('/searchby/', async (req, res) => {
    try {
        let match = {};
        if (req.query.Status_Approve) {
            match.Status_Approve = new RegExp(req.query.Status_Approve, "i");
        }
        if (req.query.UserID) {
            match.UserID = new RegExp(req.query.UserID, "i");
        }
        if (req.query.Room) {
            match.Room = new RegExp(req.query.Room, "i");
        }
        if (req.query.Building) {
            match.Building = new RegExp(req.query.Building, "i");
        }

        const result = await RequestsModel.aggregate([{ $match: match }]);

        res.send(result)
    } catch (err) {
        res.status(500).send(err);
    }
})

module.exports = router