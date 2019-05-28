// --- routes/projects/edit.js ---  //
//
// ** DEPENDENCIES ** //
// > all the modules we need
var router        = require('../../configs/modules').router;
var neo4j_session = require('../../configs/db').neo4j_session;


// ** CONFIGURATION ** //
// - Project List : Edit a project - /;
router.get('/:username/project/:projectID', function (request, response) {

    // Store URL params
    var connectedUser = request.params.username
        , projectID   = parseInt(request.params.projectID)
        , project
        , activities
        , activityCount;

    neo4j_session
    // >> Give the activities of the project, ordered by descendant ID
        .run(// ** Retrieve the current project
            'MATCH (p:Project) WHERE ID(p)=toInt({projectID})'
            +' WITH p'
            // ** If existing, retrieve the current project activities ID
            +' OPTIONAL MATCH (p)-[:CONTAINS]->(a:Activity)'
            +' WITH p, a, collect(ID(a)) as actID'
            // ** Order them by descendant ID
            +' ORDER BY actID'
            // ** Return the project and the collection of activities
            +' RETURN p, collect(a)'
            , {projectID : projectID})

        .then(function(result) {

            // >> Store the query results
            project             = result.records[0].get('p').properties.name
                , activities    = result.records[0].get('collect(a)')
                , activityCount = result.records[0].get('p').properties.activityCount;

            neo4j_session
            // >> Give the critical path, the critical activities, and the project duration.
                .run(// ** Retrieve the current project and its START endpoint
                    'MATCH (p:Project)-[:CONTAINS]->(start:EndPoint {position:"Start"}) WHERE ID(p)=toInteger({pID})'
                    +' WITH start, p'
                    // ** Retrieve all the activities (dependent of START and givind FINISH) in a path
                    +' MATCH cp = (start)-[:ENABLES*]->(:EndPoint {position:"Finish"})'
                    +' WITH cp, NODES(cp) AS criticalPath, p'
                    // ** For each (critical) activity in the (critical) path
                    +' UNWIND criticalPath AS criticalActivity'
                    // ** Make the sum of all the different paths going from START to FINISH and store this in project_duration
                    +' WITH cp, p, criticalPath, sum(toFloat(criticalActivity.ET)) AS project_duration'
                    // ** Retrieve the highest sum
                    +' ORDER BY project_duration DESC LIMIT 1'
                    +' WITH cp, criticalPath, p, project_duration'
                    // ** The highest sum is the project duration
                    +' SET p.duration = project_duration'
                    +' WITH cp, criticalPath, p'
                    // ** Retrieve the activity tags of the path with the highest sum
                    +' UNWIND criticalPath AS criticalActivity'
                    +' WITH cp, criticalPath, criticalActivity, p'
                    +' RETURN p.duration, collect(criticalActivity.tag) AS nCriticalPath'
                    , {pID:projectID})
                .then(function(result){

                    // >> If there is no result (because no activity)
                    if (result.records.length == 0){
// >> The critical path is compose of START and FINISH
                        criticalPath = ['Start', 'Finish']
                            // >> and have a duration equal to zero (rounded in the view)
                            , pDuration = 0.0001 ;
                    }//if
                    else  {
                        // Else, the critical path and project duration are retrieve and used
                        var criticalPath = result.records[0].get('nCriticalPath')
                            , pDuration  = result.records[0].get('p.duration');
                    } // else
                    console.log('critical path: ' + criticalPath);
                    console.log('project duration: '+ pDuration);

                    // >> Active the new view
                    response.render('index',
                        {authenticated         : true
                            , projectEdition   : true
                            , user             : connectedUser
                            , projectID        : projectID
                            , project          : project
                            , activities       : activities
                            , activityCount    : parseInt(activityCount)
                            , pDuration        : parseFloat(pDuration)
                            , criticalPath     : criticalPath
                        });

                    neo4j_session.close();

                },function(error){
                    console.log('____ ERROR : SHOWING CRITICAL PATH ____');
                    console.log(error)})
        }, function(error){
            console.log('____ ERROR : SHOWING ACTIVITIES ____');
            console.log(error)        });

});

module.exports = router;

