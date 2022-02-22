const express = require("express"),
    router = express.Router(),
    app = express(),
    Game = require("../models/game"),
    flash = require("connect-flash"),
    methodOverride = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/",  (req, res) => {
    Game.find({}).sort({edited: -1}).exec((err, games) => {
        if(err){
            console.log(err)
        } else {
            let header = `Gry | GigaMocni!`;
            res.render("./games/index", {
                header: header,
                currentUser: req.user,
                games: games
            });
        }
    })
   
})

router.get("/new", isLoggedIn, (req, res) => {
    
    let header = `Dodaj grę | GigaMocni!`;
    res.render("./games/new", {
        header: header,
    })
        
    
})

router.post("/", isLoggedIn, (req, res) => {
    let newGame = new Game({
        name: req.body.name,
        type: req.body.type,
        link: req.body.link,
        timesPlayed: req.body.timesPlayed,
        description: req.body.description,
    })
    Game.create(newGame, (err, createdGame) => {
        if(err){
            conosle.log(err)
        } else {
            switch(createdGame.type){
                case "Łatwo dostępna":
                    createdGame.color = "#28a745";
                    break;
                case "Dość dziecinna":
                    createdGame.color = "#dc3545";
                    break;
                case "Nowa, nieśmigana":
                    createdGame.color = "#007bff";
                    break;
                case "Wymagająca przygotowania":
                    createdGame.color = "#ffc107";
                    break;


            }
            createdGame.save();
            res.redirect("/games")
        }
    })
})

router.get("/search", (req, res) => {
    const titleGame =  new RegExp(escapeRegex(req.query.title), 'gi');
    Game.find({name: titleGame}, (err, games) => {
        if(err){
            console.log(err);
        } else {
            res.render("./games/search", {
                header: `Wyszukiwanie gier | GigaMocni!`,
                param: req.query.title,
                games: games,
                currentUser: req.user
            })
        }
    })
})
router.get("/type/:type_name", (req, res) => {
    Game.find({type: req.params.type_name}, (err, games) => {
        if(err){
            console.log(err);
        } else {
            res.render("./games/type", {
                header: `Gry w kategorii ${req.params.type_name} | GigaMocni!`,
                param: req.params.type_name,
                games: games,
                currentUser: req.user
            })
        }
    })
})

router.get("/:game_id/edit", isLoggedIn, (req, res) => {
   
    Game.findById(req.params.game_id, (err, game) => {
        if (err) {
            console.log(err)
        } else {
            let header = `Edytuj grę ${game.name} | GigaMocni!`;
            res.render("./games/edit", {
                header: header,
                currentUser: req.user,
                game: game
            });
        }
    })
       
    
   
})

router.put("/:game_id", isLoggedIn, (req, res) => {
    Game.findByIdAndUpdate(req.params.game_id, req.body.game, (err, updatedgame) => {
        if(err){
            console.log(err)
        } else {
            switch(req.body.game.type){
                case "Łatwo dostępna":
                    updatedgame.color = "#28a745";
                    break;
                case "Dość dziecinna":
                    updatedgame.color = "#dc3545";
                    break;
                case "Nowa, nieśmigana":
                    updatedgame.color = "#007bff";
                    break;
                case "Wymagająca przygotowania":
                    updatedgame.color = "#ffc107";
                    break;


            }
            updatedgame.edited = Date.now();
            updatedgame.save()
            res.redirect("/games")
        }
    })
})

router.get("/:game_id/delete", isLoggedIn, (req, res) => {
    Game.findByIdAndDelete(req.params.game_id, (err, deletedgame) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/games")
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