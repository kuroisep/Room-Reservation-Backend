const mongoose = require('mongoose')

const RequestSchema = new mongoose.Schema({
    Room: {
        type: String,
        required: true
    },
    UserID: {
        type: String,
        required: true,
    },
    Object: {
        type: [],
        required: true,
    },
    Date_Reserve: {
        type: Array,
        default: [Date]
    },
    Status_Approve: {
        type: String,
        default: "Unapproved"
    },
    Seat: {
        type: String,
    }
}, { timestamp: true });

RequestSchema.static.toApiRequestModel = function (data) {
    return data.map(function (request) {
        return {
            Room: request.Room,
            UserID: request.UserID,
            Date_Reserve: request.Date_Reserve,
            Status_Approve: request.Status_Approve,
            Seat: request.Seat
        }
    })
}

const RequestsModel = mongoose.model('requests', RequestSchema)

module.exports = RequestsModel;