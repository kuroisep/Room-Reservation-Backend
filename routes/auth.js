const router = require('express').Router();
const User = require('../models/Users');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require("dotenv").config();

router.post('/register', async(req,res) => {

    //Validation
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    //Check duplicate user
    const emailExist = await User.findOne({Email: req.body.Email})
    if(emailExist) return res.status(400).send('Email already exists');

    //Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.pass, salt);

    //Create new user
    const user = new User({
        user: req.body.user,
        Email: req.body.Email,
        pass: hashedPassword
    });

    try{
        const savedUser = await user.save();
        res.send({ user: user._id });
    }catch(err){
        res.status(400).send(err)   
    }
});

//LOGIN
router.post('/login', async (req, res) => {

    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({Email: req.body.Email})
    if(!user) return res.status(400).send('Email is not found');
    //Password is correct?
    const validPass = await bcrypt.compare(req.body.pass, user.pass);
    if(!validPass) return res.status(400).send('Invalid Password');
    else {
        const token = jwt.sign({_id : user._id}, process.env.TOKEN_SECRET);
        res.header('auth-token', token).send(token);
    }

    //Create and assign a token
});

module.exports = router;