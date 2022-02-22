const mongoose = require("mongoose");

let eventSchema = new mongoose.Schema({
    name: String,
    type: String,
    date: Date,
    time: String,
    description: String,
    zoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zoom"
    }
})

module.exports = mongoose.model("Event", eventSchema);
