const express             = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    methodOverride        = require("method-override"),
    passport              = require("passport"),
    // apiRoutes           = require("./routes/api"),
    gigaTVRoutes           = require("./routes/gigatv"),
    eventRoutes           = require("./routes/event"),
    memberRoutes           = require("./routes/member"),
    zoomRoutes            = require("./routes/zoom"),
    indexRoutes           = require("./routes/index"),
    gamesRoutes           = require("./routes/game"),
    surveyRoutes           = require("./routes/survey"),
    optionRoutes           = require("./routes/option"),
    Member = require("./models/member"),
    LocalStrategy 		  = require("passport-local").Strategy,
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");
    dotenv.config();

// Connecting to database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});

// App configuration
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(methodOverride("_method"));



app.use(require("express-session")({
    secret: "heheszki",
    resave: false,
    saveUninitialized: false
}));
app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentMember = req.Member;
    res.locals.return_route = req.query.return_route;
	res.locals.route = req.path;
    next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Member.authenticate()));
passport.serializeUser(Member.serializeUser());
passport.deserializeUser(Member.deserializeUser());


// app.use("/api", apiRoutes)
app.use("/surveys/:survey_id/options", optionRoutes)
app.use("/surveys", surveyRoutes)
app.use("/members", memberRoutes)
app.use("/games", gamesRoutes)
app.use("/events", eventRoutes)
app.use("/zoom", zoomRoutes)
app.use("/gigatv", gigaTVRoutes)
app.use(indexRoutes)



app.listen(process.env.PORT);