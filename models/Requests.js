const mongoose = require('mongoose')

const RequestSchema = new mongoose.Schema({
    ID_Room : {
        type : String,
        required : true
    },
    Name_User : {
        type: String,
        required : true,
    },
    Participant : {
        type: Number,
        required : true,
    },
    Equipment : {
        type: String,
        required : true,
    },
    Date_Reserve : {
        type: String,
        required : true,
    },
    Status_Approve : {
        type: Boolean,
        required : true,
    }
    
    
    

});

const RequestsModel = mongoose.model('requests',RequestSchema)

module.exports = RequestsModel;