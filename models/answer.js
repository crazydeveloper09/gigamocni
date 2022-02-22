const mongoose = require("mongoose");

let answerSchema = new mongoose.Schema({
    description: String,
    survey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Survey"
    },
    
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member"
    },
    
})

module.exports = mongoose.model("Answer", answerSchema);