// ** DEPENDENCIES ** //
var express         = require('express')
    , app           = express()
    , bodyParser    = require ('body-parser')
    , morgan        = require('morgan')
    , session       = require ('express-session')
    , path          = require('path');

// view engine setup
app.set('views', 'views');
app.set('view engine', 'pug');

// MIDDLEWARES
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.static('controllers'));
// Thanks to body parser, we can get information from POST and URL parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// Thanks to morgan, the requests will be logged to the console
app.use(morgan('dev'));

/* Use of session */
app.use(session({secret: 'mysecret', resave: false, saveUninitialized: true}));

//GET INDEX
var index = require('./routes/index');
app.use(index);

//LOGIN
var login = require('./routes/users/login');
app.use(login);

//REGISTER
var register = require('./routes/users/register');
app.use(register);

//LOGGED IN
var connected = require('./routes/connected');
app.use(connected);

//LOGOUT
var logout = require('./routes/users/logout');
app.use(logout);

//CREATE PROJECT
var new_project = require('./routes/projects/create');
app.use(new_project);

//EDIT PROJECT
var edit_project = require('./routes/projects/edit');
app.use(edit_project);

//DELETE PROJECT
var delete_project = require('./routes/projects/delete');
app.use(delete_project);

// ADD ACTIVITIES
var add_activities = require('./routes/activities/add');
app.use(add_activities);

// EDIT ONE ACTIVITY
var edit = require('./routes/activities/edit');
app.use(edit);

// DELETE ONE OR MORE ACTIVITIES
var delete_activities = require('./routes/activities/delete');
app.use(delete_activities);


module.exports = app;
