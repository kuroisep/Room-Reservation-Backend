const { application } = require('express');
const express = require('express');
const router = express.Router();
const RequestsModel = require('./models/Requests');

app.get('/readrequest', async (req, res) => {
    RequestsModel.find({}, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })
})