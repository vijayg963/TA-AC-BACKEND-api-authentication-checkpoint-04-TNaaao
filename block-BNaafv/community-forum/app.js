var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

// connect to the mongoose server
mongoose.connect('mongodb://localhost/community-forum', (err) => {
  console.log(err ? err : 'Connected true');
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var profileRouter = require('./routes/profiles');
var questionRouter = require('./routes/questions');
var answersRouter = require('./routes/answers');
var adminRouter = require('./routes/admin');
var auth = require('./middlewares/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/questions', questionRouter);
app.use('/api/v1/answers', answersRouter);

//only admin can have access to these routes
app.use(auth.isadmin);
app.use('/api/v1/admindashboard', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
