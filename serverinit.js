/*
// Dependencies

var express         = require ('express')
    , session       = require('express-session')
    , bodyParser    = require ('body-parser')
    , multer        = require  ('multer')
    , upload        = multer()
    ,   db   = require('seraph')('http://localhost:7474')
    , model  = require('seraph-model')
    , neo4j = require('neo4js')
    , driver  = require('neo4j-driver').v1
    , apoc   = require('apoc');


module.exports = MyApp = (function () {

    function MyApp(graphDb1) {

//Configuration
        module.exports = app = express();
        //var graphDb = require('./configs/db');
        this.graphDb = graphDb1;
        graphDb = this.graphDb;

//var index = require('./routes/index');
//app.use('/', index);
        // view engine setup
        app.set('views', 'views');
        app.set('view engine', 'pug');
        // MIDDLEWARES
        app.use(express.static('/public'));
        app.use(express.static('controllers'));
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
        app.use(session({
            secret:'secret',
            resave: false,
            saveUninitialized : true,
            cookie:{secure: false}
        }));
        var flash = require('./middlewares/flash');
        app.use(flash);

//DATABASE
        indexPromise = neo4j.index.Index(graphDb, "Index") ;
        indexPromise.then((index),

//routes
            app.get('/',function(request, response) {
                console.log(request.session);
                index.query("description:*").then((nodes),
                    response.render('index', {nodes:nodes})
                )

            }),


            app.post('/', upload.fields(), function(request,response) {

                if (request.body === undefined
                    || request.body.description === ''
                    || request.body.OT === ''
                    || request.body.MLT === ''
                    || request.body.PT === '')
                {
                    request.flash('error', "The form is empty");

                }
                else {
                    var Activity = require('./models/Activity');
                    description= request.body.description;
                    OT = request.body.OT;
                    MLT = request.body.MLT;
                    PT = request.body.PT;

                    node = graphDb.node({description: description, OT: OT, MLT: MLT,PT: PT});

                    //Activity.save({description: description, OT: OT, MLT: MLT,PT: PT}
                    //    , function(error, saved){if (error) throw error;});

                    request.flash('success', "Activity added");
                    console.log(request.body);

                    Activity.findAll(function (error, allActivities) {

                    })
                }
                //response.json(request.body);
                response.redirect('/')
            })

        );




    }
    return MyApp;


})

 */