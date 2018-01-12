// --- routes/activities/add.js ---  //

// ** DEPENDENCIES ** //
// > all the modules we need
var router        = require('../../configs/modules').router;
var neo4j_session = require('../../configs/db').neo4j_session;

// ** CONFIGURATION ** //
// - Activity List : Add an Activity - /
router.post('/:username/project/:projectID/new_activity', function(request, response) {

    // >> Store the URL parameters and the user inputs and makes calculations
    var connectedUser       = request.params.username
        , currentProject    = request.params.projectID
        , description       = request.body.description
        , tag               = request.body.tag
        , OT                = parseFloat(parseFloat(request.body.OT).toFixed(2))
        , MLT               = parseFloat(parseFloat(request.body.MLT).toFixed(2))
        , PT                = parseFloat(parseFloat(request.body.PT).toFixed(2))
        , ET                = parseFloat(((OT + (MLT * 4) + PT)/6)).toFixed(2)
        , variance          = Math.pow(((PT - OT)/6),2)
        , predecessors ;

    // >> If the "Add Activity" form is empty, ...
    if (request.body === undefined
        // or one of the required field is missing
        || request.body.tag === ''  || request.body.OT === ''
        || request.body.MLT === ''  || request.body.PT === '') {
        // >> Refresh the page
        console.log('error', "The form is not complete");
        // todo : error message : error in form completion
        response.redirect('/'+ connectedUser + '/project/'+ currentProject);
    }
    // >> If the not OT <= MLT <= PT
    else if( !(OT <= MLT) && !(MLT <= PT) ){
        // >> Refresh the page
        console.log('error', 'OT should be <= MLT, and MLT should be <= PT');
        // todo : error message : PT <= MLT <= OT
        response.redirect('/'+ connectedUser + '/project/'+ currentProject);
    }

    // Else
    else {
// >> If there is one or more predecessors
        if (typeof(request.body.predecessors) == 'string' || typeof(request.body.predecessors)== 'object'  ){

            neo4j_session
            // >> Add the activities with predecessors
                .run( // ** Retrieve the current project
                    'MATCH (p:Project) WHERE ID(p)=toInteger({pID})'
                    // ** Add the new activity with all its parameters execept the predecessors
                    +' CREATE (new:Activity {tag:{tag}, description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:toFloat({ET}), successors:[], ES:0, EF:0, LS:0, LF:0, slack:0, variance:{variance}}),'
                    // ** Link the activity to the project
                    +' (p)-[:CONTAINS]->(new)'
                    // ** Return to show the result in the console and set the connection with predecessors
                    +' RETURN new'
                    , {pID : currentProject, tag: tag, description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, variance:variance})
                .then(function(result){
                    console.log("*** Activity "+result.records[0]._fields[0].identity.low+" added");
                    // >> Store the activity ID in a variable
                    var newActivityID = result.records[0]._fields[0].identity.low;

                    // >> If there is one predecessor, the predecessors variable is an array with the only predecessor ID
                    if(typeof(request.body.predecessors) == 'string'){ predecessors = [request.body.predecessors] }
                    // >> If there are more than one predecessor, the predecessors variable is the array of predecessors ID
                    if(typeof(request.body.predecessors) == 'object'){ predecessors = request.body.predecessors }

                    // >> Connection with the predecessors
                    for (i=0; i < predecessors.length; i++)
                    {
                        var predID = predecessors[i];
                        neo4j_session
                            .run( // ** Retrieve the current project with two activities ...
                                'MATCH (pred:Activity)<-[:CONTAINS]-(p:Project)-[:CONTAINS]->(new:Activity)'
                                // ** .. the predecessor and the new one
                                +' WHERE ID(p)=toInteger({pID}) AND ID(pred)=toInteger({predID}) AND ID(new)=toInteger({newActivityID})'
                                // ** Create a dependence relationship between the predecessor and the new activity
                                +' MERGE (pred)-[:ENABLES]->(new)'
                                +' SET pred.successors =+ new.tag'
                                ,{pID:currentProject, predID:predID, newActivityID:newActivityID})
                            .then(function(result){
                                console.log('Activity '+ predID +' and activity '+newActivityID+' are connected');
                            }, function(error){
                                console.log('____ ERROR ADDING THE PREDECESSOR '+ predID+' _____');
                                console.log(error);
                            });
                    }//for
                    // >> Call all the functions to update the project
                    updateProject(currentProject);

                    console.log('*** Activity with predecessors ***');
                    console.log('ID: '     + result.records[0]._fields[0].identity.low
                        +' tag: '          + result.records[0]._fields[0].properties.tag
                        +' description: '  + result.records[0]._fields[0].properties.description
                        +' ET: '           + result.records[0]._fields[0].properties.ET
                        +' predecessors: ' + result.records[0]._fields[0].properties.predecessors);

                    // >> Refresh the page
                    redirect(response,connectedUser,currentProject);
                }, function (error) {console.log('____ ERROR : CREATING AN ACTIVITY WITH PREDECESSORS ____');console.log(error);}); //then
        }
        // >> If there is no predecessor
        else if(request.body.predecessors == undefined) {

            neo4j_session
            // >> Add activities without predecessors
                .run( // ** Retrieve the current project
                    'MATCH (p:Project) WHERE ID(p)=toInteger({pID})'
                    // ** Retrieve the START node
                    +' MATCH (p)-[:CONTAINS]->(start:EndPoint{position:"Start"})'
                    // ** Create the new activity
                    +' CREATE (new:Activity {tag:{tag}, description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:toFloat({ET}), predecessors:["-"], successors:[], ES:0, EF:{ET}, LS:0, LF:0, variance:{variance}, slack:0 }),'
                    // ** Link the new activity to the project and to the START node
                    +' (p)-[:CONTAINS]->(new), (start)-[:ENABLES]->(new)'
                    +' SET start.successors =+ new.tag'
                    +' RETURN new'
                    , {pID: currentProject, tag:tag, description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, variance:variance})

                .then(function(result){
                    console.log("*** Activity "+result.records[0]._fields[0].identity.low+" added");

                    // >> Call all the functions to update the project
                    updateProject(currentProject);

                    console.log('*** Activity with no predecessor ***');
                    console.log('ID: '     + result.records[0]._fields[0].identity.low
                        +' tag: '          + result.records[0]._fields[0].properties.tag
                        +' description: '  + result.records[0]._fields[0].properties.description
                        +' ET: '           + result.records[0]._fields[0].properties.ET
                        +' predecessors: ' + result.records[0]._fields[0].properties.predecessors);

// >> Refresh the page
                    redirect(response,connectedUser,currentProject);
                }, function (error) {
                    console.log('____ ERROR : CREATING AN ACTIVITY WITH NO PREDECESSORS ____');
                    console.log(error);});

        }// else no predecessor
    } //else
}); //app.post CREATION

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

module.exports = router ;
