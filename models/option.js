const mongoose = require("mongoose");

let optionSchema = new mongoose.Schema({
    description: String,
    survey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Survey"
    },
    numberOfAnswers: {
        type: Number,
        default: 0
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member"
        }
    ],
    color: String
})

module.exports = mongoose.model("Option", optionSchema);