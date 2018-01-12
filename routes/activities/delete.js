// --- routes/activities/delete.js ---  //

/* ! NOT IN USE !*/


// ** DEPENDENCIES ** //
// > all the modules we need
var router        = require('../../configs/modules').router;
var neo4j_session = require('../../configs/db').neo4j_session;

// ** CONFIGURATION ** //

/* TODO : DELETE AN ACTIVITY */
// - Activity List : Delete an activity - /
router.post('/:username/project/:projectID/activity/:activityID/delete', function(request, response) {

    // >> Store the URL parameters
    var user        = request.params.username
        ,project    = request.params.projectID
        ,activityID   = parseInt(request.params.activityID); // or toInt({JSnumber}) in the cypher query

    neo4j_session
        .run(// ** Select the current activity
            'MATCH (a:Activity) WHERE ID(a)={id}'
            // ** Delete the activity and all the relative relationships
            +' DETACH DELETE a'
            , {id:activityID})

        .then( function() {
                console.log('Activity '+activityID+' erased...');
                // Todo : change the relationships
                // See : add activity --> updateNetwork(projectID)
                // >> Change the relationships between activities and the FINISH node
                updateProject(project);
                console.log("project updated");
                redirect(response, user, project)
                //response.redirect('/'+user+'/project/'+ project);
            }
            ,function (error) {
                console.log('____ ERROR : ACTIVITY DELETION ____');
                console.log(error);}
        ); // then


});//router.post DELETE ONE



function updateProject (projectID) {
    updateNetwork(projectID);
    predecessors(projectID);
    activityCount(projectID);
    earliestTimes(projectID);
    updateFinish(projectID);
    latestTimes(projectID);
    slackTime(projectID)
}

// >> Give the number of activities in the project
function activityCount(projectID){
    neo4j_session.run(// ** Retrieve all the actitivies ...
        'MATCH (p:Project)-[:CONTAINS]->(a:Activity)'
        // ** ... in the current project
        +' WHERE ID(p)=toInteger({pID})'
        // ** Count the number of activities in the project
        +' WITH count(a) as ActivityCount, p'
        // ** Set this count as the project "activityCount" property
        +' SET p.activityCount = ActivityCount'
        , {pID:projectID})
        .then(function(result){}, function(error){console.log('____ ERROR FOR COUNTING ACTIVITIES IN PROJECT ____');console.log(error)})
}

// >> Change the relationships between activities and the FINISH node
function updateNetwork (projectID){

    // >> Delete the connection to the FINISH node if the ACTIVITY has successors
    neo4j_session.run('MATCH (p:Project)-[:CONTAINS*]->(:Activity)<-[:ENABLES]-(a:Activity)-[d:ENABLES]->(finish:EndPoint{position:"Finish"})'
        +'WHERE ID(p)=toInteger({projectID})'
        +'DELETE d'
        , {projectID:projectID})
        .then(function(result){}, function(error){console.log('____ ERROR IN UPDATE NETWORK : DELETE ACTIVITY->FINISH ____');console.log(error)});

    // >> Add a connection to the FINISH node if the ACTIVITY has no successor
    neo4j_session.run("MATCH path=(finish:EndPoint{position:'Finish'})<-[:CONTAINS]-(p:Project)-[:CONTAINS*]->(a:Activity)"
        +" WHERE ID(p)=toInteger({pID})"
        +" WITH collect(a) AS activities, p, finish"
        +" UNWIND activities AS task"
        +" MATCH (task) WHERE NOT (task)-[:ENABLES]->(:Activity)"
        +" WITH task, finish"
        +" MERGE (task)-[:ENABLES]->(finish)"
        +" SET finish.predecessors = FILTER( activity IN finish.predecessors WHERE activity <> task.tag)"
        +" RETURN finish"
        ,{pID : projectID})
        .then(function(result){
            console.log('** add act->fin ***');
            console.log(result.records[0]._fields[0].properties);
        }, function(error){console.log('____ ERROR IN UPDATE NETWORK : ADD ACTIVITY->FINISH ____');console.log(error)})
}

