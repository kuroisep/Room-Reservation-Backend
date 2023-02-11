const { application } = require('express');
const express = require('express');
const router = express.Router();
const RequestsModel = require('../models/Requests')
const auth = require('../middleware/auth')

router.post('/', async (req, res) => {
    const Room = req.body.Room
    const UserID = req.body.UserID
    const Equipment = req.body.Equipment
    const Date_Reserve = req.body.Date_Reserve
    const Status_Approve = req.body.Status_Approve
    const Seat = req.body.Seat

    const Requests = new RequestsModel({
        Room: Room,
        UserID: UserID,
        Equipment: Equipment,
        Date_Reserve: Date_Reserve,
        Status_Approve: Status_Approve,
        Seat: Seat
    });

    try {
        await Requests.save()
        res.send('Success')
    } catch (err) {
        res.status(400).send(err);
    }
})

router.get('/', async (req, res) => {

    let result = await RequestsModel.find({}).select({
        "Room": 1,
        "UserID": 1
    })
    res.send(result)
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
    const searchedField = req.query.Status_Approve;
    RequestsModel.find({ Status_Approve: { $regex: searchedField, $options: '$i' } })
        .then(data => {
            res.send(data)
        })
})

module.exports = router