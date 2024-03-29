const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary')

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

//Import Routes
const manageUser = require('./routes/manageUser');
const manageRooms = require('./routes/manageRooms');
const authentication = require('./routes/auth');
const calendar = require('./routes/calendar');
const manageRequests = require('./routes/manageRequests');
const manageOrg = require('./routes/manageOrg');
const static = require('./routes/static');

app.use('/users', manageUser);
app.use('/rooms', manageRooms);
app.use('/auth', authentication);
app.use('/calendar', calendar);
app.use('/requests', manageRequests);
app.use('/org', manageOrg);
app.use('/static', static)

app.get("/", (req, res) => {
    res.json({ result: "ok" })
})

mongoose.connect("mongodb+srv://databaseAdmin:admin000@cluster0.fn3kdvx.mongodb.net/?retryWrites=true&w=majority"
    , { useNewUrlParser: true },
    () => console.log('Connect to DB'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running. ${PORT}`);
});