const express = require("express"),
    router = express.Router(),
    app = express(),
    Survey = require("../models/survey"),
    Answer = require("../models/answer"),
    Option = require("../models/option"),
    flash = require("connect-flash"),
    methodOverride = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", (req, res) => {
        if(req.user){
            if(req.user.role === 'admin'){
                let for1 = 'admin';
                let for2 = 'members';
                Survey.find({
                    $or: [{for: for1}, {for: for2}, {for: 'not-logged'}]
                }).populate("author").exec((err, surveys) => {
                    if(err){
                        console.log(err);
                    } else {
                        console.log(req.user.role);
                        let header = `Ankiety | GigaMocni!`;
                        res.render("./surveys/index", {
                            header: header,
                            currentUser: req.user,
                            surveys: surveys
                        });
                    }
                })
            } else if(req.user.role === 'members'){
                Survey.find({for: 'members'}).populate("author").exec((err, surveys) => {
                    if(err){
                        console.log(err)
                    } else {
                        let header = `Ankiety | GigaMocni!`;
                        res.render("./surveys/index", {
                            header: header,
                            currentUser: req.user,
                            surveys: surveys
                        });
                    }
                })
            } 
        } else {
            Survey.find({for: 'not-logged'}).populate("author").exec((err, surveys) => {
                if(err){
                    console.log(err)
                } else {
                    let header = `Ankiety | GigaMocni!`;
                    res.render("./surveys/index", {
                        header: header,
                        currentUser: req.user,
                        surveys: surveys
                    });
                }
            })
        }
})

router.get("/new", isLoggedIn, (req, res) => {
    
    let header = `Dodaj ankietę | GigaMocni!`;
    res.render("./surveys/new", {
        header: header,
    })
        
    
})

router.post("/", isLoggedIn,  (req, res) => {
    let newSurvey = new Survey({
        name: req.body.name,
        type: req.body.type,
        for: req.body.for,
        author: req.user._id,
        description: req.body.description,
    })
    Survey.create(newSurvey, (err, createdsurvey) => {
        if(err){
            console.log(err)
        } else {
            res.redirect("/surveys")
        }
    })
})

router.get("/search", (req, res) => {
    const titleSurvey =  new RegExp(escapeRegex(req.query.title), 'gi');
    if(req.user){
        if(req.user.role === 'admin'){
            let for1 = 'admin';
            let for2 = 'members';
            Survey.find({
                $and: [ {
                    $or: [{for: for1}, {for: for2}, {for: 'not-logged'}]
                }, {name: titleSurvey}]
            }).populate("author").exec((err, surveys) => {
                if(err){
                    console.log(err);
                } else {
                    console.log(req.user.role);
                    let header = `Ankiety | GigaMocni!`;
                    res.render("./surveys/search", {
                        header: header,
                        currentUser: req.user,
                        param: req.query.title,
                        surveys: surveys
                    });
                }
            })
        } else if(req.user.role === 'members'){
            Survey.find({$and: [{for: 'members'}, {name: titleSurvey}]}).populate("author").exec((err, surveys) => {
                if(err){
                    console.log(err)
                } else {
                    let header = `Ankiety | GigaMocni!`;
                    res.render("./surveys/search", {
                        header: header,
                        currentUser: req.user,
                        param: req.query.title,
                        surveys: surveys
                    });
                }
            })
        } 
    } else {
        Survey.find({$and: [{for: 'not-logged'}, {name: titleSurvey}]}).populate("author").exec((err, surveys) => {
            if(err){
                console.log(err)
            } else {
                let header = `Ankiety | GigaMocni!`;
                res.render("./surveys/search", {
                    header: header,
                    currentUser: req.user,
                    param: req.query.title,
                    surveys: surveys
                });
            }
        })
    }
})


router.get("/:survey_id/edit", isLoggedIn,  (req, res) => {
   
    Survey.findById(req.params.survey_id, (err, survey) => {
        if (err) {
            console.log(err)
        } else {
            let header = `Edytuj ankietę ${survey.name} | GigaMocni!`;
            res.render("./surveys/edit", {
                header: header,
                currentUser: req.user,
                survey: survey
            });
        }
    })
       
    
   
})

