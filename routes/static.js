const { application, request } = require('express');
const express = require('express');
const router = express.Router();
const RequestsModel = require('../models/Requests')
const RoomModel = require('../models/Rooms')
const OrgModel = require('../models/Org')
const EventModel = require('../models/Event')

router.get('/', async (req, res) => {

    try {
        RoomModel.find({ active: true }).sort({ useCount: -1 })
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
    let limit = 10;
    if (req.query.limit) {
        try {
            limit = Number.parseInt(req.query.limit);
        } catch (err) {}

        if (limit > 100) {
            limit = 100;
        }
        if (limit < 1) {
            limit = 1;
        }
    }

    let showUseMinute = false;
    if (req.query.showUseMinute) {
        showUseMinute = true;
    }

    try {
        const addCondition = (key, value, caseSensitive, number) => {
            let ret = {};
            if (value) {
                if (Array.isArray(value)) {
                    ret[key] = { $in: value };
                } else {
                    if (caseSensitive) {
                        ret[key] = new RegExp(value, "i");
                    } else {
                        if (number) {
                            value = Number.parseInt(value)
                        }
                        ret[key] = value;
                    }
                }
            }
            return ret;
        }

        let match = {
            ...addCondition("Room.id", req.query.RoomID),
            ...addCondition("Roomtype.id", req.query.RoomTypeID),
            ...addCondition("Building.id", req.query.BuildingID),
            ...addCondition("Org.id", req.query.OrgID),
            ...addCondition("User.id", req.query.UserID),
            ...addCondition("Status_Approve", "Approved"),
        };

        let matchStartTime = {};
        if (req.query.fromTime) {
            matchStartTime["$gte"] = new Date(req.query.fromTime);
        }
        if (req.query.toTime) {
            matchStartTime["$lt"] = new Date(req.query.toTime);
        }
        if (Object.keys(matchStartTime).length !== 0) {
            match = {
                ...match,
                startTime: matchStartTime
            }
        }

        let group = {
            _id: "$Room.id",
            Name: {
                $first: "$Room.name",
            },
            useCount: {
                $sum: 1,
            },
        }

        const aggregate = EventModel.aggregate();
        aggregate.match(match);
        if (showUseMinute) {
            aggregate.addFields({
                startTimestamp: { $toDecimal: "$startTime" },
                endTimestamp: { $toDecimal: "$endTime" }
            });
            aggregate.addFields({
                UseMinute: {
                    $divide: [
                        { $subtract: [ "$endTimestamp", "$startTimestamp" ] },
                        60 * 1000,
                    ],
                },
            });

            group = {
                ...group,
                UseMinute: { $sum: "$UseMinute" },
            }
        }
        aggregate.group(group);
        aggregate.sort({ useCount: -1 });
        aggregate.limit(limit);

        let result = await aggregate.exec()
        if (showUseMinute) {
            // Convert Mongo Decimal128 to Number
            result = result.map(row => {
                return {
                    ...row,
                    UseMinute: Number.parseInt(row.UseMinute.toString())
                }
            });
        }
        res.send(result)
    } catch (err) {
        res.status(500).send(err);
    }
})

router.get('/buildingroom/:id', async (req, res) => {
    const id = req.params.id
    const building = await BuildingModel.findOne({ _id: id })

    const rooms = building.roomID
    RoomModel.find({ _id: { $in: rooms.map((rooms) => new mongoose.Types.ObjectId(rooms)) }, active:true }).sort({ useCount: -1 }).then(data => {
        res.send(data)
    })
})

router.get('/org/:id', async (req, res) => {
    const orgid = req.params.id
    RequestsModel.find({ "Org.id":orgid, Status_Approve: "Approved" } ).sort({ "Room.id": -1 }).then(data => {
        res.send(data)
    });
})

router.post('/searchbydate', async (req, res) => {

    const start = new Date(req.body.startTime)
    const end = req.body.endTime
    let timeoverlap

    timeoverlap = await EventModel.find(
        {

             //{"$and": [{ startTime: { $lte: start }}, { endTime: { $gte: end }}]},
            "$and": [{ startTime: { $gte: start }}, { endTime: { $lte: end }}]
           //  {"$and": [{ startTime: { $gte: start }}, {endTime: { $lte: end }}]},
           //  {"$and": [{ endTime: { $gte: end }}, {endTime: { $lte: end }}]}

        }
     )

    res.send(timeoverlap)
})

module.exports = router
