const { application } = require('express');
const express = require('express');
const router = express.Router();
const EquipModel = require('../models/Equipment')

router.post('/', async (req, res) => {
    const name = req.body.name
    const model = req.body.model

    const Equipment = new EquipModel({
        name: name,
        model: model
    });

    try {
        await Equipment.save()
        res.send('Success')
    } catch (err) {
        res.status(400).send(err);
    }
})

router.get('/', async (req, res) => {
    EquipModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})

router.put("/", async (req, res) => {
    const newname = req.body.newname;
    const newmodel = req.body.newmodel
    const id = req.body.id;

    try {
        await OrgModel.findById(id, (error, friendToUpdate) => {
            res.name = newname,
                res.model = newmodel,
                EquipModel.save();
        });
    } catch (err) {
        console.log(err);
    }

    res.send("updated");
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await EquipModel.findByIdAndRemove(id).exec()
        res.send("itemdeleted");
    }
    catch (err) {
        console.log(err);
    }

})

router.get('/search/:key', async (req, res) => {

    let result = await EquipModel.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { model: { $regex: req.params.key } },
        ]
    })
    res.send(result);
})

router.get('/searchby', (req, res) => {
    const searchedField = req.query.name;
    EquipModel.find({ name: { $regex: searchedField, $options: '$i' } })
        .then(data => {
            res.send(data)
        })
})

module.exports = router