// Dependencies
var express      = require ('express')
    , session    = require ('express-session')
    , bodyParser = require ('body-parser');
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
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



// var flash = require('./middlewares/flash');
//app.use(flash);

//DATABASE
var activityArray = [];

//INITIAL INDEX
/*
var index_init = require('./routes/index_init');
app.use(index_init);

//ADD ACTIVITY #1
var activity_one = require('./routes/add_activities');
app.use(activity_one);
*/

//GET INDEX
//var index = require('./routes/index');
//app.use(index);

app.get('/', function(request, response) {
    sess
        .run('MATCH (n:Activity) RETURN n LIMIT 25') //n = all nodes ; n:Activity = all activities

        // callback function
        .then( function(result) {

            //var activityArray = []

            result.records.forEach(function (record) {
                activityArray.push({
                    id            : record._fields[0].identity.low
                    , description : record._fields[0].properties.description
                    , PT          : parseFloat(record._fields[0].properties.PT)
                    , MLT         : parseFloat(record._fields[0].properties.MLT)
                    , OT          : parseFloat(record._fields[0].properties.OT)
                    , ET          : record._fields[0].properties.ET
                    , parent      : record._fields[0].properties.parent
                    , nino        : record._fields[0].properties.nino
                }); //push

                console.log('record :');
                console.log(record._fields[0].properties);
            });//forEach

            response.render('index', {activities: activityArray, activityCount : activityArray.length})
        })//then


        .catch(function (error) {
            console.log('error : ');
            console.log(error);
        }); // catch

});//app.get



// ADD ACTIVITY #2 and +
var add_activity = require('./routes/add_activities');
app.use(add_activity);

// EDIT ONE ACTIVITY
var edit = require('./routes/edit');
app.use(edit);

// DELETE ONE ACTIVITY
var delete_item = require('./routes/delete_item');
app.use(delete_item);

//DELETE ALL THE PROJECT
var delete_all = require('./routes/delete_all');
app.use(delete_all);


module.exports = app;

/*
// session  for ...
sess
    .run()
    .then()
    .catch();
    */