const express = require('express');
const morgan = require('morgan')
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

require('./config/passport');

mongoose.connect(MongoDB_Link,{
  useUnifiedTopology:true,
  useNewUrlParser:true,
  useFindAndModify:false
});

const app = express();
app.use(morgan('dev'));
app.use('/public',express.static('public'));

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expressHandlebars({
   defaultLayout: 'layout',
   handlebars: allowInsecurePrototypeAccess(Handlebars)
  }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret_pass'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  //cookie: { maxAge: 60000 },
  cookie : {
  expires: false
  },
  secret: 'secret_pass',
  saveUninitialized: false,
  resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req,res,next) => {
  console.log("isAuthenticated_locals:",req.user);
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  res.locals.isAuthenticated = req.user ? true : false;
  next();
});

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.render('notFound');
});

const PORT = process.env.port || 5000;
app.listen(PORT, () => console.log("Port Got Connected"));
//app.listen(5000, () => console.log('Server started listening on port 5000!'));
