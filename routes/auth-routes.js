const router=require('express').Router(); //instance of router 
const passport=require('passport');
const path = require('path');
const multer = require('multer');
const mongoose=require('mongoose');
const gfs = require('gridfs-stream');
const db=require('mongodb');



router.get('/signup',(req,res)=>{
    res.render('signup');
})

router.get('/main',(req,res)=>{
    res.render('main');
})
router.get('/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/redirect', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/pics');
  });
module.exports=router;
