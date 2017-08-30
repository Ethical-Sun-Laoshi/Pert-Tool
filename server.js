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

//DATABASE become ARRAY

/* On utilise les sessions */
app.use(session({secret: 'mysecret', resave: false, saveUninitialized: true}))

/* S'il n'y a pas de todolist dans la session,
on en crée une vide sous forme d'array avant la suite */
    .use(function(request, response, next){
        if (typeof(request.session.activityArray) == 'undefined') {
            request.session.activityArray = [];
            console.log('first : ' + request.session.activityArray.length)
        }
        next();
    });

//var activityArray = [];


//GET INDEX
app.get('/', function(request, response) {
    sess
        .run('MATCH (n:Activity) RETURN n LIMIT 25') //n = all nodes ; n:Activity = all activities

        // callback function
        .then( function(result) {
            /*
                        result.records.forEach(function (record) {
                            request.session.activityArray.push({
                                id            : record._fields[0].identity.low
                                , description : record._fields[0].properties.description
                                , PT          : parseFloat(record._fields[0].properties.PT)
                                , MLT         : parseFloat(record._fields[0].properties.MLT)
                                , OT          : parseFloat(record._fields[0].properties.OT)
                                , ET          : record._fields[0].properties.ET
                                , parent      : record._fields[0].properties.parent
                                , nino        : record._fields[0].properties.nino
                            }); //push

                            //console.log('record :');
                            //console.log(record._fields[0].properties);
                        });//forEach
            */

            console.log("size : " + request.session.activityArray.length);
            response.render('index', {activities: request.session.activityArray, activityCount : request.session.activityArray.length});
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

        if (request.session.activityArray.length === 0 || request.body.parent === 'none'){ //ADD ACTIVITY #1 || if there is no parent

            sess
                .run('CREATE (new:Activity {description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:{parent}, Nino:{nino}})'
                    +'RETURN new'
                    , {description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:'', nino:nino})
                .then( function (result) {

                    result.records.forEach(function (record) {
                        request.session.activityArray.push({
                            id: record._fields[0].identity.low
                            , description: record._fields[0].properties.description
                            , PT: parseFloat(record._fields[0].properties.PT)
                            , MLT: parseFloat(record._fields[0].properties.MLT)
                            , OT: parseFloat(record._fields[0].properties.OT)
                            , ET: record._fields[0].properties.ET
                            , parent: record._fields[0].properties.parent
                            , nino: record._fields[0].properties.nino
                        }); //push

                    });//forEach

                    response.redirect('/');
                    sess.close();
                })
                .catch(function (error) {
                    console.log(error);
                });

        }//if

        else{ // ADD ACTIVITY #2 and + || or the ones with parents
            sess
                .run('MATCH(parent:Activity) WHERE parent.description = {parent} SET parent.nino = {description}'
                    +'CREATE (new:Activity {description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:{parent}, Nino:{nino}}),'
                    +'(new)-[isChild:DEPENDS_ON]->(parent),'
                    +'(parent)-[isParent:ENABLES]->(new)'
                    +'RETURN new, parent, isChild'
                    , {description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:parent, nino:nino})

                .then(function(result) {

                    result.records.forEach(function (record) {
                        request.session.activityArray.push({
                            id            : record._fields[0].identity.low
                            , description : record._fields[0].properties.description
                            , PT          : parseFloat(record._fields[0].properties.PT)
                            , MLT         : parseFloat(record._fields[0].properties.MLT)
                            , OT          : parseFloat(record._fields[0].properties.OT)
                            , ET          : record._fields[0].properties.ET
                            , parent      : record._fields[0].properties.parent
                            , nino        : record._fields[0].properties.nino
                        }); //push

                        //console.log('record :');
                        //console.log(record._fields[0].properties);
                    });//forEach


                    response.redirect('/');
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

//response.redirect("/");

    } //else
}); //app.post CREATION


// EDIT ONE ACTIVITY
app.post('/edit', function(request, response){
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

        var id           = neo4j.int(request.query.activity)
            ,description = request.body.description
            , OT         = parseFloat(request.body.OT)
            , MLT        = parseFloat(request.body.MLT)
            , PT         = parseFloat(request.body.PT)
            , ET         = (OT + (MLT * 4) + PT)/6
            , parent     = request.body.parent;
        console.log('the activity selected is the ' +id );
        if (request.body.parent === 'none'){ //if there is no parent

            sess
                .run( 'MATCH (activity:Activity) WHERE ID(activity) = {id}'
                    +'SET activity.description = {description},activity.OT = {OT},activity.MLT = {MLT},activity.PT = {PT},activity.ET = {ET},activity.parent = {parent}'
                    +'RETURN activity'
                    +'MATCH (:Activity {description: {description})-[r]-()'
                    +'WHERE type(r)= "DEPENDS_ON"'
                    +'DELETE r'

                    , {description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:'', nino:''}
                    , console.log('edited'))
                .then( function (result) {

                    result.records.forEach(function (record) {
                        request.session.activityArray.push({
                            id: record._fields[0].identity.low
                            , description: record._fields[0].properties.description
                            , PT: parseFloat(record._fields[0].properties.PT)
                            , MLT: parseFloat(record._fields[0].properties.MLT)
                            , OT: parseFloat(record._fields[0].properties.OT)
                            , ET: record._fields[0].properties.ET
                            , parent: record._fields[0].properties.parent
                            , nino: record._fields[0].properties.nino
                        }); //push

                    });//forEach

                    response.redirect('/');
                    sess.close();
                })
                .catch(function (error) {
                    console.log(error);
                });

        }//if

        else{ // if there is a parent
            sess
                .run('MATCH (activity:Activity) WHERE ID(activity) = {id}'
                    +'SET activity.description = {description},activity.OT = {OT},activity.MLT = {MLT},activity.PT = {PT},activity.ET = {ET},activity.parent = {parent}'
                    +'MERGE (parent:Activity {description:{parent}})'
                    +'MERGE (activity)-[isChild:DEPENDS_ON]->(parent)'
                    +'MERGE (parent)-[isParent:ENABLES]->(activity)'
                    +'SET parent.nino = {activity}'
                    +'RETURN activity,parent,isChild,isParent'
                    , {id:id, description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:parent})

                .then(function(result) {

                    result.records.forEach(function (record) {
                        request.session.activityArray.push({
                            id            : record._fields[0].identity.low
                            , description : record._fields[0].properties.description
                            , PT          : parseFloat(record._fields[0].properties.PT)
                            , MLT         : parseFloat(record._fields[0].properties.MLT)
                            , OT          : parseFloat(record._fields[0].properties.OT)
                            , ET          : record._fields[0].properties.ET
                            , parent      : record._fields[0].properties.parent
                            , nino        : record._fields[0].properties.nino
                        }); //push

                        //console.log('record :');
                        //console.log(record._fields[0].properties);
                    });//forEach


                    response.redirect('/');
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

//response.redirect("/");

    } //else
}); //app.post EDITION



// DELETE ONE ACTIVITY
app.get('/delete', function(request, response) { //todo : url not modified

    var id = neo4j.int(request.query.activity);
    console.log('the activity selected is the ' +id );

    sess
        .run('MATCH (activity:Activity)'
            +'WHERE ID(activity)={id}'
            +'OPTIONAL MATCH (activity)-[relations]-()'
            +'DELETE activity, relations'

            , {id:id}, console.log('done on  neo4j'))


        .then( function(result) {
            array = [1,2,3,4,5,6,7,8,9];
            console.log("size before delete: " + array.length);

            if (id != ''){
                console.log("the activity to delete is: " + array[id]);
                array.splice(id, 1);
                console.log('activity deleted');
            }

            console.log('size after delete: ' + array.length);
            console.log('array : ' + array);

            /*
            console.log("size before delete: " + request.session.activityArray.length);

            if (id != ''){
                console.log("the activity to delete is: " + request.session.activityArray[id]);
                request.session.activityArray.splice(id, 1);
                console.log('activity deleted');
            }

            console.log('size after delete: ' + request.session.activityArray.length);
            console.log('array : ' + request.session.activityArray);
*/
            response.redirect('/');
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

            request.session.activityArray = [];
            response.redirect('/');

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