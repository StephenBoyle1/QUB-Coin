var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session=require('express-session');


var routes = require('./routes/index');
var instructorDashboard = require('./routes/instructorDashboard');
var adminCreateClass = require('./routes/adminCreateClass');
var login = require('./routes/login');
var signUp = require('./routes/signUp');
var studentViewClass = require('./routes/studentViewClass');
var studentSendPoints = require('./routes/studentSendPoints');
var adminClassesCreated = require('./routes/adminClassesCreated');
var studentDisplayClasses = require('./routes/studentDisplayClasses');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: '1234567890QWERTY',
  resave: false,
  saveUninitialized: true})
);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/instructorDashboard', instructorDashboard);
app.use('/adminCreateClass', adminCreateClass);
app.use('/login', login);
app.use('/signUp', signUp);
app.use('/studentViewClass', studentViewClass);
app.use('/studentSendPoints', studentSendPoints);
app.use('/adminClassesCreated', adminClassesCreated);
app.use('/studentDisplayClasses', studentDisplayClasses);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
