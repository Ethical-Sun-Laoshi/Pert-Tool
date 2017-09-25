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
                +' WITH cp, NODES(cp) AS criticalPath'
                +' WITH cp, criticalPath, REDUCE(x = 0, a IN criticalPath | x + a.ET) AS project_duration ORDER BY project_duration DESC LIMIT 1'
                +' WITH cp, criticalPath, project_duration'
                +' UNWIND criticalPath AS criticalActivity'
                +' WITH cp, criticalPath, criticalActivity, project_duration'
                +' RETURN project_duration, collect(criticalActivity.tag) AS nCriticalPath'
                , {projectID:projectID})
                .then(function(result){

                    console.log("//// CRITICAL PATH /// ");
                    console.log(result.records[0].get('nCriticalPath'));
                    criticalPath    = result.records[0].get('nCriticalPath')
                         ,pDuration = result.records[0].get('project_duration');

                    response.render('index',
                        {authenticated         : true
                            , projectEdition   : true
                            , user             : connectedUser
                            , projectID        : projectID
                            , project          : project
                            , activities       : activities
                            , activityCount    : activityCount
                            , pDuration        : pDuration
                            , criticalPath     : criticalPath
                        });

                    neo4j_session.close();

                },function(error){console.log(error)})
        }, function(error){console.log(error)});

});

module.exports = router;
