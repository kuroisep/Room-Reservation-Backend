const { application } = require('express');
const express = require('express');
const router = express.Router();
const RoomsModel = require('../models/Rooms');
const BuildingModel = require('../models/Building');
const RoomTypeModel = require('../models/RoomType');
const UsersModel = require('../models/Users');
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
    const roomID = req.body.roomID
    const org = {
        id: req.body.org,
        name: Organization.name
    }

    const Building = new BuildingModel({
        name: name,
        roomID: roomID,
        org: org,
        active: true,
    });

    await Building.save();

    Organization.buildingID.push(Building._id.toString())
    await Organization.save()
    res.send('Success')
});


router.get('/building', async (req, res) => {
    BuildingModel.find({ active: { $ne: false } }, (err, result) => {
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
        res.status(500).send(err);
    }

    res.send("updated");
})

router.delete('/building/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const building = await BuildingModel.findById(id)
        building.active = false
        await building.save()
        res.send("active status is false");
    }
    catch (err) {
        console.log(err);
    }

})

router.post('/roomtype', async (req, res) => {

    const organization = await OrgModel.findById(req.body.org)

    const name = req.body.name
    const org = {
        id: req.body.org,
        name: organization.name
    }
    const roomID = req.body.roomID

    const RoomTypes = new RoomTypeModel({
        name: name,
        org: org,
        roomID: roomID,
        active: true,
    });

    organization.roomTypeID.push(RoomTypes._id.toString())
    await organization.save()

    await RoomTypes.save();
    res.send('Success')
});


router.get('/roomtype', async (req, res) => {
    RoomTypeModel.find({ active: { $ne: false } }, (err, result) => {
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
        const roomtype = await RoomTypeModel.findById(id)
        roomtype.active = false
        await roomtype.save()
        res.send("active is false");
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
    const Cont = await UsersModel.findById(req.body.Contributor);

    if (req.file === undefined) {
        res.status(400).send('Must have image')
    }

    const imageValue = await cloudinary.v2.uploader.upload(req.file.path, { folder: "rooms" });
    // Remove local temp file ??

    const Name = req.body.Name
    const Detail = req.body.Detail
    const Contributor = {
        id: req.body.Contributor,
        name: Cont.email
    }
    const RoomType = {
        id: req.body.RoomType,
        name: RoomT.name
    }
    const Building = {
        id: req.body.Building,
        name: Build.name
    }
    const Org = {
        id: Build.org.id,
        name: Build.org.name
    }
    const Seat = req.body.Seat
    const Size = req.body.Size
    const Object = req.body.Object
    const useCount = req.body.useCount
    const image = {
        public_id: imageValue.public_id,
        url: imageValue.secure_url
    }

    const organization = await OrgModel.findById(Build.org.id)

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
        image: image,
        active: true,
    });

    organization.roomID.push(Rooms._id.toString())
    await organization.save()

    Build.roomID.push(Rooms._id.toString())
    await Build.save()

    RoomT.roomID.push(Rooms._id.toString())
    await RoomT.save()

    try {
        await Rooms.save();
        res.send('Success')
    } catch (err) {
        res.status(500).send(err)
    }
});


router.get('/room', paginatedResults(RoomsModel), async (req, res) => {

    RoomsModel.find({ active: { $ne: false } }, (err) => {
        if (err) {
            res.send(err)
        } else {
            res.send(res.paginatedResults)
        }
    })
})


