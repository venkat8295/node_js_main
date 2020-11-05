const express = require('express');
const router = express.Router();
const joi = require('joi');
const passport = require('passport');
const randomstring = require('randomstring');
const multer = require('multer');
var fs = require('fs');
var path = require('path');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const mailer = require('../misc/mailer');
const User = require('../models/user');
const imgModel = require('../models/Image');

var Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname+'_'+Date.now()+path.extname(file.originalname));
    }
});



var upload = multer({ storage: Storage });

//Validation In Schema
const userSchema = joi.object().keys({
  picture: joi.any().required(),
  email: joi.string().email().required(),
  username: joi.string().required(),
  password: joi.string().regex(/^[a-zA-z0-9]{3,30}$/).required(),
  confirmationPassword: joi.any().valid(joi.ref('password')).required()
});

const isAuthenticated = (req,res,next) => {
  if(req.isAuthenticated())
  {
    return next();
  }
  else {
    req.flash('error', 'Sorry, But You Must Be Registered First!');
    res.redirect('/');
  }
}

const isNotAuthenticated = (req,res,next) => {
  if(req.isAuthenticated())
  {
    req.flash('error', 'Sorry, But You Are Already Logged In!');
    res.redirect('/');
  }
  else{
    return next();
  }
}

router.route('/register')
  .get(isNotAuthenticated,(req, res) => {
    res.render('register');
  })
  .post(upload.single('image'),async (req,res,next) => {
    //console.log('req.body:',req.body);
    //const result = joi.validate(req.body, userSchema); // This Code Is Depreciated!

  try{


        var appDir = path.dirname(require.main.filename);
        console.log("__dirname_profile:",req.file.filename);
        var obj1 = {
        picture: {
          data: fs.readFileSync(path.join(appDir + '/public/uploads/' + req.file.filename)),
          contentType: 'image/png'
          }
        }
        User.create(obj1, (err, item) => {
          if (err) {
           console.log(err);
           req.flash('error','Profile Picture Not Uploaded!!');
           res.redirect('/users/register');
           return;
        }
      });

      const result = userSchema.validate(req.body);
      console.log('result:',result.body);

      if(result.error)
      {
      req.flash('error','Password Do Not Match!. Please Try Again.');
      res.redirect('/users/register');
      return;
      }

      // Check If Email Is Already Taken'
      const user = await User.findOne({
      'email' :result.value.email
      });
      if(user){
        req.flash('error','Email Is Already In Use.');
        res.redirect('/users/register');
        return;
      }

      // Hash Implementations
      const hash = await User.hashPassword(result.value.password);
      //console.log('hash',hash);

      // Generate Secret TOken
      const secretToken = randomstring.generate();
      result.value.secretToken = secretToken;

      //result.value.active = false; // Since Mail Is Not Working Properly Assign This To false
      result.value.active = true;

      // Save User To DB
      delete result.value.confirmationPassword;
      result.value.password = hash;

      //console.log('result_new:',result);

      const newUser = await new User(result.value);
      console.log("newUser:",newUser);
      await newUser.save();


      // Compose Mail
      const html = `Hi There,<br/> Thank You For Registering Data Authentication!, <br/><br/> Please Verify Your Email By Typing The Following Token: </br>
                   Token:<b> ${secretToken}</b>
                   <br/>
                   On The Following Page:
                   <a href ="http://localhost:5000/users/verify">http://localhost:5000/users/verify</a>
                   <br/><br/>'Have A Pleasant Day ! `;

                   // Send The Email
                   await mailer.sendEmail('Developer@Authentication.com', result.value.email,'Please Verify Your Mail',html);

      req.flash('success',' Check Your Mail! || Please Login');
      res.redirect('/users/login');

     }
     catch(error){
        next(error);
     }
  });

router.route('/login')
  .get(isNotAuthenticated,(req, res) => {
    res.render('login');
  })
  .post(passport.authenticate('local',{
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  }));

  router.route('/dashboard').get(isAuthenticated,(req,res) => {
    console.log('req.user:',req.get('host'));
  /*  res.render('dashboard',{
      username:req.user.username
    });*/
    imgModel.find({}, (err, items) => {
      if (err) {
        console.log(err);
      }
      else {
        console.log('Test:',items);
        res.render('dashboard', { items: items });
      }
    });
  }).post(upload.single('image'),(req, res, next) => {
    var appDir = path.dirname(require.main.filename);
    console.log("__dirname:",req.file.filename);
    var obj = {
      name: req.body.name,
      desc: req.body.desc,
      file_name:req.file.filename,
      img: {
        data: fs.readFileSync(path.join(appDir + '/public/uploads/' + req.file.filename)),
        contentType: 'image/png'
      }
    }
    imgModel.create(obj, (err, item) => {
      if (err) {
        console.log(err);
        req.flash('error','Failure On Data Posting!');
      }
      else {
        // item.save();
        req.flash('success','Data Posted Successfully!');
        res.redirect('/users/dashboard');
      }
    });
  });

  router.route('/verify').get(isNotAuthenticated,(req,res) => {
    res.render('verify')
  }).post(async (req,res,next) => {
    try{
      const {secretToken} = req.body; // This Is Alternative To const secretToken = req.body.secretToken; Both Possibilities (For reference)

      //If Matches The Secret Token
      const user = await User.findOne({ 'secretToken' : secretToken.trim() });

      if(!user){
        req.flash('error','Invalid Token!');
        res.redirect('/users/verify');
        return;
      }

      user.active = true;
      user.secretToken = '';
      await user.save();

      req.flash('success','Thank You! Now You May Login.');
      res.redirect('/users/login');

    }
    catch(error){
      next(error);
    }
  });

  router.route('/logout').get((req,res) => {
    req.logout();
    req.flash('success','Successfully Logged Out! Hope To See You Soon!');
    res.redirect('/');
  });

module.exports = router;
