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
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary');

require("dotenv").config();

router.post('/status', async (req, res) => {

    const Organization = await OrgModel.findById(req.body.org)

    const name = req.body.name
    const userID = req.body.userID
    const org = {
        id: req.body.org,
        name: Organization.name
    }

    const Status = new StatusModel({
        name: name,
        // priority: priority,
        userID: userID,
        org: org
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

router.put("/status/:id", async (req, res) => {

    const id = req.params.id
    const status = await StatusModel.findById(id)

    if (req.body.org) {
        const Organization = await OrgModel.findById(req.body.org)
        status.org = {
            id: req.body.org,
            name: Organization.name
        }
    }

    if (req.body.name) {
        const newname = req.body.name
        status.name = newname
    }

    try {
        status.save()
        res.send("updated");
    } catch (err) {
        console.log(err);
    }
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

router.get('/status/:id', (req, res) => {

    fetchid = req.params.id;
    StatusModel.find(({ _id: fetchid }), function (err, val) {
        res.send(val);
    })
})

router.get('/user/:id', (req, res) => {

    fetchid = req.params.id;
    UsersModel.find(({ _id: fetchid }), function (err, val) {
        res.send(val);
    })
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

router.post('/', upload.single('image'), async (req, res) => {

    const emailExist = await UsersModel.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Email already exists');

    const Status = await StatusModel.findById(req.body.status);
    const Organization = await OrgModel.findById(req.body.org);

    const salt = await bcrypt.genSalt(10);

    cloudinary.v2.uploader.upload(req.file.path, async (error, result) => {

        const username = req.body.username
        const password = await bcrypt.hash(req.body.password, salt);
        const firstname = req.body.firstname
        const lastname = req.body.lastname
        const email = req.body.email
        const status = {
            id: req.body.status,
            name: Status.name
        }
        const org = {
            id: req.body.org,
            name: Organization.name
        }
        const role = req.body.role
        const image = {
            public_id: result.public_id,
            url: result.secure_url
        }

        const Users = new UsersModel({
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            email: email,
            status: status,
            role: role,
            org: org,
            image: image,
        });

        const token = jwt.sign({ _id: Users._id }, process.env.TOKEN_SECRET)
        Users.token = token

        Status.userID.push(Users._id.toString());
        await Status.save()
        Organization.userID.push(Users._id.toString());
        await Organization.save()

        try {
            Users.save();
            res.send('Success');
        } catch (err) {
            res.status(400).send(err);
        }
    })
});

router.get('/', async (req, res) => {
    UsersModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})


router.put("/:id", upload.single('image'), async (req, res) => {

    const user = await UsersModel.findById(req.params.id)
    const Status = await StatusModel.findById(req.body.status);
    const Organization = await OrgModel.findById(req.body.org);

    const salt = await bcrypt.genSalt(10);


    const newusername = req.body.username
    //const newpassword = await bcrypt.hash(req.body.password, 10);
    const newfirstname = req.body.firstname
    const newlastname = req.body.lastname
    const newemail = req.body.email
    const newstatus = Status.name
    const neworg = Organization.name
    const newrole = req.body.role

    if (req.body.image !== '') {
        const imgid = user.image.public_id;
        if (imgid) {
            await cloudinary.v2.uploader.destroy(imgid);
        }

        await cloudinary.v2.uploader.upload(req.file.path, { folder: "users" }, async (error, newresult) => {
            user.image = {
                public_id: newresult.public_id,
                url: newresult.secure_url
            }
        })
    }

    user.username = newusername
    // user.password = newpassword
    user.firstname = newfirstname
    user.lastname = newlastname
    user.email = newemail
    user.status = newstatus
    user.role = newrole
    user.org = neworg

    try {
        user.save()
        res.send("updated")
    } catch (err) {
        console.log(err)
    }
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
            { username: { $regex: req.params.key } },
            { email: { $regex: req.params.key } },
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

router.get('/userprofile', (req, res) => {

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
