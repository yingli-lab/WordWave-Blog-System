// Load a .env file if one exists
const database = require('./modules/database');
require('dotenv').config()

const express = require("express");
const handlebars = require("express-handlebars");
const app = express();

// Listen port will be loaded from .env file, or use 3000
const port = process.env.EXPRESS_PORT || 3000;

// Setup Handlebars
app.engine("handlebars", handlebars.create({
    defaultLayout: "main",
    helpers: {
        formatDate: function (dateString) { // time format function
            const date = new Date(dateString);
            // Get time
            const timeStr = date.toLocaleTimeString("en-NZ", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });
            // Get date
            const dateStr = date.toLocaleDateString("en-NZ", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });

            return `${timeStr}, ${dateStr}`;
        }
    }
}).engine);
app.set("view engine", "handlebars");

// Set up to read POSTed form data
app.use(express.urlencoded({extended: true}));
app.use(express.json({}));

// Setup express-session
const session = require("express-session");

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "COMPX569"
}));

// Setup local user
// Whenever we navigate to ANY page, make the "user" session object available to the
// Handlebars engine by adding it to res.locals.
app.use(function (req, res, next) {
    // If the session has not been initialized, create an empty session first
    if (!req.session) {
        req.session = {};
    }

    res.locals.user = req.session.user || null;
    next();
});

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));


// TODO: Your app here

// Redirect home page to /articles
app.get("/", function (req, res) {
    res.redirect('/articles');
})

// Setup article router
const articles = require("./routes/articles-routes.js");
app.use("/articles", articles);

// Setup users router
const users = require("./routes/users-routes.js");
app.use("/user", users);

app.listen(port, function () {
    console.log(`Web final project listening on http://localhost:${port}/`);
});
