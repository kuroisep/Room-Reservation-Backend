const { application } = require('express');
const express = require('express');
const router = express.Router();
const OrgModel = require('../models/Org');
const BuildingModel = require('../models/Building');

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

router.put("/:id", async (req, res) => {

    const id = req.params.id

    const newname = req.body.name;
    const neworgType = req.body.orgType
    const newprofile = req.body.profile

    const org = await OrgModel.findById(id);

    try {
        org.name = newname,
            org.orgType = neworgType,
            org.profile = newprofile,
            org.save();

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

router.get('/building/:id', async (req, res) => {
    const id = req.params.id
    const org = await OrgModel.find({ _id: id })

    BuildingModel.find({ 'id': { $in: [org.buildingID] } }).then(data => {
        res.send(data)
    })
})

module.exports = router