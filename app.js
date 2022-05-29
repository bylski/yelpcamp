// Importing Modules and Getting Schema from Mongoose
import express from 'express';
import mongoose from 'mongoose';
import methodOverride from 'method-override';
import ejs from 'ejs';
import path from 'path';
import Campground from './models/campground.js';
import Review from './models/review.js';
import bodyParser from 'body-parser';
import ejsMate from 'ejs-mate';
import { ExpressError } from './utils/ExpressError.js';
import campgroundRouter from './routes/campgroundRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import userRouter from './routes/userRoutes.js';
import session from 'express-session'
import flash from 'connect-flash';
import passport from 'passport';
import User from './models/user.js'
import LocalStrategy from 'passport-local';
import dotenv from 'dotenv';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import MongoStore from 'connect-mongo';

if (process.env.NODE_ENV !== 'production') {
        const result = dotenv.config()
    }

    // var cl = new cloudinary.Cloudinary({cloud_name: "doc1zylfo", secure: true});

const { Schema } = mongoose;
// Setting current path variable
const _dirname = path.resolve(); 
// Connecting to MongooseDB
console.log(process.env.DB_URL)
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpCamp'
mongoose.connect(dbUrl);
// Catching Connection Errors
 const db = mongoose.connection;
 db.on("error", console.error.bind(console, "connection error:"));
 db.once("open", () => {
     console.log("Database Connected");
 })

const store = MongoStore.create({
    mongoUrl: dbUrl,
    ttl: 24 * 60 * 60,

})

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
})

const secret = process.env.SECRET || "somesecretkey";
// Configure session
const sessionConfig = {
    store,
    name: "session",
    secret: "somesecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
// Defining and Setting up Express
const app = express();

app.use((req, res, next) => {
    res.removeHeader("Cross-Origin-Resource-Policy")
    res.removeHeader("Cross-Origin-Embedder-Policy")
    next()
  })

// Typical Express Setup
app.set('view engine', 'ejs');
app.set('views', path.join(_dirname, "/views"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(_dirname + "/public")));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
// Session and Flash setup
app.use(session(sessionConfig));
app.use(flash());
// Security packages setup
app.use(ExpressMongoSanitize());
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  }));


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/doc1zylfo/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for passing flash messages to res.locals (res.render's objects)
app.use((req, res , next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUrl = req.originalUrl;
    next();
})


// Express Router
app.use('/campgrounds', campgroundRouter)
app.use('/campgrounds/:campId/reviews', reviewRouter);
app.use('', userRouter);

// ROUTES
app.get('/', (req, res) => {
    res.render('home');
});

// Route to hit, when no route match the request
app.all("*", (req, res, next) => {
    next(new ExpressError("PAGE NOT FOUND", 404));
})

// Error Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "You Got An Error!";
    res.status(statusCode).render('error', { err });
});


// Listen at port 
const port = process.env.PORT || 8080;
app.listen(8080);




