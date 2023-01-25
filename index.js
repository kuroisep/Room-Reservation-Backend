const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

//Import Routes
const manageUser = require('./routes/manageUser');
const manageRooms = require('./routes/manageRooms');
const authentication = require('./routes/auth');

app.use('/manageUsers', manageUser);
app.use('/manageRooms', manageRooms);

mongoose.connect("mongodb+srv://databaseAdmin:admin000@cluster0.fn3kdvx.mongodb.net/?retryWrites=true&w=majority"
    , { useNewUrlParser: true }, 
    () => console.log('Connect to DB'));

app.listen(3001, () => {
    console.log('You are connected!');
})