const mongoose = require("mongoose");

let zoomSchema = new mongoose.Schema({
    title: String,
    type: String,
    description: String,
    link: String,
    meetingID: String,
    meetingPassword: String
})

module.exports = mongoose.model("Zoom", zoomSchema);