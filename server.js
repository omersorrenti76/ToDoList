//setup of express application

//environment variables
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

//libraries
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');       //using bcrypt library to hash passwords
const passport = require('passport');       //using passport library to handle login operations
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config');

initializePassport(
    passport,
    email => users.find(user => user.email === email),       //find user based on the email
    id => users.find(user => user.id === id)
);

//FARE IL DATABESE CON NODE/MONGO
//const users = [];       //storing data in a local array variable

//database setup
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://pachokx72:alyaiiDhDDSXjAL5@cluster0.1wb2n5n.mongodb.net/?retryWrites=true&w=majority")
    .then(() => console.log("Database connected!"))
    .catch(err => console.log(err));


app.set('view-engine', 'ejs');      //tell the server we're using ejs and its syntax
app.use(express.urlencoded({extended: false}));     //telling app to take forms and access to them via request variable inside of a post method
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

//routing setup for the application
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name});
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req, res) => {         //asyncronous function
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);        //asyncronous hashing of password, 10 is a solid standard encryption value
        const User = require('./userModel.js');

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        newUser.save().then(() => console.log("Saved new user"));

        /*
        users.push({
            id: Date.now().toString(),      //automatically generated in a database
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        */

        res.redirect('/login');     //after complete registration, redirect to login page
    }catch{
        res.redirect('/register');      //redirects to register page in case of error
    }
    //console.log(User);     //to see if user gets added
})

//logout
app.delete('/logout', function(req, res, next){
    req.logout(function(err){
        if(err){return next(err);}
        res.redirect('/');
    });
});

function checkAuthenticated(req, res, next)
{
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next)
{
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}

app.listen(3000);       //application running on port 3000