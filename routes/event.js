const express = require("express"),
    router = express.Router(),
    app = express(),
    Event = require("../models/event"),
    Zoom = require("../models/zoom"),
    flash = require("connect-flash"),
    methodOverride = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", (req, res) => {
    Event.find({}).populate("zoom").exec((err, events) => {
        if(err){
            console.log(err)
        } else {
            let header = `Terminarz | GigaMocni!`;
            res.render("./events/index", {
                header: header,
                currentUser: req.user,
                events: events
            });
        }
    })
   
})

router.get("/new", isLoggedIn, (req, res) => {
    Zoom.find({}, (err, zooms) => {
        if(err){
            console.log(err);
        } else {
            let header = `Dodaj wydarzenie | GigaMocni!`;
            res.render("./events/new", {
                header: header,
                zooms: zooms
            })
        }
    })
    
})

router.post("/", isLoggedIn,  (req, res) => {
    let newEvent = new Event({
        name: req.body.name,
        type: req.body.type,
        date: req.body.date,
        time: req.body.time,
        description: req.body.description,
        zoom: req.body.zoom,
    })
    Event.create(newEvent, (err, createdevent) => {
        if(err){
            conosle.log(err)
        } else {
            res.redirect("/events/")
        }
    })
})



router.get("/:event_id/edit", isLoggedIn, (req, res) => {
    Zoom.find({}, (err, zooms) => {
        if(err){
            console.log(err);
        } else {
            Event.findById(req.params.event_id).populate("zoom").exec((err, event) => {
                if(err){
                    console.log(err)
                } else {
                    let header = `Edytuj wydarzenie ${event.name} | GigaMocni!`;
                    res.render("./events/edit", {
                        header: header,
                        currentUser: req.user,
                        event: event,
                        zooms: zooms
                    });
                }
            })
        }
    })
    
   
})

router.put("/:event_id", isLoggedIn, (req, res) => {
    Event.findByIdAndUpdate(req.params.event_id, req.body.event, (err, updatedevent) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/events")
        }
    })
})

router.get("/:event_id/delete", isLoggedIn,  (req, res) => {
    Event.findByIdAndDelete(req.params.event_id, (err, deletedevent) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/events")
        }
    })
})


function isLoggedIn (req, res, next) {
    if(req.isAuthenticated()) {
        
        return next();

    }
    req.flash("error", "Zaloguj się lub zarejestruj, by móc wykonać tę czynność");
    res.redirect(`/members/login?return_route=${req._parsedOriginalUrl.path}`);
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;