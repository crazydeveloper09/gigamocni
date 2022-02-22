const express = require("express"),
    app = express(),
    router = express.Router();


router.get("/", (req, res) => {
    res.render("index", {
        header: "Strona Główna | GigaMocni!",
        currentUser: req.user
    });
})



router.get("*", (req, res) => {
    let header = "Strona nie znaleziona | GigaMocni";
    res.render("error", {
        header: header
    })
})

module.exports = router;