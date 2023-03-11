const { application } = require('express');
const express = require('express');
const router = express.Router();
const EventModel = require('../models/Event')
const auth = require('../middleware/auth')

router.get('/', async (req, res) => {
    EventModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})

router.get('/searchby', (req, res) => {
    const searchedField = req.query.Building;
    EventModel.find({ Building: { $regex: searchedField, $options: '$i' } })
        .then(data => {
            res.send(data)
        })
})

module.exports = router