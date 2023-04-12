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
        //    console.log(authorization)

        try {
            decoded = jwt.verify(authorization, process.env.TOKEN_SECRET)
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
    }

    var userId = decoded._id;
    const User = await UserModel.findOne({ _id: userId })

    let org;
    if (typeof User.org === 'object' && typeof User.org.id === 'string') {
        org = await OrgModel.findById(User.org.id);
    } else
        if (typeof User.org === 'string') {
            org = await OrgModel.findOne({ name: User.org });
        } else {
            return res.status(500).send('invalid org format');
        }

    EventModel.find({ 'id': { $in: [org.eventID] }, Status_Approve: "Approved" }).then(data => {
        res.send(data)
    });
})

router.get('/searchby/', async (req, res) => {
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
            ...addCondition("Room.id", req.query.Room),
            ...addCondition("RoomType.id", req.query.RoomType),
            ...addCondition("Building.id", req.query.Building),
            ...addCondition("Org.id", req.query.Org),
        };

        const result = await EventModel.aggregate([{ $match: match }]);

        res.send(result)
    } catch (err) {
        res.status(500).send(err);
    }
})

module.exports = router
