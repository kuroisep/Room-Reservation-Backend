const { application } = require('express');
const express = require('express');
const jwt = require('jsonwebtoken')
const { model } = require('mongoose');
const router = express.Router();
const UsersModel = require('../models/Users');
const StatusModel = require('../models/Status');
const OrgModel = require('../models/Org');
const mongoose = require('mongoose');
const multer = require('multer');
const auth = require('../middleware/auth')

var storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.filename)
    }
});

var upload = multer({ storage: storage });

router.post('/status', async (req, res) => {
    const priority = req.body.priority
    const name = req.body.name
    const userID = req.body.userID
    const orgID = Organization.name
    const Organization = await OrgModel.findById(req.body.orgID)

    const Status = new StatusModel({
        name: name,
        priority: priority,
        userID: userID,
        orgID: orgID
    });

    Organization.statusID.push(Status._id.toString())
    await Organization.save()

    try {
        await Status.save()
        res.send('Success')
    } catch (err) {
        res.status(400).send(err);
    }
})

router.get('/status', async (req, res) => {
    StatusModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        }
        else {
            res.send(result)
        }
    })
})

router.put("/status", async (req, res) => {
    const newname = req.body.newname
    const newpriority = req.body.newpriority

    const id = req.body.id;
    console.log(id);
    try {
        await StatusModel.findById(id, (error, res) => {
            res.name = newname;
            res.priority = newpriority;
            res.save();
        });
    } catch (err) {
        console.log(err);
    }

    res.send("updated");
})

router.delete('/status/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await StatusModel.findByIdAndRemove(id).exec()
        res.send("itemdeleted");
    }
    catch (err) {
        console.log(err);
    }

})

router.post('/', async (req, res) => {

    const Status = await StatusModel.findById(req.body.status);
    const Organization = await OrgModel.findById(req.body.org);

    const username = req.body.username
    const password = req.body.password
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const status = Status.name
    const org = Organization.name
    const role = req.body.role

    const Users = new UsersModel({
        username: username,
        password: password,
        firstname: firstname,
        lastname: lastname,
        email: email,
        status: status,
        role: role,
        org: org
    });

    Status.userID.push(Users._id.toString())
    Organization.userID.push(Users._id.toString())

    try {
        await Users.save();
        res.send('Success');
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/', async (req, res) => {
    UsersModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.render('imagesPage', { result: result });
            res.send(result)
        }
    })
})

router.put("/", async (req, res) => {
    const newPass = req.body.newPass
    const newFirstName = req.body.newFirstName
    const newLastName = req.body.newLastName
    const id = req.body.id;
    console.log(id);
    try {
        await UsersModel.findById(id, (error, res) => {
            res.pass = newPass;
            res.firstname = newFirstName;
            res.lastname = newLastName;
            res.save();
        });
    } catch (err) {
        console.log(err);
    }

    res.send("updated");
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await UsersModel.findByIdAndRemove(id).exec()
        res.send("itemdeleted");
    }
    catch (err) {
        console.log(err);
    }

})

router.get('/search/:key', async (req, res) => {

    let result = await UsersModel.find({
        "$or": [
            { user: { $regex: req.params.key } },
            { firstname: { $regex: req.params.key } },
            { lastname: { $regex: req.params.key } },
            { Status: { $regex: req.params.key } },
            { Role: { $regex: req.params.key } },
        ]
    })
    res.send(result);
})

router.get('/searchby', (req, res) => {
    const searchedField = req.query.Status;
    UsersModel.find({ Status: { $regex: searchedField, $options: '$i' } })
        .then(data => {
            res.send(data)
        })
})

router.get('/userId', (req, res) => {

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
    UsersModel.findOne({ _id: userId }).then(function (user) {
        res.send(user)
    });
})

module.exports = router;