var express = require('express')
    , router = express.Router();

neo4j  = require('neo4j-driver').v1
    , driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , neo4j_session   = driver.session();

// ADD ACTIVITIES
router.post('/:username/project/:projectID/new_activity', function(request, response) {

    var connectedUser       = request.params.username
        , currentProject    = request.params.projectID

        , description       = request.body.description
        , tag               = request.body.tag
        , OT                = parseFloat(request.body.OT)
        , MLT               = parseFloat(request.body.MLT)
        , PT                = parseFloat(request.body.PT)
        , ET                = (OT + (MLT * 4) + PT)/6
        , std               = (PT - OT)/6
        , predecessorsID    = request.body.predecessors;


    if (request.body === undefined
        || request.body.description === ''
        || request.body.OT === ''
        || request.body.MLT === ''
        || request.body.PT === '')
    {
        console.log('error', "The form is not complete");
        // todo : error message : empty form
        response.redirect('/'+ connectedUser + '/project/'+ currentProject);

    } else if( !(OT <= MLT) && !(MLT <= PT) ){

        console.log('error', 'OT should be <= MLT, and MLT should be <= PT');
        // todo : error message : PT <= MLT <= OT
        response.redirect('/'+ connectedUser + '/project/'+ currentProject);

    }
    else {

        if (predecessorsID === 'none'){ //ADD ACTIVITY #1 || if there is no parent

            neo4j_session
                .run('MATCH (p:Project) WHERE ID(p)=toInt({pID})'
                    +'CREATE (new:Activity {tag:{tag}, description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, predecessors:[], successors:[], ES:0, EF:0, LS:0, LF:0, std:{std} }),'
                    +'(p)-[:CONTAINS]->(new)'
                    , {pID: currentProject, tag:tag, description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, std:std})

                .then(function(result){
                    response.redirect('/'+ connectedUser + '/project/' + currentProject);
                    neo4j_session.close();
                }, function (error) {console.log(error);});

        } else { // ADD ACTIVITY #2 and + || or the ones with parents

            neo4j_session
                .run('MATCH(predecessor:Activity), (p:Project) '
                    +'WHERE ID(predecessor) = toInt({predecessorID}) '
                    +'AND ID(p)=toInt({pID})'
                    +'CREATE (new:Activity {tag:{tag}, description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, predecessors:[predecessor.description], successors ES:0, EF:0, LS:0, LF:0, std:{std}}),'
                    +'(predecessor)-[:ENABLES]->(new),(p)-[:CONTAINS]->(new)'
                    , {pID : currentProject, tag: tag, description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, std:std, predecessorsID:predecessorsID})

                .then(function(result){
                    response.redirect('/'+ connectedUser + '/project/' + currentProject);
                    neo4j_session.close();
                }, function (error) {console.log(error);}); //then
        } // else activity #2
        console.log('success, activity added');
    } //else
}); //app.post CREATION

module.exports = router ;