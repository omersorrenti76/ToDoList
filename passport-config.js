//passport related operations

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./userModel.js');

var userID;

function initialize(passport, getUserByEmail, getUserById)
{
    const authUser = async (email, password, done) => {
        
        console.log("Email: " + email);
        console.log("Password: " + password);

        const user = await User.findOne({"email" : email});
        
        //const user = getUserByEmail(email);
        if(user == null){
            return done(null, false, {message: 'No user with that email!'});
        }

        try{
            if (await bcrypt.compare(password, user.password)){
                userID = user.id;
                return done(null, user);
            }else{
                return done(null, false, {message: 'Password incorrect'});
            }
        }
        catch (e) {
            return done(e);
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, userID)
    });
}

module.exports = initialize;