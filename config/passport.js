const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async(id,done) => {
  try{
    const user = await User.findById(id);
    done(null,user);
  }
  catch(error){
    done(error,null);
  }
});

passport.use('local',new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: false
}, async (email, password, done) => {
  try{
    const user = await User.findOne({'email':email });
    if(!user){
      return done(null, false, {message : 'UnKnown User - Please Register First!'});
    }

    const isValid = await User.comparePasswords(password, user.password);
    if(!isValid){
      return done(null,false,{message:'Invalid Password'});
    }
    // Check Account Is Verfied
    if(!user.active){
      console.log('password:',password);
      console.log('user.password:',user.password);
      return done(null,false,{message:'You Need To Verify The Email First!'});
    }

    return done(null,user);
    /*if(isValid){
      return done(null,user);
    }else{
      return done(null, false, {message: 'Unknown Password'});
    } */
  }
  catch(error){
    return done(error,false);
  }
}));
