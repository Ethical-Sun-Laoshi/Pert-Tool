// Dependencies
var express      = require ('express')
    , session    = require ('express-session')
    , bodyParser = require ('body-parser')
    , multer     = require ('multer')
    , upload     = multer()
    , neo4j      = require('neo4j-driver').v1
    , driver     = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , sess       = driver.session() ;

    var app = express();

//Configuration

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

            app.get('/', function(request, response) {
                sess
                    .run('MATCH (n) RETURN n LIMIT 25') //n = all nodes ; n:Activity = all activities

                    // callback function
                    .then( function(result){
                        var activityArray = [];
                        result.records.forEach(function (record) {
                            activityArray.push({
                                id          : record._fields[0].identity.low,
                                description : record._fields[0].properties.description,
                                PT          : record._fields[0].properties.PT,
                                MLT         : record._fields[0].properties.MLT,
                                OT          : record._fields[0].properties.OT
                            }); //push
                            console.log('record :');
                            console.log(record._fields[0].properties);
                        })//forEach

                        response.render('index', {activities : activityArray});

                    })// then

                    .catch(function (error) {
                        console.log('error : ');
                        console.log(error);
                    }); // catch




            });


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
                        , OT        = request.body.OT
                        , MLT       = request.body.MLT
                        , PT        = request.body.PT ;


                    //todo : add the variables in the database


                   // request.flash('success', "Activity added");
                    console.log("body : ");
                    console.log(request.body);

                    response.redirect("/");


                } //else
            }); //app.post


module.exports = app;