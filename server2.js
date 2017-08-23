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
*/

//GET INDEX

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



// ADD ACTIVITIES
app.post('/', function(request, response) {

    if (request.body === undefined
        || request.body.description === ''
        || request.body.OT === ''
        || request.body.MLT === ''
        || request.body.PT === '')
    {
        //request.flash('error', "The form is empty");
        console.log('error', "The form is empty");

    }
    else {

        var description = request.body.description
            , OT        = parseFloat(request.body.OT)
            , MLT       = parseFloat(request.body.MLT)
            , PT        = parseFloat(request.body.PT)
            , ET        = (OT + (MLT * 4) + PT)/6
            , parent    = request.body.parent
            , nino = '';

        if (activityArray.length === 0){ //ADD ACTIVITY #1

            sess
                .run('CREATE (new:Activity {description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:{parent}, Nino:{nino}})'
                    +'RETURN new'
                    , {description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:'', nino:nino})
                .then(function (result) {
                    //response.redirect('/');
                    sess.close();
                })
                .catch(function (error) {
                    console.log(error);
                });

        }//if

        else{ // ADD ACTIVITY #2 and +


            if (request.body.parent === ''){
                //if there is no parent, the property parent is empty
                 parent   = '';
            }else if (request.body.parent){
                // else, it is the value of the form
                parent = request.body.parent;
            };


            sess
                .run('MATCH(parent:Activity) WHERE parent.description = {parent} SET parent.nino = {description}'
                    +'CREATE (new:Activity {description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:{parent}, Nino:{nino}}),'
                    +'(new)-[isChild:DEPENDS_ON]->(parent),'
                    +'(parent)-[isParent:ENABLES]->(new)'
                    +'RETURN new, parent, isChild'
                    , {description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:parent, nino:nino})
                .then(function (result) {
                    //response.redirect('/');
                    sess.close();
                })
                .catch(function (error) {
                    console.log(error);
                });

        } // else activity #2


        // request.flash('success', "Activity added");
        console.log("body : ");
        console.log(request.body);
        console.log('success, activity added');

        response.redirect("/");

    } //else
}); //app.post CREATION


// EDIT ONE ACTIVITY


// DELETE ONE ACTIVITY
app.get('/delete', function(request, response) { //todo : url not modified

    var description = request.query.activity;
    console.log(description);

    sess
        .run('MATCH (activity)-[relations]-()'
            +'WHERE activity.description = {description}'
            +'DELETE activity, relations'
            , {description:description})


        .then( function(result) {
            var temp = activityArray.filter(function(value,index, array){

                if (value.description === description)
                { return false;}
                return true;
            });

            activityArray = temp;

            response.redirect('/');
            //response.render('index', {activities: activityArray, activityCount : activityArray.length})
        })//then


        .catch(function (error) {
            console.log(error);
        });

});//app.get DELETION

//DELETE ALL THE PROJECT
app.get('/erase', function(request, response) { //todo : url not modified

    sess
        .run('MATCH (n) DETACH DELETE n')


        .then( function(result) {
            //var empty = [];
            //activityArray = empty;

            activityArray = [];

            response.redirect('/');
            //response.render('index', {activities: activityArray, activityCount : activityArray.length})
        })


        .catch(function (error) {
            console.log(error);
        });

});//app.get DELETION


module.exports = app;

/*
// session  for ...
sess
    .run()
    .then()
    .catch();
    */