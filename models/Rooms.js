const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    id_room : {
        type: String,
        required : true,
    },
    Name : {
        type: String,
        required : true,
    },
    Detail : {
        type: String,
        required : true,
    },
    Contributer : {
        type: String,
        required : true,
    },
    Building : {
        type: String,
        required : true,
    },
    
    
    

});

const RoomsModel = mongoose.model('rooms',RoomSchema)

module.exports = RoomsModel;