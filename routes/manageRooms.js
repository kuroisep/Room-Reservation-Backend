const { application } = require('express');
const express = require('express');
const router = express.Router();
const RoomsModel = require('../models/Rooms');
const BuildingModel = require('../models/Building');
const RoomTypeModel = require('../models/RoomType');
const OrgModel = require('../models/Org')
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const multer = require('multer');

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

    const Organization = await OrgModel.findById(req.body.org)

    const name = req.body.name
    const roomType = req.body.roomType
    const roomID = req.body.roomID
    const org = Organization.name

    const Building = new BuildingModel({
        name: name,
        roomType: roomType,
        roomID: roomID,
        org: org
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


router.put("/building/:id", async (req, res) => {
    const newname = req.body.name;
    const id = req.params.id;

    const building = await BuildingModel.findById(id)

    try {
        building.name = newname;
        building.save();
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


router.put("/roomtype/:id", async (req, res) => {

    const newname = req.body.name;
    const id = req.params.id;

    const roomtype = await RoomTypeModel.findById(id)

    try {
        roomtype.name = newname
        roomtype.save()
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

const maxSize = 10 * 1000 * 1000;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer(
    {
        storage: storage,
        limits: { fileSize: maxSize }
    }
);

router.post('/room', upload.single('image'), async (req, res) => {

    const Build = await BuildingModel.findById(req.body.Building);
    const RoomT = await RoomTypeModel.findById(req.body.RoomType);

    cloudinary.v2.uploader.upload(req.file.path, { folder: "rooms" }, async (error, result) => {

        const Name = req.body.Name
        const Detail = req.body.Detail
        const Contributor = req.body.Contributor
        const RoomType = RoomT.name
        const Building = Build.name
        const Org = Build.org
        const Seat = req.body.Seat
        const Size = req.body.Size
        const Object = req.body.Object
        const useCount = req.body.useCount
        const image = {
            public_id: result.public_id,
            url: result.secure_url
        }

        const organization = await OrgModel.findOne({ name: Org })

        const Rooms = new RoomsModel({
            Name: Name,
            Detail: Detail,
            Contributor: Contributor,
            RoomType: RoomType,
            Building: Building,
            Org: Org,
            Seat: Seat,
            Size: Size,
            Object: Object,
            useCount: useCount,
            image: image
        });

        organization.roomID.push(Rooms._id.toString())
        await organization.save()

        Build.roomID.push(Rooms._id.toString())
        await Build.save()

        RoomT.roomID.push(Rooms._id.toString())
        await RoomT.save()

        try {
            Rooms.save();
            res.send('Success')
        } catch (err) {
            res.send(err)
        }
    })
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


router.put("/room/:id", upload.single('image'), async (req, res) => {

    const room = await RoomsModel.findById(req.params.id);
    const Build = await BuildingModel.findById(req.body.Building);
    const RoomT = await RoomTypeModel.findById(req.body.RoomType);

    const newName = req.body.Name
    const newDetail = req.body.Detail
    const newContributor = req.body.Contributor
    const newRoomType = RoomT.name
    const newBuilding = Build.name
    const newOrg = Build.org
    const newSeat = req.body.Seat
    const newSize = req.body.Size
    const newObject = req.body.Object

    if (req.body.image !== '') {
        const imgid = room.image.public_id;
        if (imgid) {
            await cloudinary.v2.uploader.destroy(imgid);
        }

        await cloudinary.v2.uploader.upload(req.file.path, { folder: "rooms" }, async (error, newresult) => {
            room.image = {
                public_id: newresult.public_id,
                url: newresult.secure_url
            }
        })
    }

    room.Name = newName
    room.Detail = newDetail
    room.Contributor = newContributor
    room.RoomType = newRoomType
    room.Building = newBuilding
    room.Org = newOrg
    room.Seat = newSeat
    room.Size = newSize
    room.Object = newObject

    try {
        room.save();
        res.send("updated");
    } catch (err) {
        console.log(err);
    }

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