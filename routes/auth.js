const router = require('express').Router();
const User = require('../models/Users');
const StatusModel = require('../models/Status');
const OrgModel = require('../models/Org');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require("dotenv").config();

router.post('/register', async (req, res) => {

    //Validation
    /*  const { error } = registerValidation(req.body);
      if (error) return res.status(400).send(error.details[0].message);*/

    //Check duplicate user
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Email already exists');

    //Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const Status = await StatusModel.findById(req.body.status);
    const Organization = await OrgModel.findById(req.body.org);

    //Create new user
    const Users = new User({
        username: req.body.username,
        password: hashedPassword,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        status: Status.name,
        role: req.body.role,
        org: Organization.name
    });

    Status.userID.push(Users._id.toString())
    Organization.userID.push(Users._id.toString())

    try {
        const savedUser = await Users.save();
        res.send({ Users: Users._id });
    } catch (err) {
        res.status(400).send(err)
    }
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
        res.header('auth-token', token).send(token);
    }

    //Create and assign a token
});

module.exports = router;