var express = require('express')
    , router = express.Router();

neo4j  = require('neo4j-driver').v1
    , driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , neo4j_session   = driver.session();

// EDIT PROJECT
router.get('/:username/project/:projectID', function (request, response) {

    var connectedUser = request.params.username
        , projectID   = parseInt(request.params.projectID)
        , project;

    neo4j_session
        .run('MATCH (a:Activity),(p:Project) '
            + 'WHERE ID(p)=toInt({projectID}) AND (p)-[:CONTAINS]->(a)'
            + 'RETURN a'
            , {projectID : projectID})

        .then(function(result){
            console.log('result: ');
            console.log(result);
            console.log('records');
            console.log(result.records);
            console.log('result.length: ' + result.records.length);
            for (i = 0, lenU = userArray.length; i < lenU; i++) {
                console.log('for running');
                if (userArray[i].username === connectedUser){
                    for (j =0 , lenP = userArray[i].projects.length;  j < lenP; j++) {
                        console.log(userArray[i].projects);
                        console.log('type: ' + typeof(j) + ", j: "+j);
                        console.log(userArray[i].projects[j]);
                        project = userArray[i].projects[j];
                        if ( project.id == projectID ){

                            response.render('index',
                                {authenticated      : true
                                    , projectEdition: true
                                    , user          : connectedUser
                                    , projectName   : project.name
                                    , activityCount : result.records.length
                                    , activities    : result.records
                                    , projects      : userArray[i].projects[j]
                                    , projectCount  : userArray[i].projects.length
                                })
                        }// if2
                    } // for2
                } //if1
            } // for1

        }, function(error){console.log(error)});//then

});

router.post('/edit/project/', function (request, response) {
    neo4j_session.run()
        .then(function(request,response){

        },function(error){

        })
});

module.exports = router;