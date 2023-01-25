const { application } = require('express');
const express = require('express');
const router = express.Router();
const RequestsModel = require('../models/Requests')

router.get('/', async (req, res) => {
    RequestsModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})

/*router.put("/", async (req, res) => {
    const newreq = req.body.newreq;
    const id = req.body.id;
    console.log(newreq, id);

    try {
        await Request.findById(id, (error, friendToUpdate) => {
            res.n = newname;
            BuildingModel.save();
        });
    } catch (err) {
        console.log(err);
    }

    res.send("updated");
})*/

module.exports = router