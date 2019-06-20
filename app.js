var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var util = require('./util');

var indexRouter = require('./routes/index');
var asinsRouter = require('./routes/asin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31536000 }));

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
  next();
});

// Domain error handling
app.use(require('express-domain-middleware'));

// Application routes
app.use('/', indexRouter);
app.use('/asins', asinsRouter);

// rewrite virtual urls to angular app to enable refreshing of internal pages
app.get('*', function(req, res, next) {
  res.sendFile(path.resolve('public/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  console.log(err);
  res.status(err.status || 500);
  res.json(util.failure(err));
});

module.exports = app;