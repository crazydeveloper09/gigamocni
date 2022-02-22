const express = require("express"),
    router = express.Router(),
    app = express(),
    Member = require("../models/member"),
    flash = require("connect-flash"),
    async = require("async"),
    crypto = require("crypto"),
    passport              = require("passport"),
    methodOverride = require("method-override"),
    multer 				= require("multer"),
    dotenv 				= require("dotenv");
    dotenv.config();

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
// accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
const { route } = require(".");

cloudinary.config({ 
  cloud_name: 'syberiancats', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", isLoggedIn, (req, res) => {
    Member.find({}).sort({edited: -1}).exec((err, members) => {
        if(err){
            console.log(err)
        } else {
            let header = `Członkowie | GigaMocni!`;
            res.render("./members/index", {
                header: header,
                currentUser: req.user,
                members: members
            });
        }
    })
   
})

router.get("/new",  (req, res) => {
    if(req.query.code == 'gigamocni'){
        let header = `Zarejestruj się | GigaMocni!`;
        res.render("./members/new", {
            header: header,
        })
    } else {
        res.redirect("/dfslb")
    }
    
        
    
})

router.get("/login", (req, res) => {
    let header = "Logowanie | GigaMocni!";
    res.render("./members/login", {header: header});
});




router.post("/login", (req, res, next) =>  {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { 
           req.flash("error", "Zła nazwa użytkownika lub hasło");
            return res.redirect(`/members/login?return_route=${req.query.return_route}`); 
          }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect(req.query.return_route);
        });
      })(req, res, next);
});




router.get("/logout", (req, res) =>  {
    req.logout();
    res.redirect("/");
});

router.post("/",  (req, res) => {
    if(req.body.password !== req.body.confirm){
        req.flash("error", "Hasła się nie zgadzają")
        return res.redirect("/members/new");
    }
    let newMember = new Member({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        username: req.body.username,
        role: req.query.role
    })
    Member.register(newMember, req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message)
            let header = "Zarejestruj się | GigaMocni!";
            return res.render("./members/new", {member: req.body, error: err.message, header: header});
        } 
        passport.authenticate("local")(req, res, function() {
            req.flash("success", `Witaj ${user.name} ${user.surname} na stronie GigaMocnych`);
            res.redirect("/members/login?return_route=/");
        });
    });
})

router.get("/forgot", function(req, res){
    let header = `Poproś o zmianę hasła | GigaMocni`;
    res.render("forgot", {header: header});
});


router.post("/forgot", function(req, res, next){
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                let token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done){
            Member.findOne({ email: req.body.email }, function(err, user){
                if(!user){
                    req.flash('error', 'Nie znaleźliśmy konta z takim emailem. Spróbuj ponownie');
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 360000;
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            const mailgun = require("mailgun-js");
			const DOMAIN = 'websiteswithpassion.pl';
			const mg = mailgun({apiKey: process.env.API_KEY, domain: DOMAIN, host:"api.eu.mailgun.net"});
			const data = {
				from: 'Websites With Passion <admin@websiteswithpassion.pl>',
                to: user.email,
                subject: "Resetowanie hasła na stronie GigaMocni",
                text: 'Otrzymujesz ten email, ponieważ ty (albo ktoś inny) zażądał zmianę hasła na stronie GigaMocni. \n\n' + 
                    'Prosimy kliknij w poniższy link albo skopiuj go do paska przeglądarki, by dokończyć ten proces: \n\n' +
                    'http://' + req.headers.host + '/members/reset/' + token + '\n\n' + 
                    'Jeśli to nie ty zażądałeś zmiany, prosimy zignoruj ten email, a twoje hasło nie zostanie zmienione. \n'
			};
			mg.messages().send(data, function (error, body) {
				req.flash("success", "Email został wysłany na adres " + user.email + " z dalszymi instrukcjami");
				console.log(error);
                done(error);
			});
            
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/members/forgot');
    });
});

router.get("/reset/:token", function(req, res){
    Member.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user){
        if(!user) {
            req.flash("error", "Token wygasł lub jest niepoprawny");
            return res.redirect("/forgot");
        }
        let header = `Resetuj hasło | GigaMocni`;
        res.render("reset", { token: req.params.token, header: header });
    });
});

