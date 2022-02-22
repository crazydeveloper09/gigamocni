const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

let memberSchema = new mongoose.Schema({
    name: String,
    surname: String,
    username: String,
    password: String,
    email: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: String,
    description: String,
    profile: String,
    instagramLink: String,
    facebookLink: String,
    snapchatLink: String,
    edited: {
        type: Date,
        default: Date.now()
    }
})

memberSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Member", memberSchema);