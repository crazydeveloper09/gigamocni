const mongoose = require("mongoose");

let gameSchema = new mongoose.Schema({
    name: String,
    type: String,
    description: String,
    link: String,
    timesPlayed: String,
    color: String,
    edited: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Game", gameSchema);