router.post("/reset/:token", function(req, res){
    async.waterfall([
        function(done) {
            Member.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
                if(!user){
                    req.flash("error", "Token wygasł lub jest niepoprawny");
                    return res.redirect("back");
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password, function(err){
                        user.resetPasswordExpires = undefined;
                        user.resetPasswordToken = undefined;
                        user.save(function(err){
                            req.logIn(user, function(err){
                                done(err, user);
                            });
                        });
                    });
                } else {
                    req.flash("error", "Hasła nie pasują do siebie");
                    return res.redirect("back");
                }
            });
        },
        function(user, done){
			const mailgun = require("mailgun-js");
			const DOMAIN = 'mkdportfolio.pl';
			const mg = mailgun({apiKey: process.env.API_KEY, domain: DOMAIN, host:"api.eu.mailgun.net"});
			const data = {
				from: 'Websites With Passion <admin@websiteswithpassion.pl>',
                to: user.email,
                subject: "Potwierdzenie zmiany hasła na stronie GigaMocni",
                text: 'Witaj ' + user.username + ', \n\n' + 
                'To jest potwierdzenie, że twoje hasło zostało właśnie zmienione'
			};
			mg.messages().send(data, function (error, body) {
				req.flash("success", "Twoje hasło zostało zmienione pomyślnie");
				console.log(error);
                done(error);
			});
            
        }
    ], function(err){
        res.redirect("/");
    });
});

router.get("/updateEmail", (req, res) => {
    res.render("updateEmail", {header: 'Zaktualizuj email'});
})


router.post("/updateEmail", (req, res) => {
    Member.findOne({ username: req.body.username }, (err, member) => {
        if(err){
            console.log(err);
        } else {
            if(member){
                member.email = req.body.email;
                member.save();
                req.flash("success", "Pomyślnie zaktualizowano maila");
                res.redirect(`/members/login?return_route=/`);
            } else {
                req.flash("error", "Nie ma takiego użytkownika")
                res.redirect("back")
            }
        }
    })
})


router.get("/:member_id/edit", isLoggedIn, (req, res) => {
   
    Member.findById(req.params.member_id, (err, member) => {
        if (err) {
            console.log(err)
        } else {
            let header = `Edytuj użytkownika ${member.name} | GigaMocni!`;
            res.render("./members/edit", {
                header: header,
                currentUser: req.user,
                member: member
            });
        }
    })
       
    
   
})
router.get("/:member_id/edit/profile", isLoggedIn, function(req, res){
   
    Member.findById(req.params.member_id, function(err, member){
		if(err) {
			console.log(err);
		} else {
			let header = `Edytuj zdjęcie profilowe ${member.username} | GigaMocni!`;
			res.render("./members/editP", {
                member: member, 
                header: header,
                currentUser: req.user
            });
            
			
		}
	});
});

router.post("/:member_id/edit/profile", upload.single("picture"), function(req, res){
   
    cloudinary.uploader.upload(req.file.path, function(result) {
      
        Member.findById(req.params.member_id, function(err, member){
            if(err) {
                console.log(err);
            } else {
                member.profile = result.secure_url;
                member.edited = Date.now();
                member.save();
                res.redirect(`/members`);
            }
        });
    });
    
});

router.get("/:member_id/newRole", isLoggedIn, (req, res) => {
    Member.findById(req.params.member_id, (err, member) => {
        if(err){
            console.log(err)
        } else {
            if(member.role === 'admin'){
                member.role = 'members';
                member.save();
                res.redirect("/members");
            } else {
                member.role = 'admin';
                member.save();
                res.redirect("/members")
            }
        }
    })
})

router.put("/:member_id", isLoggedIn, (req, res) => {
    Member.findByIdAndUpdate(req.params.member_id, req.body.member, (err, updatedmember) => {
        if(err){
            console.log(err)
        } else {
            member.edited = Date.now();
            member.save()
            res.redirect("/members")
        }
    })
})

router.get("/:member_id/delete", isLoggedIn, (req, res) => {
    Member.findByIdAndDelete(req.params.member_id, (err, deletedmember) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/members")
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