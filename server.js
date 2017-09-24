// Dependencies
var express         = require ('express')
    , xsession      = require ('express-session')
    , xvalidator    = require('express-validator')
    , bodyParser    = require ('body-parser')
    , morgan        = require('morgan')
    , jwt           = require('jsonwebtoken');
    // , multer     = require ('multer')
    // , upload     = multer()


//Configuration
var app = express();

// view engine setup
app.set('views', 'views');
app.set('view engine', 'pug');

// MIDDLEWARES
app.use(express.static('/public'));
app.use(express.static('controllers'));
// Thanks to body parser, we can get information from POST and URL parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(xvalidator());
// Thanks to morgan, the requests will be logged to the console
app.use(morgan('dev'));

// var flash = require('./middlewares/flash');
//app.use(flash);

/* Use of session */
app.use(xsession({secret: 'mysecret', resave: false, saveUninitialized: true}));

userArray = [];
// LOCAL DATABASE
//var database = require('./configs/db-init');
//app.use(database);


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
var new_project = require('./routes/projects/create_project');
app.use(new_project);

//EDIT PROJECT
var edit_project = require('./routes/projects/edit_project');
app.use(edit_project);

//DELETE PROJECT
var delete_project = require('./routes/projects/delete_project');
app.use(delete_project);

// ADD ACTIVITIES
var add_activities = require('./routes/activities/add_activity');
app.use(add_activities);

// EDIT ONE ACTIVITY
var edit = require('./routes/activities/edit');
app.use(edit);

// DELETE ONE ACTIVITY
var delete_item = require('./routes/activities/delete_activity');
app.use(delete_item);


module.exports = app;

/*
// session  for ...
neo4j_session
    .run()
    .then()
    .catch();
    */