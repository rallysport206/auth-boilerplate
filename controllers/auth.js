var express = require('express');
var passport = require('../config/passportConfig');
var db = require('../models');
var router = express.Router();

router.get('/login', function(req, res){
  res.render('auth/login');
});
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  successFlash: 'Logged In!',
  falureRedirect: '/auth/login',
  failureFlash: 'Failed!'
}));
// router.post('/login', function(req,res) {
//   console.log('req.body is', req.body);
//   res.send('login post route - coming soon');
// });

router.get('/signup', function(req, res){
  res.render('auth/signup');
});
router.post('/signup', function(req, res, next){
  console.log('req.body is', req.body);
  // res.send('signup post route coming soon');
  db.user.findOrCreate({
    where: { email: req.body.email },
    defaults: {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: req.body.password
    }
  }).spread(function(user, wasCreated){
    if(wasCreated){
      //good job, you didn't try to make a duplicate!
      passport.authenticate('local', {
        successRedirect: '/profile',
        successFlash: 'Successfully logged in'
      })(req, res, next);
    }
    else {
      //bad job! you tried to sign up when you should log in
      req.flash('error', 'Email already exists');
      res.redirect('/auth/login');
    }
  }).catch(function(err) {
    req.flash('error', err.message);
    res.redirect('/auth/signup');
  });
});
router.get('/logout', function(req, res) {
  // res.send('logout route coming soon');
  req.logout();
  req.flash('success', 'Successfully logged out');
  res.redirect('/');
});

module.exports = router;
