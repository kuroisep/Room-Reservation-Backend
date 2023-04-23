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
        org: org,
        active: true
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
    StatusModel.find({ active: { $ne: false } }, (err, result) => {
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
    const OrgOld = await OrgModel.findById(status.org.id)

    if (req.body.org && req.body.org != status.org.id) {
        const OrgNew = await OrgModel.findById(req.body.org)
        status.org = {
            id: req.body.org,
            name: OrgNew.name
        }
        OrgNew.statusID.push(status._id.toString())
        await OrgNew.save()
        OrgOld.statusID = OrgOld.statusID.filter(e => e !== status._id.toString())
        await OrgOld.save()
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
        const status = await StatusModel.findById(id)
        status.active = false
        await status.save()
        res.send("active status is false");
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
            active: true
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
    UsersModel.find({ active: { $ne: false } }, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})


router.put("/:id", upload.single('image'), async (req, res) => {

    const user = await UsersModel.findById(req.params.id)

    const salt = await bcrypt.genSalt(10);

    if (req.body.username) {
        const newusername = req.body.username
        user.username = newusername
    }
    if (req.body.password) {
        const newpassword = await bcrypt.hash(req.body.password, salt);
        user.password = newpassword
    }
    if (req.body.firstname) {
        const newfirstname = req.body.firstname
        user.firstname = newfirstname
    }
    if (req.body.lastname) {
        const newlastname = req.body.lastname
        user.lastname = newlastname
    }
    if (req.body.email) {
        const newemail = req.body.email
        user.email = newemail
    }

    let OrgOld
    let StatusOld
    let OrgNew
    let StatusNew

    if (req.body.status && req.body.status != user.status.id) {

        StatusOld = await StatusModel.findById(user.status.id)
        StatusOld.userID = StatusOld.userID.filter(e => e !== user._id.toString())
        OrgOld = await OrgModel.findById(user.org.id)
        OrgOld.userID = OrgOld.userID.filter(e => e !== user._id.toString())

        StatusNew = await StatusModel.findById(req.body.status)
        OrgNew = await OrgModel.findById(StatusNew.org.id)

        user.status = {
            id: req.body.status,
            name: StatusNew.name
        }
        user.org = {
            id: req.body.org,
            name: OrgNew.name
        }
    }
    if (req.body.org && req.body.org !== user.org.id) {

        OrgOld = await OrgModel.findById(user.org.id)
        OrgOld.userID = OrgOld.userID.filter(e => e !== user._id.toString())
        OrgNew = await OrgModel.findById(StatusNew.org.id)

        user.org = {
            id: req.body.org,
            name: OrgNew.name
        }
    }
    if (req.body.role) {
        const newrole = req.body.role
        user.role = newrole
    }

    if (req.file) {
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

    try {
        await user.save()
        await OrgOld?.save()
        await StatusOld?.save()
        await OrgNew?.save()
        await StatusNew?.save()
        res.send("updated")
    } catch (err) {
        console.log(err)
    }
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await UsersModel.findById(id)
        user.active = false
        await user.save()
        res.send("active status is false");
    }
    catch (err) {
        console.log(err);
    }

})

router.get('/search/:key', async (req, res) => {

    let result = await UsersModel.find({
        $or: [
            { username: { $regex: req.params.key } },
            { email: { $regex: req.params.key } },
        ],
        active: { $ne: false }
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
            ...addCondition("role", req.query.role),
            ...addCondition("email", req.query.email, true),
            ...addCondition("status.id", req.query.status),
            ...addCondition("org.id", req.query.org),
            ...{ active: { $ne: false } },
        };

        const result = await UsersModel.aggregate([{ $match: match }]);

        res.send(result)
    } catch (err) {
        res.status(500).send(err);
    }
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

router.get('/:id', (req, res) => {
    var userId = req.params.id;
    UsersModel.findOne({ _id: userId }).then(function (user) {
        res.send(user)
    });
})

router.get('/statususer/:id', async (req, res) => {
    const id = req.params.id
    const status = await StatusModel.findOne({ _id: id })

    const users = status.userID
    UsersModel.find({
        _id: { $in: users.map((users) => new mongoose.Types.ObjectId(users)) },
        active: { $ne: false },
    }).then(data => {
        res.send(data)
    })
})

module.exports = router;
