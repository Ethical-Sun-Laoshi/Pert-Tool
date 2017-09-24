var express = require('express')
    , router = express.Router();

neo4j  = require('neo4j-driver').v1
    , driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , neo4j_session   = driver.session();

// EDIT PROJECT
router.get('/:username/project/:projectID', function (request, response) {

    var connectedUser = request.params.username
        , projectID   = parseInt(request.params.projectID)
        , project
        , activities
        , activityCount;

    neo4j_session
        .run('MATCH (p:Project) WHERE ID(p)=toInt({projectID})'
            +' WITH p'
            +' OPTIONAL MATCH (p)-[:CONTAINS]->(a:Activity)'
            +' WITH p, a, collect(ID(a)) as actID'
            +' ORDER BY actID'
            +' RETURN p, collect(a), size(collect(a)) as activityCount'
            , {projectID : projectID})

        .then(function(result) {

            project             = result.records[0].get('p').properties.name
                , activities    = result.records[0].get('collect(a)')
                , activityCount = result.records[0].get('activityCount');

            neo4j_session.run('MATCH (p:Project)-[:CONTAINS]->(start:EndPoint {position:"Start"}) WHERE ID(p)=toInteger({projectID})'
                +' WITH start'
                +' MATCH cp = (start)-[e:ENABLES*]->(:EndPoint {position:"Finish"})'
                +' WITH cp, REDUCE(x = 0, a IN NODES(cp) | x + a.ET) AS project_duration ORDER BY project_duration DESC LIMIT 1'
                +' RETURN project_duration'
                , {projectID:projectID})
                .then(function(result){

                    pDuration = result.records[0].get('project_duration');

                    response.render('index',
                        {authenticated         : true
                            , projectEdition   : true
                            , user             : connectedUser
                            , projectID        : projectID
                            , project          : project
                            , activities       : activities
                            , activityCount    : activityCount
                            , pDuration        : pDuration
                        });

                    neo4j_session.close();

                },function(error){console.log(error)})
        }, function(error){console.log(error)});

});

module.exports = router;
