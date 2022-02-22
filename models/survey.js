const mongoose = require("mongoose");

let surveySchema = new mongoose.Schema({
    name: String,
    type: String,
    description: String,
    for: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member"
    },
    options: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Option"
        }
    ],
    answers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Answer"
        }
    ],
})

module.exports = mongoose.model("Survey", surveySchema);