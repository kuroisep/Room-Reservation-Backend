const router = require('express').Router();
const User = require('../models/Users');
const StatusModel = require('../models/Status');
const OrgModel = require('../models/Org');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary');

require("dotenv").config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

router.post('/register', upload.single('image'), async (req, res) => {

    //Validation
    /*  const { error } = registerValidation(req.body);
      if (error) return res.status(400).send(error.details[0].message);*/

    //Check duplicate user
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Email already exists');

    //Hash passwords
    const Status = await StatusModel.findById(req.body.status);
    const Organization = await OrgModel.findById(req.body.org);

    const salt = await bcrypt.genSalt(10);

    cloudinary.v2.uploader.upload(req.file.path, async (error, result) => {

        const username = req.body.username
        const password = await bcrypt.hash(req.body.password, salt);
        const firstname = req.body.firstname
        const lastname = req.body.lastname
        const email = req.body.email
        const status = Status.name
        const org = Organization.name
        const role = req.body.role
        const image = {
            public_id: result.public_id,
            url: result.secure_url
        }

        const Users = new User({
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            email: email,
            status: status,
            role: role,
            org: org,
            image: image
        });

        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
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

//LOGIN
router.post('/login', async (req, res) => {

    /*  const { error } = loginValidation(req.body);
      if (error) return res.status(400).send(error.details[0].message);*/

    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send('Email is not found');
    //Password is correct?
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid Password');
    else {
        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
        user.token = token

        res.status(200).send(user)
    }
    //Create and assign a token
});

module.exports = router;