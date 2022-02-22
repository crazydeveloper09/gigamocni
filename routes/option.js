const express = require("express"),
    router = express.Router({mergeParams: true}),
    app = express(),
    Option = require("../models/option"),
    Survey = require("../models/survey"),
    flash = require("connect-flash"),
    methodOverride = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))



router.get("/new", isLoggedIn, (req, res) => {
    Survey.findById(req.params.survey_id, (err, survey) => {
        if(err){
            console.log(err)
        } else {
            let header = `Dodaj opcję do ankiety | GigaMocni!`;
            res.render("./options/new", {
                header: header,
                survey: survey
            });
        }
    })
    
           
    
})

router.post("/", isLoggedIn,  (req, res) => {
    let newOption = new Option({
        description: req.body.description,
        color: `rgb(${Math.random()*256}, ${Math.random()*256}, ${Math.random()*256})`,
        survey: req.params.survey_id
    })
    Option.create(newOption, (err, createdoption) => {
        if(err){
            console.log(err)
        } else {
            Survey.findById(req.params.survey_id, (err, survey) => {
                if(err){
                    console.log(err)
                } else {
                    survey.options.push(createdoption);
                    survey.save();
                    res.redirect(`/surveys/${survey._id}/options/redirect`)
                }
            })
            
        }
    })
})



router.get("/:option_id/edit", isLoggedIn, (req, res) => {
   
    Option.findById(req.params.option_id).populate("survey").exec((err, option) => {
        if (err) {
            console.log(err)
        } else {
            let header = `Edytuj opcję ${option.description} | GigaMocni!`;
            res.render("./options/edit", {
                header: header,
                currentUser: req.user,
                option: option
            });
        }
    })
       
    
   
});

router.get("/redirect", isLoggedIn, (req, res) => {
    Survey.findById(req.params.survey_id, (err, survey) => {
        if(err){
            console.log(err);
        } else {
            let header = `Przekierowywanie | GigaMocni!`;
            res.render("./options/redirect", {
                header: header,
                currentUser: req.user,
                survey: survey
            })
        }
    })
})

router.put("/:option_id", isLoggedIn, (req, res) => {
    Option.findByIdAndUpdate(req.params.option_id, req.body.option, (err, updatedoption) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/surveys")
        }
    })
})

router.get("/:option_id/delete", isLoggedIn, (req, res) => {
    Option.findByIdAndDelete(req.params.option_id, (err, deletedoption) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/surveys")
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