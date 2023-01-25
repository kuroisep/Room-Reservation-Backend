const { application } = require('express');
const express = require('express');
const router = express.Router();
const OrgModel = require('../models/Org')

router.post('/', async (req, res) => {
    const name = req.body.name
    const orgType = req.body.orgType
    const profile = req.body.profile
    const roomID = req.body.roomID
    const roomTypeID = req.body.roomTypeID
    const buildingID = req.body.buildingID
    const userID = req.body.userID
    const statusID = req.body.statusID

    const Org = new OrgModel({
        name: name,
        orgType: orgType,
        profile: profile,
        roomID: roomID,
        roomTypeID: roomTypeID,
        buildingID: buildingID,
        userID: userID,
        statusID: statusID
    });

    try {
        await Org.save()
        res.send('Success')
    } catch (err) {
        res.status(400).send(err);
    }
})

router.get('/', async (req, res) => {
    OrgModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})

router.put("/", async (req, res) => {
    const newname = req.body.newname;
    const neworgType = req.body.neworgType
    const newprofile = req.body.newprofile
    const id = req.body.id;

    try {
        await OrgModel.findById(id, (error, friendToUpdate) => {
            res.name = newname,
                res.orgType = neworgType,
                res.profile = newprofile,
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
        await OrgModel.findByIdAndRemove(id).exec()
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

module.exports = router