router.put("/room/:id", upload.single('image'), async (req, res) => {
    const room = await RoomsModel.findById(req.params.id);

    if (req.file) {
        const imgid = room.image.public_id;
        if (imgid) {
            await cloudinary.v2.uploader.destroy(imgid);
        }

        const imageValue = await cloudinary.v2.uploader.upload(req.file.path, { folder: "rooms" })
        // Remove local temp file ??
        room.image = {
            public_id: imageValue.public_id,
            url: imageValue.secure_url
        }
    }

    let BuildOld;
    let OrgOld;
    let RoomTOld;

    if (req.body.Building && req.body.Building != room.Building.id) {
        const BuildNew = await BuildingModel.findById(req.body.Building)
        const OrgNew = await OrgModel.findById(BuildNew.org.id)

        room.Building = {
            id: BuildNew._id,
            name: BuildNew.name
        }
        room.Org = {
            id: OrgNew._id,
            name: OrgNew.name
        }

        BuildOld = await BuildingModel.findById(room.Building.id)
        BuildOld.roomID = BuildOld.roomID.filter(e => e !== room._id.toString())
     //   OrgOld = await OrgModel.findOne({name:room.Org.name})
     //   console.log(room.Org)
     //   OrgOld.roomID = OrgOld.roomID.filter(e => e !== room._id.toString())
    }
    if (req.body.RoomType && req.body.RoomType != room.RoomType.id) {
        const RoomTNew = await RoomTypeModel.findById(req.body.RoomType)

        room.RoomType = {
            id: RoomTNew._id,
            name: RoomTNew.name
        }

        RoomTOld = await RoomTypeModel.findById(room.RoomType.id)
        RoomTOld.roomID = RoomTOld.roomID.filter(e => e !== room._id.toString())
    }
    if (req.body.Contributor && req.body.Contributor != room.Contributor.id) {
        const ContNew = await UsersModel.findById(req.body.Contributor)
        room.Contributor = {
            id: ContNew._id,
            name: ContNew.email
        }
    }

    room.Name = req.body.Name || room.Name;
    room.Detail = req.body.Detail || room.Detail;
    room.Seat = req.body.Seat || room.Seat;
    room.Size = req.body.Size || room.Size;
    room.Object = req.body.Object || room.Object;

    try {
        await room.save();
        await BuildOld?.save();
        await OrgOld?.save();
        await RoomTOld?.save()
        res.send("updated");
    } catch (err) {
        res.status(500).send(err)
        console.log(err);
    }
})

router.delete('/room/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const room = await RoomsModel.findById(id)
        room.active = false
        await room.save()
        res.send("active status is false");
    }
    catch (err) {
        res.status(500).send(err)
    }

})

router.get('/search/:key', async (req, res) => {

    let result = await RoomsModel.find({
        Name: { $regex: req.params.key },
        active: { $ne: false },
    })
    res.send(result);
})

router.get('/searchby', async (req, res) => {

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
            ...addCondition("Name", req.query.Name, true),
            ...addCondition("Contributor.id", req.query.ContributorID),
            ...addCondition("RoomType.id", req.query.RoomTypeID),
            ...addCondition("Building.id", req.query.BuildingID),
            ...addCondition("Org.id", req.query.OrgID),
            ...addCondition("Seat", req.query.Seat, false, true),
            ...addCondition("Size", req.query.Size, true),
            ...addCondition("Object", req.query.Object, true),
            ...{ active: { $ne: false } },
        };

        if (req.query.Object) {
            match.Object = new RegExp(req.query.Object, "i")
        }

        const result = await RoomsModel.aggregate([{ $match: match }]);

        res.send(result)
    } catch (err) {
        res.status(500).send(err);
    }
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

router.get('/buildingroom/:id', async (req, res) => {
    const id = req.params.id
    const building = await BuildingModel.findOne({ _id: id })

    const rooms = building.roomID
    RoomsModel.find({
        _id: { $in: rooms.map((rooms) => new mongoose.Types.ObjectId(rooms)) },
        active: { $ne: false }
    }).then(data => {
        res.send(data)
    })
})

router.get('/roomtyperoom/:id', async (req, res) => {
    const id = req.params.id
    const roomtype = await RoomTypeModel.findById(id)

    const rooms = roomtype.roomID;
    RoomsModel.find({
        _id: { $in: rooms.map((rooms) => new mongoose.Types.ObjectId(rooms)) },
        active: { $ne: false },
    }).then(data => {
        res.send(data)
    })
})

module.exports = router;
