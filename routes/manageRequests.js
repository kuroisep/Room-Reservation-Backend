const { application } = require('express');
const express = require('express');
const router = express.Router();
const RequestsModel = require('../models/Requests');
const EventModel = require('../models/Event');
const UserModel = require('../models/Users');
const auth = require('../middleware/auth');
const RoomModel = require('../models/Rooms');
const OrgModel = require('../models/Org');
const mongoose = require('mongoose');
const BuildingModel = require('../models/Building');
const RoomTypeModel = require('../models/RoomType')

router.post('/', async (req, res) => {
    const userid = await UserModel.findById(req.body.UserID)
    const Rooms = await RoomModel.findById(req.body.Room)

    const Organization = await OrgModel.findById(userid.org.id)
    // const Organization = await OrgModel.findOne({ name: User.org })
    const roomt = await RoomTypeModel.findById(Rooms.RoomType.id)

    const start = req.body.startTime
    const end = req.body.endTime
    let timeoverlap;

    for(let i=0; i<start.length; i++){

        timeoverlap = await EventModel.find({
            "$and": [{ "Room.id": req.body.Room }],
            "$or": [
                {"$and": [{ startTime: { $lte: start[i][0] }}, { endTime: { $gte: end[i][0] }}]},
                {"$and": [{ startTime: { $gte: start[i][0] }}, { endTime: { $lte: end[i][0] }}]},
                {"$and": [{ startTime: { $gte: start[i][0] }}, { startTime: { $lte: end[i][0] }}]},
                {"$and": [{ endTime: { $gte: end[i][0] }}, {endTime: { $lte: end [i][0]}}]}
            ]
        })
    }

    console.log(timeoverlap)
    if (timeoverlap.length>0){
        res.status(500).send('Room is already reserved')
    }

    else {
        const User = {
            id: req.body.UserID,
            username: userid.username
        }
        const Room = {
            id: req.body.Room,
            name: Rooms.Name
        }
        const RoomType = {
            id: roomt.id,
            name: roomt.name
        }
        const build = await BuildingModel.findById(Rooms.Building.id)
        const Building = {
            id: build.id,
            name: build.name
        }
        const Org = {
            id: Organization.id,
            name: Organization.name
        }

        const startTime = req.body.startTime
        const endTime = req.body.endTime
        const repeatDate = req.body.repeatDate
        const recurrance = req.body.recurrance
        const endDate = req.body.endDate
        const allDay = req.body.allDay
        const Date_Reserve = req.body.Date_Reserve
        const Status_Approve = req.body.Status_Approve
        const Seat = req.body.Seat
        const Purpose = req.body.Purpose

        const Requests = new RequestsModel({
            Room: Room,
            RoomType: RoomType,
            Building: Building,
            User: User,
            Org: Org,
            startTime: startTime,
            endTime: endTime,
            repeatDate: repeatDate,
            recurrance: recurrance,
            endDate: endDate,
            allDay: allDay,
            Date_Reserve: Date_Reserve,
            Status_Approve: Status_Approve,
            Seat: Seat,
            Purpose: Purpose
        });

        try {
            await Requests.save()
            res.send('Success')
        } catch (err) {
            res.status(400).send(err);
        }
    }
})

router.get('/', async (req, res) => {

    RequestsModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})

router.put("/:id", async (req, res) => {
    const id = req.params.id;

    const request = await RequestsModel.findById(id);

    if (req.body.Room || req.body.Building) {
        const Rooms = await RoomModel.findById(req.body.Room)
        const Build = await BuildingModel.findById(req.body.Building)
        const newRoom = {
            id: req.body.Room,
            name: Rooms.Name
        }
        const newBuilding = {
            id: req.body.Building,
            name: Build.name
        }

        request.Room = newRoom;
        request.Building = newBuilding
    }
    if (req.body.UserID) {
        const User = await UserModel.findById(req.body.UserID)
        const newUser = {
            id: req.body.UserID,
            name: User.name
        }

        request.User = newUser
    }
    if (req.body.Object) {
        const newObject = req.body.
            request.Object = newObject
    }
    if (req.body.Purpose) {
        const newPurpose = req.body.Purpose
        request.Purpose = newPurpose
    }
    if (req.body.startTime) {
        const newstartTime = req.body.startTime
        request.startTime = newstartTime
    }
    if (req.body.endTime) {
        request.endTime = req.body.endTime
    }
    if (req.body.repeatDate) {
        request.repeatDate = req.body.repeatDate
    }
    if (req.body.recurrance) {
        request.recurrance = req.body.recurrance
    }
    if (req.body.allDay) {
        request.allDay = req.body.allDay
    }
    if (req.body.Status_Approve) {
        request.Status_Approve = req.body.Status_Approve

        if (request.Status_Approve == 'Approved') {
          //  console.log(request.startTime.length)
            for (let i = 0; i < request.startTime.length; i++) {
                const Event = new EventModel({
                    Room: request.Room,
                    RoomType: request.RoomType,
                    Building: request.Building,
                    Org: request.Org,
                    User: request.User,
                    startTime: request.startTime[i][0],
                    endTime: request.endTime[i][0],
                    allDay: request.allDay,
                    Status_Approve: request.Status_Approve,
                    Seat: request.Seat,
                    Purpose: request.Purpose
                })
                await Event.save();

               // const User = await UserModel.findById(request.User.id)
            }
            const room = await RoomModel.findById(request.Room.id)
            room.useCount = (room.useCount) + 1
            await room.save()
        }
        if (req.body.Seat) {
            request.Seat = req.body.Seat
        }

        try {
            await request.save()
            res.send('updated');

        } catch (err) {
            console.log(err);
        }
    }
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const request = await RequestsModel.findById(id)
        request.Status_Approve = "Cancled"
        await request.save()
        res.send("Request Status is cancled");

        const room = await RoomModel.findById(request.Room.id)
        if (room.useCount > 0){
            room.useCount = room.useCount - 1
        }
        else {
            room.useCount = 0
        }
    }
    catch (err) {
        console.log(err);
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
        const addCondition = (key, value) => {
            let ret = {};
            if (value) {
                if (Array.isArray(value)) {
                    ret[key] = { $in: value };
                } else {
                    ret[key] = value;
                }
            }
            return ret;
        }

        const aggregate = RequestsModel.aggregate();

        if (req.query.ContributorID) {
            // Join rooms by room.id
            // to get Contributor id
            aggregate.lookup({
                from: "rooms",
                let: { roomId: { $toObjectId: "$Room.id" } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$roomId"],
                            },
                        },
                    },
                    {
                        $project: {
                            // to output same as normal
                            _id: 0,
                            id: "$_id",
                            name: "$Name",

                            "Contributor.id": 1,
                        },
                    },
                ],
                as: "Room",
            });

            aggregate.unwind("$Room");
        }

        let match = {
            ...addCondition("Status_Approve", req.query.Status_Approve),
            ...addCondition("User.id", req.query.UserID),
            ...addCondition("Room.id", req.query.RoomID),
            ...addCondition("Building.id", req.query.BuildingID),
            ...addCondition("Org.id", req.query.OrgID),
            ...addCondition("Room.Contributor.id", req.query.ContributorID),
        };

        aggregate.match(match);

        if (req.query.ContributorID) {
            // Not show Contributor id
            aggregate.project({
                "Room.Contributor": 0
            })
        }

        const result = await aggregate.exec();

        res.send(result)
    } catch (err) {
        res.status(500).send(err);
    }
})


