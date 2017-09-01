// Dependencies
var express      = require ('express')
    , session    = require ('express-session')
    , bodyParser = require ('body-parser')
    // , multer     = require ('multer')
    // , upload     = multer()
    , neo4j  = require('neo4j-driver').v1
    , driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , sess   = driver.session();




//Configuration
var app = express();

// view engine setup
app.set('views', 'views');
app.set('view engine', 'pug');

// MIDDLEWARES
app.use(express.static('/public'));
app.use(express.static('controllers'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// var flash = require('./middlewares/flash');
//app.use(flash);

/* Use of session */
app.use(session({secret: 'mysecret', resave: false, saveUninitialized: true}))

//DATABASE becomes ARRAY (web visualisation)
/* If there is no activity list, we create an empty one */
    .use(function(request, response, next){
        if (typeof(request.session.activityArray) == 'undefined') {
            request.session.activityArray = [];
            console.log('first : ' + request.session.activityArray.length)
        }
        next();
    });


//GET INDEX
var index = require('./routes/index');
app.use('/', index);

// ADD ACTIVITIES
var add_activities = require('./routes/add_activities');
app.use('/add', add_activities);

// EDIT ONE ACTIVITY
var edit = require('./routes/edit');
app.use('/edit', edit);

// DELETE ONE ACTIVITY
var delete_item = require('./routes/delete_item');
app.use('/delete', delete_item);

//DELETE ALL THE PROJECT
var erase = require('./routes/delete_all');
app.use('/erase', erase);

module.exports = app;

/*
// session  for ...
sess
    .run()
    .then()
    .catch();
    */