// >> Retrieve the predecessors name of each activity
function predecessors(projectID){
    neo4j_session
        .run(// ** Retrieve the activities and their direct successors ...
            'MATCH (p)-[:CONTAINS]->(a:Activity)-[:ENABLES]->(b)'
            // ** ... in the current project
            +' WHERE ID(p)=toInteger({pID})'
            // ** Collect all the labels of predecessors in a array
            +' WITH b, collect(a.tag) AS predecessors'
            // ** And the array in the predecessors property of the successors
            +' SET b.predecessors = predecessors'
            // ** Optional return to show result in the console **
            +' RETURN b',{pID: projectID})
        .then(function(result){
                console.log('** Predecessors ***');
                for (i=0; i < result.records.length; i++){
                    for(j=0;j < result.records[i]._fields.length; j++){
                        console.log(result.records[i]._fields[j].properties.tag
                            +': '+result.records[i]._fields[j].properties.predecessors)
                    }
                }
            }
            , function(error){
                console.log('____ ERROR : SET THE PREDECESSORS _____');
                console.log(error)}
        );}

// >> Calculate the Earliest Start and Finish Times of each activity
function earliestTimes (projectID){
    neo4j_session.run(// ** Retrieve any activity ...
        'MATCH (p:Project)-[:CONTAINS]->(a:Activity)'
        // ** ...in the current project
        +' WHERE ID(p)=toInteger({pID})'
        // ** Round the earliest start and finish of each activity to two decimals
        +' SET a.ES = round(toInteger(100) * toFloat(a.ES)) / toInteger(100)'
        +' SET a.EF = round(toInteger(100) * toFloat(a.EF)) / toInteger(100)'
        +' WITH a'
        // ** Retrieve the activities with its direct predecessors (all activities)
        +' MATCH (pred)-[:ENABLES]->(a)'
        // ** Select an activity, and the maximum EF of its predecessors
        +' WITH a, MAX(pred.EF) AS maxEF'
        // ** The ES of an activity is the maximum EF of its predecessors
        // ** The EF of an activity is its ES plus its ET
        +' SET a.ES = maxEF,a.EF = toFloat(a.ES) + toFloat(a.ET)'
        // ** Round EF to two decimals
        +' SET a.EF = round(toInteger(100) * toFloat(a.EF)) / toInteger(100)'
        // ** Optional return to check the results on the console **
        +' RETURN a ORDER BY ID(a)'
        ,{pID:projectID})
        .then(function(result){
            console.log('** earliest times ***');
            for (i=0; i < result.records.length; i++){
                for(j=0;j < result.records[i]._fields.length; j++){
                    console.log(result.records[i]._fields[j].properties.tag
                        +': LS= '+result.records[i]._fields[j].properties.ES.low
                        +', ET= '+result.records[i]._fields[j].properties.ET.low
                        +', LF= '+result.records[i]._fields[j].properties.EF.low)
                }
            }
        },function(error){
            console.log('____ ERROR IN EARLIEST TIMES ____');
            console.log(error)});
}

// >> Update the FINAL node times
function updateFinish(projectID){
    neo4j_session.run('MATCH (p:Project)-[:CONTAINS]->(start:EndPoint {position:"Start"}) WHERE ID(p)=toInteger({pID})'
        +' WITH start'
        +' OPTIONAL MATCH cp = (start)-[:ENABLES*]->(finish:EndPoint {position:"Finish"})'
        +' WITH cp, NODES(cp) AS criticalPath, finish'
        +' UNWIND criticalPath AS criticalActivity'
        +' WITH cp, criticalPath, finish, sum(toFloat(criticalActivity.ET)) AS project_duration'
        +' ORDER BY project_duration DESC LIMIT 1'
        +' WITH project_duration, finish'
        +' SET finish.ES = project_duration,finish.EF = project_duration,finish.LS = project_duration,finish.LF = project_duration'
        +' RETURN finish'
        ,{pID:projectID})
        .then(function(result){
                console.log('** update finish ***');
                console.log(result.records[0]._fields[0].properties);
            }
            , function(error){console.log('____ ERROR : UPDATE FINISH ____');console.log(error)})
}

