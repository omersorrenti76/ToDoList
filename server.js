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

app.use(function (req, res, next) {
    res.locals.username = req.session.username ;
   
    next();
  });

app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

//routing setup for the application
app.get('/index', (req, res) => {
    if(req.session.user !=null || req.session.user !=undefined)
        res.render('index.ejs');
    else
        res.render('login.ejs');
})
app.get('/', (req, res) => {
    if(req.session.user !=null || req.session.user !=undefined)

        res.render('lists.ejs');
    else
        res.render('login.ejs');
})
app.get('/lists',async  function (req, res) {
    if(req.session.user !=null || req.session.user !=undefined)
     {
        console.log(req.session.iduser);
        const rtn =  await dbcontext.GetUserLists(req.session.iduser);
        console.log(rtn);
        if (rtn.length > 0)
            req.flash('allRows', rtn);
        else
            req.flash('allRows', null);
       
        res.render('lists.ejs');
     }
   
    else
        res.render('login.ejs');
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
        req.session.username = loggeduser.username;
        req.session.iduser = loggeduser.id;
        req.session.save();

        console.log("Login Eseguito con successo");
        req.flash('username', loggeduser.username);
        res.redirect('/lists');
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
// POST FUNCTION TO CREATE AN USER TODO LIST
app.post('/createlists',async function(req, res, next){
    console.log("entro");
    var description = req.body.description;
    var idUser =  req.session.iduser;
    if(description!="")
    {
        console.log(description);
        console.log(idUser);
        const rtn =  await dbcontext.InsertUserList(description,idUser);
        console.log(rtn);
        const rtn1 =  await dbcontext.GetUserLists(req.session.iduser);
        console.log(rtn1);
        req.flash('allRows', rtn1);
        res.render('lists.ejs');
    }
});

// POST FUNCTION TO DELETE AN USER TODO LIST
app.post('/deletelists',async function(req, res, next){
    console.log("entro");
    var IdItem = req.body.IdItem;
   
  
        console.log(IdItem);
        const rtn =  await dbcontext.DeleteUserList(IdItem);
        console.log(rtn);

        const rtn1 =  await dbcontext.GetUserLists(req.session.iduser);
        console.log(rtn1);
        req.flash('allRows', rtn1);
        res.render('lists.ejs');
  
});




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