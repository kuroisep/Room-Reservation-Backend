const { application } = require('express');
const express = require('express');
const router = express.Router();
const RoomsModel = require('../models/Rooms');
const BuildingModel = require('../models/Building');
const RoomTypeModel = require('../models/RoomType');
const OrgModel = require('../models/Org')
const mongoose = require('mongoose')

function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = req.query.limit

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        if (endIndex < model.length) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }

        try {
            results = await model.find().limit(limit).skip(startIndex).exec()
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }

        res.paginatedResults = results
    }
}

router.post('/building', async (req, res) => {

    const Organization = await OrgModel.findById(req.body.id)

    const name = req.body.name
    const roomType = req.body.roomType
    const roomID = req.body.roomID

    const Building = new BuildingModel({
        name: name,
        roomType: roomType,
        roomID: roomID
    });

    await Building.save();

    Organization.buildingID.push(Building._id.toString())
    await Organization.save()
    res.send('Success')
});


router.get('/building', async (req, res) => {
    BuildingModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})


router.put("/building", async (req, res) => {
    const newname = req.body.newname;
    const id = req.body.id;

    try {
        await BuildingModel.findById(id, (error, friendToUpdate) => {
            res.name = newname;
            BuildingModel.save();
        });
    } catch (err) {
        console.log(err);
    }

    res.send("updated");
})

router.delete('/building/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await BuildingModel.findByIdAndRemove(id).exec()
        res.send("itemdeleted");
    }
    catch (err) {
        console.log(err);
    }

})

router.post('/roomtype', async (req, res) => {

    Build = await BuildingModel.findById(req.body.building)

    const name = req.body.name
    const building = req.body.building
    const roomID = req.body.roomID

    const RoomTypes = new RoomTypeModel({
        name: name,
        building: building,
        roomID: roomID
    });

    Build.roomType.push(RoomTypes._id.toString())
    await Build.save()

    await RoomTypes.save();
    res.send('Success')
});


router.get('/roomtype', async (req, res) => {
    RoomTypeModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})


router.put("/roomtype", async (req, res) => {
    const newname = req.body.newname;
    const id = req.body.id;

    try {
        await RoomTypeModel.findById(id, (error, friendToUpdate) => {
            res.name = newname;
            RoomTypeModel.save();
        });
    } catch (err) {
        console.log(err);
    }

    res.send("updated");
})

router.delete('/roomtype/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await RoomTypeModel.findByIdAndRemove(id).exec()
        res.send("itemdeleted");
    }
    catch (err) {
        console.log(err);
    }

})


router.post('/room', async (req, res) => {

    Build = await BuildingModel.findById(req.body.Building)
    RoomT = await RoomTypeModel.findById(req.body.RoomType)

    const Name = req.body.Name
    const Detail = req.body.Detail
    const Contributor = req.body.Contributor
    const RoomType = RoomT.name
    const Building = Build.name
    const Seat = req.body.Seat
    const Size = req.body.Size
    const Equipment = req.body.Equipment
    const useCount = req.body.useCount

    const Rooms = new RoomsModel({
        Name: Name,
        Detail: Detail,
        Contributor: Contributor,
        RoomType: RoomType,
        Building: Building,
        Seat: Seat,
        Size: Size,
        Equipment: Equipment,
        useCount: useCount
    });

    Build.roomID.push(Rooms._id.toString())
    await Build.save()

    RoomT.roomID.push(Rooms._id.toString())
    await RoomT.save()

    await Rooms.save();
    res.send('Success')
});


router.get('/room', paginatedResults(RoomsModel), async (req, res) => {

    RoomsModel.find({}, (err) => {
        if (err) {
            res.send(err)
        } else {
            res.send(res.paginatedResults)
        }
    })
})


router.put("/room", async (req, res) => {

    const id = req.body.id
    const newName = req.body.newName
    const newDetail = req.body.newDetail
    const newContributor = req.body.newContributor
    const newSeat = req.body.Seat
    const newSize = req.body.Size
    const newEquipment = req.body.Equipment


    try {
        await RoomsModel.findById(id, (error, res) => {
            req.Name = newName
            req.Detail = newDetail
            req.Contributor = newContributor
            req.Seat = newSeat
            req.Size = newSize
            req.newEquipment = newEquipment
            RoomsModel.save();
        });
    } catch (err) {
        console.log(err);
    }

    res.send("updated");
})

router.delete('/room/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await RoomsModel.findByIdAndRemove(id).exec()
        res.send("itemdeleted");
    }
    catch (err) {
        console.log(err);
    }

})

router.get('/search/:key', async (req, res) => {

    let result = await RoomsModel.find({
        "$or": [
            {
                Name: { $regex: req.params.key },
                Contributor: { $regex: req.params.key }
            }
        ]
    })
    res.send(result);
})

router.get('/searchby', (req, res) => {
    const searchedField = req.query.Name;
    RoomsModel.find({ Name: { $regex: searchedField, $options: '$i' } })
        .then(data => {
            res.send(data)
        })

    const searchField1 = req.query.Contributor;
    RoomsModel.find({ Contributor: { $regex: searchField1, $options: '$i' } })
        .then(data => {
            res.send(data)
        })
})

router.get('/building/:id', (req, res) => {

    fetchid = req.params.id;
    BuildingModel.find(({ _id: fetchid }), function (err, val) {
        if (err) {
            res.send(err)
        }
        res.send(val);
    })
})

router.get('/roomtype/:id', (req, res) => {

    fetchid = req.params.id;
    RoomTypeModel.find(({ _id: fetchid }), function (err, val) {
        res.send(val);
    })
})

router.get('/room/:id', (req, res) => {

    fetchid = req.params.id;
    RoomsModel.find(({ _id: fetchid }), function (err, val) {
        res.send(val);
    })
})

module.exports = router;