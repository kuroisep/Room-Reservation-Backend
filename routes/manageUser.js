const { application } = require('express');
const express = require('express');
const { model } = require('mongoose');
const router = express.Router();
const UsersModel = require('../models/Users');

router.post('/adduser', async (req, res) => {
    const user = req.body.user
    const pass = req.body.pass
    const first_name = req.body.firstname
    const last_name = req.body.lastname

    const email = req.body.Email
    const status = req.body.Status

    const role = req.body.Role
    
    const Users = new UsersModel({
        user: user,
        pass: pass,
        firstname: first_name,
        lastname: last_name,
        Email: email,
        Status: status,
        Role: role,
    });

    try{
        await Users.save();
        res.send('Success');
    }catch(err){
        res.status(400).send(err);
    }
});

router.get('/readuser', async (req, res) => {
    UsersModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})

router.put("/updateuser", async (req, res) => {
    const newPass = req.body.newPass
    const newFirstName = req.body.newFirstName
    const newLastName = req.body.newLastName
    const newAge = req.body.newAge;
    const id = mongoose.Types.ObjectId(req.body.id);
    console.log(id);
    try {
        await UsersModel.findById(id, (error, res) => {
            res.pass = newPass;
            res.firstname = newFirstName;
            res.lastname = newLastName;
            res.age = Number(newAge);
            res.save();
        });
    } catch (err) {
        console.log(err);
    }

    res.send("updated");
})

router.delete('/deleteuser/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await UsersModel.findByIdAndRemove(id).exec()
        res.send("itemdeleted");
    }
    catch (err) {
        console.log(err);
    }

})

module.exports = router;