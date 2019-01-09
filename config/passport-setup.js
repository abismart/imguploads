const passport=require('passport');
const keys=require('./keys');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const User=require('../models/user-models');
const mongoose=require('mongoose');
passport.use(new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: "/auth/google/redirect"
  },
  function(accessToken, refreshToken, profile, cb) {
   
    cb(null,profile);
   
  }
));