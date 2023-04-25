const { application } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const OrgModel = require('../models/Org');
const BuildingModel = require('../models/Building');
const UserModel = require('../models/Users');
const StatusModel = require('../models/Status');
const EventModel = require('../models/Event')
const RoomTypeModel = require('../models/RoomType')
const RoomModel = require('../models/Rooms')
const RequestModel = require('../models/Requests')

router.post('/', async (req, res) => {
    const name = req.body.name
    const roomID = req.body.roomID
    const roomTypeID = req.body.roomTypeID
    const buildingID = req.body.buildingID
    const userID = req.body.userID
    const statusID = req.body.statusID

    const nameExist = await OrgModel.findOne({ name: req.body.name })
    if (nameExist) return res.status(400).send('Organization already exist');

    const Org = new OrgModel({
        name: name,
        roomID: roomID,
        roomTypeID: roomTypeID,
        buildingID: buildingID,
        userID: userID,
        statusID: statusID,
        active: true
    });

    try {
        await Org.save()
        res.send('Success')
    } catch (err) {
        res.status(400).send(err);
    }
})

router.get('/', async (req, res) => {
    OrgModel.find({ active: { $ne: false } }, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})

router.put("/:id", async (req, res) => {

    const id = req.params.id
    const org = await OrgModel.findById(id);

    if (req.body.name) {
        const newname = req.body.name;
        org.name = newname
    }

    try {
        await org.save();
        res.send("updated");

    } catch (err) {
        console.log(err);
    }
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const org = await OrgModel.findById(id)
        org.active = false
        await org.save()
        res.send("itemdeleted");
    }
    catch (err) {
        console.log(err);
    }

})

router.get('/search/:key', async (req, res) => {

    let result = await OrgModel.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { orgtype: { $regex: req.params.key } },
        ]
    })
    res.send(result);
})

router.get('/searchby', (req, res) => {
    const searchedField = req.query.name;
    OrgModel.find({ name: { $regex: searchedField, $options: '$i' } })
        .then(data => {
            res.send(data)
        })
})

router.get('/building/:id', async (req, res) => {
    const OrgID = req.params.id

    const result = await BuildingModel.find({
        "org.id": OrgID,
        active: { $ne: false }
    })

    res.send(result);
})

router.get('/user/:id', async (req, res) => {
    const id = req.params.id
    const org = await OrgModel.findOne({ _id: id })

    const users = org.userID
    UserModel.find({ _id: { $in: users.map((users) => new mongoose.Types.ObjectId(users)) }, active: true }).then(data => {
        res.send(data)
    })
})

router.get('/status/:id', async (req, res) => {
    const id = req.params.id
    const org = await OrgModel.findOne({ _id: id })

    const status = org.statusID;
    StatusModel.find({ _id: { $in: status.map((status) => new mongoose.Types.ObjectId(status)) }, active: true }).then(data => {
        res.send(data)
    })
})


router.get('/roomtype/:id', async (req, res) => {
    const id = req.params.id
    const org = await OrgModel.findOne({ _id: id })

    const roomtype = org.roomTypeID
    RoomTypeModel.find({ _id: { $in: roomtype.map((roomtype) => new mongoose.Types.ObjectId(roomtype)) }, active: true }).then(data => {
        res.send(data)
    })
})

router.get('/room/:id', async (req, res) => {
    const id = req.params.id
    const org = await OrgModel.findOne({ _id: id })

    const room = org.roomID
    RoomModel.find({ _id: { $in: room.map((room) => new mongoose.Types.ObjectId(room)) }, active: true }).then(data => {
        res.send(data)
    })
})

router.get('/stat', async (req, res) => {
    const lookup = (collection, orgPath) => [
        {
            $lookup: {
                from: `${collection}`,
                let: { 'orgID': '$_id' },
                pipeline: [
                    {
                        $match: {
                            active: { $ne: false },
                            $expr: {
                                $eq: [
                                    { $toObjectId: `$${orgPath}`, },
                                    "$$orgID",
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            '_id': '_',
                            'active': {
                                $sum: {
                                    $cond: [{ $eq: ['$active', false] }, 0, 1]
                                }
                            }
                        }
                    },
                ],
                as: `${collection}`,
            }
        },
        {
            $set: {
                [collection]: {
                    $ifNull: [
                        { $arrayElemAt: [`$${collection}.active`, 0] },
                        0
                    ]
                },
            }
        },
    ]

    const pipeline = [
        {
            $match: { active: { $ne: false } }
        },
        {
            $project: {
                '_id': 1,
                'name': 1
            }
        },
        ...lookup("buildings", "org.id"),
        ...lookup("rooms", "Org.id"),
        ...lookup("users", "org.id"),
    ]

    const result = await OrgModel.aggregate(pipeline).exec();

    res.send(result);
})

module.exports = router
