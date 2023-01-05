//setup of express application

//environment variables
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

//libraries
const express = require('express');
const app = express();
const crypto = require('crypto'); 
const bcrypt = require('bcrypt');       //using bcrypt library to hash passwords
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config');
const sqlite3 = require('sqlite3').verbose();
const LocalStrategy = require('passport-local').Strategy;

var dbcontext = require('./dbcontext.js');
let loggedUser = require('./dbcontext.js');



// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

app.set('view-engine', 'ejs');      //tell the server we're using ejs and its syntax
app.use(express.urlencoded({extended: false}));     //telling app to take forms and access to them via request variable inside of a post method
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { maxAge: oneDay },
    saveUninitialized: true
}));

app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

//routing setup for the application
app.get('/', (req, res) => {
    res.render('index.ejs');
})

app.get('/login', (req, res) => {
    res.render('login.ejs');
})

app.get('/register', (req, res) => {
    res.render('register.ejs');
})

// POST LOGIN FOR AUTENTHICATION
app.post('/login', async  function (req, res)  { 
    console.log( "Invio:" + req.body.email);
   
    var email = req.body.email;
    var password = req.body.password;
  
    
    // CALL DOAUTHENTICATE FOR LOGIN
    const rtn =  await dbcontext.doAuthenticate(email,password);
    


    if(rtn!=undefined)
    {
        let loggeduser = new loggedUser(rtn.ID,rtn.UserName,rtn.Email, rtn.Password);
        req.session.user = loggeduser;
        req.session.save();

        console.log("Login Eseguito con successo");
        req.flash('username', loggeduser.username);
        res.redirect('/');
    }
    else 
    {
        console.log("Login fallito");
        req.flash('error', "Bad username or password!!");
        disconnect(req,res);
        
       
    }
 });    

// POST FUNCTION FOR REGISTER A NEW USER
app.post('/register', async function(req, res)  {         //asyncronous function
    try{
        console.log('entro in register');
       
        var email = req.body.email;
        var username = req.body.name;
        var password = req.body.password;
        const rtn =  await dbcontext.doRegister(username,email,password);
        console.log(rtn);
        if(rtn)
            res.redirect('/login');     //after complete registration, redirect to login page
        else 
            res.redirect('/register');
    }catch{
        res.redirect('/register');      //redirects to register page in case of error
    }
   
})

//LOGOUT
app.delete('/logout', function(req, res, next){
   
        disconnect(req,res);
});

// SHARED FUNCTION TO DISCONNECT
function disconnect(req,res)
{
    if(req!=undefined && req!=null){
        req.session.user = null;
        req.session.save();
        req.flash('username', null);
        res.redirect('/login');
    }
   
}

app.listen(3000);       //application running on port 3000