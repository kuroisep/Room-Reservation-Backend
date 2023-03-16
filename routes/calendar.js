const { application } = require('express');
const express = require('express');
const router = express.Router();
const EventModel = require('../models/Event');
const UserModel = require('../models/Users');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const OrgModel = require('../models/Org');
const BuildingModel = require('../models/Building');

require("dotenv").config();

router.get('/', async (req, res) => {

    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1], decoded;
        console.log(authorization)

        try {
            decoded = jwt.verify(authorization, process.env.TOKEN_SECRET)
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
    }

    var userId = decoded._id;
    const User = await UserModel.findOne({ _id: userId })
    const Organization = User.org

    const org = await OrgModel.findOne({ name: Organization })


    EventModel.find({ 'id': { $in: [org.reqID] }, Status_Approve: "Approved" }).then(data => {
        res.send(data)
    });
})

router.get('/searchby', (req, res) => {
    const searchedField = req.query.Building;
    EventModel.find({ Building: { $regex: searchedField, $options: '$i' } })
        .then(data => {
            res.send(data)
        })
})

module.exports = router