const express=require('express');
var al=require("alert-node");
var dialog = require('dialog');
const passport=require('passport');
const app=express();
var exphbs = require('express-handlebars');
const authRoutes =require('./routes/auth-routes');
const mongoose=require('mongoose');
const keys=require('./config/keys');
const path=require('path');
const User=require('./models/user-models');
const passportSetup=require('./config/passport-setup');//runs that jsfile
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
app.use(passport.initialize());
app.engine('handlebars', exphbs());

app.set('view engine', 'handlebars');

//routes lam inga varum
//connect db
passport.serializeUser(function(user, callback){
  console.log('serializing user.');
  callback(null, user.id);
});

passport.deserializeUser(function(user, callback){
 console.log('deserialize user.');
 callback(null, user.id);
});

mongoose.connect(keys.mongodb.dbURI,()=>{
    console.log('connected to mongodb');
});
app.use('/auth',authRoutes); // /auth/ google or login or logout varum

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 





app.post('/auth/signup', function(req, res){
    var uname = req.body.uname; //Get the parsed information
    var uemail= req.body.uemail;
    var pwd=req.body.pwd;
       var newPerson = new User({
          Name: uname,
          email: uemail,
          pass: pwd
       });
         
       newPerson.save();
       res.writeHead(302, {
        'Location': '/auth/main'
      });
      res.end();
    }
 );
//******************************************************** */
app.post('/', function(req, res){
     //Get the parsed information
     var email=req.body.uemail;
     var pass=req.body.upass;
   User.findOne({email:email,pass:pass},function(err,user){
    if(err){
        console.log(err);
        return res.status(500).send();
    }
    else if(!user){
        console.log('Invalid User');
    
 
        dialog.info('Invalid User Please Try again');
        return res.redirect('/');

    }
    else {console.log('Successfull Login');
    res.redirect('/pics');
    }
      });
    }
 );

//********************************************************** */
const mongoURI = 'mongodb://localhost:27017/final';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);
let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('image');
});

// Create storage engine
const storage = new GridFsStorage({
  url: keys.mongodb.dbURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'image'
        };
        resolve(fileInfo);
    });
  }
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get('/pics', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('index', { files: files });
    }
  });
});

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'),(req, res) => {
  // res.json({ file: req.file });
  res.redirect('/pics');
});


app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    const readstream = gfs.createReadStream(file.filename);
    return readstream.pipe(res);
  });
});



app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {

    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

 
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});






//********************************************************** */
app.get('/',(req,res)=>{
    res.render('ulogin');
});
app.listen(3000,()=>{
    console.log('listening for request 3000');
});