router.get("/:survey_id", (req, res) => {
    Survey.findById(req.params.survey_id).populate("author").exec((err, survey) => {
        if(survey.type === "checkbox"){
            if(req.user){
                Option.find({$and: [{survey: req.params.survey_id}, {members: { $ne: req.user._id}}]}).populate(["survey", "members"]).exec((err, options) => {
                    if(err){
                        console.log(err)
                    } else {
                        let header = `${options[0] && options[0].survey.name} | GigaMocni!`;
                        res.render("./surveys/show", {
                            header: header,
                            currentUser: req.user,
                            options: options,
                            survey: survey
                        })
                    }
                })
            } else {
                Option.find({survey: req.params.survey_id}).populate(["survey", "members"]).exec((err, options) => {
                    if(err){
                        console.log(err)
                    } else {
                        let header = `${options[0] && options[0].survey.name} | GigaMocni!`;
                        res.render("./surveys/show", {
                            header: header,
                            currentUser: req.user,
                            options: options,
                            survey: survey
                        })
                    }
                })
            }
            
        } else {
            if(req.user){
                Answer.findOne({$and: [{survey: req.params.survey_id}, {member: req.user._id}]}).populate(["survey", "member"]).exec((err, answer) => {
                    if(err){
                        console.log(err)
                    } else {
                        if(answer){
                            res.redirect(`/surveys/${survey._id}/summary`);
                        } else {
                            let header = `${survey.name} | GigaMocni!`;
                            res.render("./surveys/show", {
                                header: header,
                                currentUser: req.user,
                                survey: survey
                            })
                        }
                        
                    }
                })
            } else {
                Survey.findById(req.params.survey_id, (err, survey) => {
                    if(err){
                        console.log(err)
                    } else {
                        let header = `${survey.name} | GigaMocni!`;
                        res.render("./surveys/show", {
                            header: header,
                            currentUser: req.user,
                            survey: survey
                        })
                    }
                })
                
            }
           

        }
       
    })
    
})

router.post("/:survey_id/vote", (req, res) => {
    Survey.findById(req.params.survey_id, (err, survey) => {
        if(err){
            console.log(err);
        } else {
            if(survey.type === "checkbox"){
                Option.findById(req.body.option).populate("survey").exec((err, option) => {
                    if(err){
                        console.log(err);
                    } else {
                        option.numberOfAnswers++;
                        if(req.user) {
                            option.members.push(req.user);
                        }
                       
                        option.save();
                        res.redirect(`/surveys/${option.survey._id}/summary`);
                    }
                })
            } else {
                Answer.create({description: req.body.answer, survey: survey._id}, (err, createdAnswer) => {
                    if(err){
                        console.log(err);
                    } else {
                        if(req.user){
                            createdAnswer.member = req.user._id;
                            createdAnswer.save();
                        }
                        survey.answers.push(createdAnswer);
                        survey.save();
                        
                        res.redirect(`/surveys/${survey._id}/summary`);
                    }
                })
            }
        }
    })
    
})

router.get("/:survey_id/reset", isLoggedIn, (req, res) => {
    Answer.remove({ survey: req.params.survey_id }, (err, answers) => {
        if(err){
            console.log(err);
        } else {
            Option.find({ survey: req.params.survey_id }, (err, options) => {
                if(err){
                    console.log(err);
                } else {
                    options.forEach((option) => {
                        option.numberOfAnswers = 0;
                        option.save();
                    })
                    res.redirect(`/surveys/${req.params.survey_id}/summary`);
                }
            })
            
        }
    })
})

router.get("/:survey_id/summary",  (req, res) => {
    Survey.findById(req.params.survey_id).populate(["answers", "author"]).exec((err, survey) => {
        if(err){
            console.log(err);
        } else {
            if(survey.type === "checkbox"){
                Option.find({survey: req.params.survey_id}).populate("survey").exec((err, options) => {
                    if(err){
                        console.log(err);
                    } else {
                        let header = `Podsumowanie ankiety ${options[0] && options[0].survey.name} | GigaMocni!`;
                        let totalVotes = 0;
                        options.forEach((option) => {
                            totalVotes += option.numberOfAnswers;
                        })
                        res.render("./surveys/summary", {
                            header: header,
                            currentUser: req.user,
                            options:options,
                            totalVotes: totalVotes,
                            survey: survey
                        })
                    }
                });
            } else {
                Answer.find({survey: req.params.survey_id}).populate(["survey", "member"]).exec((err, answers) => {
                    if(err){
                        console.log(err);
                    } else {
                        let header = `Podsumowanie ankiety ${answers[0] && answers[0].survey.name} | GigaMocni!`;
                        res.render("./surveys/summary", {
                            header: header,
                            currentUser: req.user,
                            answers: answers,
                            totalVotes: survey.answers.length,
                            survey: survey
                        })
                    }
                });
            }
        }
    })
    
})

router.put("/:survey_id", isLoggedIn,  (req, res) => {
    Survey.findByIdAndUpdate(req.params.survey_id, req.body.survey, (err, updatedsurvey) => {
        if(err){
            console.log(err)
        } else {
            res.redirect("/surveys")
        }
    })
})

router.get("/:survey_id/delete", isLoggedIn,  (req, res) => {
    Survey.findByIdAndDelete(req.params.survey_id, (err, deletedsurvey) => {
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