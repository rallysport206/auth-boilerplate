var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var db = require('../models');
require('dotenv').config();

passport.serializeUser(function(user, callback){
  callback(null, user.id);
});
passport.deserializeUser(function(id, callback) {
  db.user.findById(id).then(function(user) {
    callback(null, user);
  }).catch(function(err) {
    callback(err, null);
  });
});

passport.use(new localStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, callback) {
  db.user.findOne({
    where: { email:email }
  }).then(function(user) {
    if(!user || !user.isValidPassword(password)){
      callback(null, false);
    }
    else {
      callback(null, user);
    }
  }).catch(function(err) {
    callback(err,null);
  });
}));

passport.use(new facebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.BASE_URL + '/auth/callback/facebook',
  profileFields: ['id', 'email', 'displayname'],
  enableProof: true
},function(accessToken, refreshToken, profile, callback) {
  //insert or access facbook user in user table
  //see if we have a  email we could identify user
  var facebookEmail = profile.emails ? profile.emails[0].value : null;

  //see if email exist in the users table
  db.user.findOne({
    where:{email: facebookEmail}
  }).then(function(existingUser) {
    //this user has logged in before!
    if(existingUser && facebookEmail){
      existingUser.updateAttributes({
        facebookID: profile.id,
        facebookToken: accessToken
      }).then(function(updatedUser) {
        callback(null, updatedUser);
      }).catch(callback);
    }
    else{
      //the person is just new, we need to create an entry for them in the users table
      // parse user's name
      var usernameArr = profile.displayname.split(' ');

      db.user.findOrCreate({
        where: {facebookID: profile.id},
        default: {
          facebookToken: accessToken,
          email: facebookEmail,
          firstname: usernameArr[0],
          lastname: usernameArr[usernameArr.lenght -1],
          username: profile.displayname
        }
      }).spread(function(user, wasCreated) {
        if(wasCreated){
          //expected case: they were new, and then we created them in the users table
          callback(null, user);
        }
        else{
          // they were not new after all, just need to update their token for a new login session
          // possibly this could happen if the user changed the eamil that they use for facebook login
          user.facebookToken = accessToken;
          user.email = facebookEmail;
          user.save().then(function(updatedUser) {
            callback(null, updatedUser);
          }).catch(callback);
        }
      }).catch(callback);
    }
  })
}));

module.exports = passport;