// >> Calculate the Latest Finish and Start Times of each activity
function latestTimes(projectID) {
    neo4j_session
        .run(// ** Retrieve any activity ...
            'MATCH (p:Project)-[:CONTAINS]->(a:Activity)'
            // ** ...in the current project
            +' WHERE ID(p)=toInteger({pID})'
            // ** Round the latest start and finish to two decimals
            +' SET a.LS = round(toInteger(100) * toFloat(a.LS)) / toInteger(100)'
            +' SET a.LF = round(toInteger(100) * toFloat(a.LF)) / toInteger(100)'
            +' WITH a'
            // ** Retrieve the activities with its direct successors
            +' MATCH (a)-[:ENABLES]->(b)'
            // ** Select any activity, and the minimum LS of its successors
            +' WITH min(b.LS) as minLS,a'
            // ** The LF of an activity is the minimum LS of its successors
            // ** The LS of an activity is its EF minus its ET
            +' SET a.LF = minLS,a.LS=toFloat(a.LF)-toFloat(a.ET)'
            // ** Round LS to two decimals
            +' SET a.LS = round(toInteger(100) * toFloat(a.LS)) / toInteger(100)'
            // ** Optional return to check the results on the console **
            +' RETURN a ORDER BY ID(a)'
            ,{pID:projectID})
        .then(function(result){
                console.log('** latest times ***');
                for (i=0; i < result.records.length; i++){
                    for(j=0;j < result.records[i]._fields.length; j++){
                        console.log(result.records[i]._fields[j].properties.tag
                            +': LS= '+result.records[i]._fields[j].properties.LS.low
                            +', ET= '+result.records[i]._fields[j].properties.ET.low
                            +', LF= '+result.records[i]._fields[j].properties.LF.low)
                    }
                }
            }
            ,function(error){
                console.log('____ ERROR : LATEST TIMES ____');
                console.log(error);
            });

}

// >> Calculate the slack time of each activity (It can be LS-ES or LF-EF. The first one is choosen)
function slackTime (projectID){
    neo4j_session.run('MATCH (p:Project)-[:CONTAINS]->(a:Activity) WHERE ID(p)=toInteger({pID})'
        +' SET a.slack = toInteger(a.LS) -  toInteger(a.ES)'
        +' RETURN a'
        ,{pID:projectID})
        .then(function(result){
                console.log('** slack Time ***');
                for (i=0; i < result.records.length; i++){
                    for(j=0;j < result.records[i]._fields.length; j++){
                        console.log(result.records[i]._fields[j].properties.tag+':'+result.records[i]._fields[j].properties.slack.low)
                    }
                }
            }
            ,function(error){console.log('____ ERROR IN SLACK TIME ____');console.log(error)});

}

function redirect(response, user, project){
    response.redirect('/'+ user + '/project/' + project);
    neo4j_session.close();
}

/* TODO : DELETE ALL ACTIVITIES*/
router.post('/:username/project/:projectID/activities/delete', function(request, response){
    // >> Store URL params
    var user             = request.params.username
        ,projectID        = request.params.projectID;

    neo4j_session
    // ** Retrieve the current project and delete it with all its relationships and all "inferior" nodes
        .run('MATCH (p:Project)-->(a:Activity) WHERE ID(p)=toInteger({projectID}) DETACH DELETE a', {projectID:projectID})
        .then( function() {
            console.log('Activities erased...');
            // >> Return to project edition
            response.redirect('/'+user+'/project/'+projectID);
        },function (error) {
            console.log(error);
        });
}); //router.post DELETE ALL

module.exports = router;