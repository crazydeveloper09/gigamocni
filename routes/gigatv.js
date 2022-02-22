const express = require("express"),
    router = express.Router(),
    app = express(),
    GigaTV = require("../models/gigatv"),
    flash = require("connect-flash"),
    methodOverride = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", isLoggedIn, (req, res) => {
    GigaTV.find({}, (err, videos) => {
        if(err){
            console.log(err)
        } else {
            let header = `gigatv | GigaMocni!`;
            res.render("./gigatv/index", {
                header: header,
                currentUser: req.user,
                videos: videos
            });
        }
    })
   
})

router.get("/new", isLoggedIn, (req, res) => {
    
    let header = `Dodaj wideo do GigaTV | GigaMocni!`;
    res.render("./gigatv/new", {
        header: header
    });
           
    
})

router.post("/", isLoggedIn,  (req, res) => {
    let newGigaTV = new GigaTV({
        name: req.body.title,
        youtubeLink: req.body.youtubeLink
    })
    GigaTV.create(newGigaTV, (err, createdGigatv) => {
        if(err){
            console.log(err)
        } else {
            res.redirect("/gigatv/")
        }
    })
})



router.get("/:gigatv_id/edit", isLoggedIn, (req, res) => {
   
    GigaTV.findById(req.params.gigatv_id, (err, video) => {
        if (err) {
            console.log(err)
        } else {
            let header = `Edytuj gigatv ${video.name} | GigaMocni!`;
            res.render("./gigatv/edit", {
                header: header,
                currentUser: req.user,
                video: video
            });
        }
    })
       
    
   
})

router.put("/:gigatv_id", isLoggedIn, (req, res) => {
    GigaTV.findByIdAndUpdate(req.params.gigatv_id, req.body.gigatv, (err, updatedgigatv) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/gigatv")
        }
    })
})

router.get("/:gigatv_id/delete", isLoggedIn, (req, res) => {
    GigaTV.findByIdAndDelete(req.params.gigatv_id, (err, deletedgigatv) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/gigatv")
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