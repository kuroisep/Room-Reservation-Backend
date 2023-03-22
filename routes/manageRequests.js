const { application } = require('express');
const express = require('express');
const router = express.Router();
const RequestsModel = require('../models/Requests');
const EventModel = require('../models/Event');
const UserModel = require('../models/Users');
const auth = require('../middleware/auth');
const RoomModel = require('../models/Rooms');
const OrgModel = require('../models/Org');
const mongoose = require('mongoose')

router.post('/', async (req, res) => {
    const User = await UserModel.findById(req.body.UserID)
    const Rooms = await RoomModel.findById(req.body.Room)

    // Org = mongoose.Types.ObjectId(User.org)

    const Organization = await OrgModel.findOne({ name: User.org })

    const Room = Rooms.Name
    const Building = Rooms.Building
    const UserID = req.body.UserID
    const username = User.username
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
        UserID: UserID,
        username: username,
        username: username,
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

    try {
        await Requests.save()
        res.send('Success')
    } catch (err) {
        res.status(400).send(err);
    }

    for (let i = 0; i < startTime.length; i++) {
        const Event = new EventModel({
            Room: Room,
            Building: Building,
            UserID: UserID,
            startTime: startTime[i],
            endTime: endTime[i],
            allDay: allDay,
            Status_Approve: Status_Approve,
            Seat: Seat,
            Object: Object,
            Purpose: Purpose
        })
        //  console.log(Date_Reserve[i])
        await Event.save();

        Organization.reqID.push(Event._id.toString())
        await Organization.save()
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

router.put("/", async (req, res) => {
    const newEquipment = req.body.newEquipment;
    const newDate_Reserve = req.body.newDate_Reserve
    const newStatus_Approve = req.body.newStatus_Approve
    const newSeat = req.body.newSeat
    const id = req.body.id;

    try {
        await RequestsModel.findById(id, (error, friendToUpdate) => {
            res.Equipment = newEquipment;
            res.Date_Reserve = newDate_Reserve;
            res.Status_Approve = newStatus_Approve;
            res.Seat = newSeat
            RequestsModel.save();
        });
    } catch (err) {
        console.log(err);
    }

    res.send("updated");
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

router.get('/searchby', (req, res) => {
    const searchedField = req.query.UserID;
    RequestsModel.find(
        { UserID: { $regex: searchedField, $options: '$i' } })
        .then(data => {
            res.send(data)
        })
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