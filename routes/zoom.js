const express = require("express"),
    router = express.Router(),
    app = express(),
    Zoom = require("../models/zoom"),
    flash = require("connect-flash"),
    methodOverride = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", isLoggedIn, (req, res) => {
    Zoom.find({}, (err, zooms) => {
        if(err){
            console.log(err)
        } else {
            let header = `Zoom | GigaMocni!`;
            res.render("./zooms/index", {
                header: header,
                currentUser: req.user,
                zooms: zooms
            });
        }
    })
   
})

router.get("/new", isLoggedIn, (req, res) => {
    
    let header = `Dodaj zooma | GigaMocni!`;
    res.render("./zooms/new", {
        header: header
    });
           
    
})

router.post("/", isLoggedIn,  (req, res) => {
    let newZoom = new Zoom({
        title: req.body.title,
        type: req.body.type,
        description: req.body.description,
        link: req.body.link,
        meetingID: req.body.meetingID,
        meetingPassword: req.body.meetingPassword,
    })
    Zoom.create(newZoom, (err, createdzoom) => {
        if(err){
            console.log(err)
        } else {
            res.redirect("/zoom/")
        }
    })
})



router.get("/:zoom_id/edit", isLoggedIn, (req, res) => {
   
    Zoom.findById(req.params.zoom_id, (err, zoom) => {
        if (err) {
            console.log(err)
        } else {
            let header = `Edytuj Zooma ${zoom.title} | GigaMocni!`;
            res.render("./zooms/edit", {
                header: header,
                currentUser: req.user,
                zoom: zoom
            });
        }
    })
       
    
   
})

router.get("/join", isLoggedIn, (req, res) => {
    res.redirect(req.query.link);
})

router.put("/:zoom_id", isLoggedIn, (req, res) => {
    Zoom.findByIdAndUpdate(req.params.zoom_id, req.body.zoom, (err, updatedzoom) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/zoom")
        }
    })
})

router.get("/:zoom_id/delete", isLoggedIn, (req, res) => {
    Zoom.findByIdAndDelete(req.params.zoom_id, (err, deletedzoom) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/zoom")
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