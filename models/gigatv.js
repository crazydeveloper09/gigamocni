const mongoose = require("mongoose");

const gigaTVSchema = new mongoose.Schema({
    name: String,
    youtubeLink: String
});

module.exports = mongoose.model("GigaTV", gigaTVSchema)
