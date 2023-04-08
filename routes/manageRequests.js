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

router.post('/', async (req, res) => {
    const userid = await UserModel.findById(req.body.UserID)
    const Rooms = await RoomModel.findById(req.body.Room)

    const Organization = await OrgModel.findById(userid.org.id)
    // const Organization = await OrgModel.findOne({ name: User.org })

    const User = {
        id: req.body.UserID,
        username: userid.username
    }
    const Room = {
        id: req.body.Room,
        name: Rooms.Name
    }
    const build = await BuildingModel.findById(Rooms.Building.id)
    const Building = {
        id: build.id,
        name: build.name
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
    const Object = req.body.Object
    const Purpose = req.body.Purpose

    const Requests = new RequestsModel({
        Room: Room,
        Building: Building,
        User: User,
        startTime: startTime,
        endTime: endTime,
        repeatDate: repeatDate,
        recurrance: recurrance,
        endDate: endDate,
        allDay: allDay,
        Date_Reserve: Date_Reserve,
        Status_Approve: Status_Approve,
        Seat: Seat,
        Object: Object,
        Purpose: Purpose
    });

    Organization.reqID.push(Requests._id.toString())
    await Organization.save()

    try {
        Rooms.useCount = (Rooms.useCount) + 1
        await Rooms.save()
        await Requests.save()
        res.send('Success')
    } catch (err) {
        res.status(400).send(err);
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
            console.log(request.startTime.length)
            for (let i = 0; i < request.startTime.length; i++) {
                const Event = new EventModel({
                    Room: request.Room,
                    Building: request.Building,
                    User: request.User,
                    startTime: request.startTime[i][0],
                    endTime: request.endTime[i][0],
                    allDay: request.allDay,
                    Status_Approve: request.Status_Approve,
                    Seat: request.Seat,
                    Object: request.Object,
                    Purpose: request.Purpose
                })
                await Event.save();

                const User = await UserModel.findById(request.UserID)

                let Organization;
                if (typeof User.org === 'object' && typeof User.org.id === 'string') {
                    Organization = await OrgModel.findById(User.org.id);
                } else
                    if (typeof User.org === 'string') {
                        Organization = await OrgModel.findOne({ name: User.org });
                    } else {
                        return res.status(500).send('invalid org format');
                    }

                //   const build = await BuildingModel.findById(request.Building.id)
                //   const Organization = await OrgModel.findById(build.org.id)

                Organization.eventID.push(Event._id.toString())
                await Organization.save()
            }
        }
        if (req.body.Seat) {
            request.Seat = req.body.Seat
        }

        try {
            request.save()
            res.send('updated');

        } catch (err) {
            console.log(err);
        }
    }
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await RequestsModel.findByIdAndRemove(id).exec()
        res.send("itemdeleted");
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
        let match = {};
        if (req.query.Status_Approve) {
            match.Status_Approve = new RegExp(req.query.Status_Approve, "i");
        }
        if (req.query.UserID) {
            match.User = new RegExp(req.query.UserID, "i");
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