router.get('/stat', async (req, res) => {
    try {
        const addCondition = (key, value) => {
            let ret = {};
            if (value) {
                if (Array.isArray(value)) {
                    ret[key] = { $in: value };
                } else {
                    ret[key] = value;
                }
            }
            return ret;
        }

        const aggregate = RequestsModel.aggregate();

        if (req.query.ContributorID) {
            // Join rooms by room.id
            // to get Contributor id
            aggregate.lookup({
                from: "rooms",
                let: { roomId: { $toObjectId: "$Room.id" } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$roomId"],
                            },
                        },
                    },
                    {
                        $project: {
                            // to output same as normal
                            _id: 0,
                            id: "$_id",
                            name: "$Name",

                            "Contributor.id": 1,
                        },
                    },
                ],
                as: "Room",
            });

            aggregate.unwind("$Room");
        }

        let match = {
            ...addCondition("Status_Approve", req.query.Status_Approve),
            ...addCondition("User.id", req.query.UserID),
            ...addCondition("Room.id", req.query.RoomID),
            ...addCondition("Building.id", req.query.BuildingID),
            ...addCondition("Org.id", req.query.OrgID),
            ...addCondition("Room.Contributor.id", req.query.ContributorID),
        };

        let matchStartTime = {};
        if (req.query.fromTime) {
            matchStartTime["$gte"] = new Date(req.query.fromTime);
        }
        if (req.query.toTime) {
            matchStartTime["$lt"] = new Date(req.query.toTime);
        }
        if (Object.keys(matchStartTime).length !== 0) {
            aggregate.unwind("$startTime");
            aggregate.unwind("$startTime");
            aggregate.addFields({
                startTime: {
                    $dateFromString: {
                        dateString: "$startTime",
                    },
                },
            });

            match = {
                ...match,
                startTime: matchStartTime
            }
        }

        aggregate.match(match);

        if (req.query.ContributorID) {
            // Not show Contributor id
            aggregate.project({
                "Room.Contributor": 0
            })
        }

        aggregate.group({
            _id: "$_id",
            Status_Approve: {
                $first: "$Status_Approve",
            },
        })

        aggregate.group({
            _id: "$Status_Approve",
            count: {
                $count: {},
            },
        })

        const result = await aggregate.exec();
        let output = {
            Approved: 0,
            Cancled: 0,
            Pending: 0,
            Rejected: 0,
        };
        result.forEach((value) => {
            output[value._id] = value.count;
        })

        res.send(output);
    } catch (err) {
        res.status(500).send(err);
    }
})


router.get('/history', async (req, res) => {
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1], decoded;
        console.log(authorization)

        try {
            decoded = jwt.verify(authorization, process.env.TOKEN_SECRET)
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
    }

    const userid = decoded._id;
    let match = {};
    if (req.query.Status_Approve) {
        match.Status_Approve = new RegExp(req.query.Status_Approve, "i");
    }
    if (userid) {
        match.UserID = new RegExp(userid, "i");
    }

    const result = await RequestsModel.aggregate([{ $match: match }]);

    res.send(result)
})

router.get('/:id', (req, res) => {

    fetchid = req.params.id;
    RequestsModel.find(({ _id: fetchid }), function (err, val) {
        res.send(val);
    })
})

router.get('/:userid', (req, res) => {

    fetchid = req.params.userid;
    RequestsModel.find(({ UserID: fetchid }), function (err, val) {
        res.send(val);
    })
})

module.exports = router
