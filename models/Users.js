const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    user : {
        type: String,
        required : true,
    },
    pass : {
        type: String,
        required : true,
    },
    firstname: {
        type: String,
        required : true
    },
    lastname:{
        type:String,
        required : true
    },
    
    Email : {
        type : String,
        required : true,
    },
    Status : {
        type : String,
        required : true,
    },
    
    Role : {
        type : String,
        required : true,
    },
    
    

});

module.exports = mongoose.model('users',UserSchema)