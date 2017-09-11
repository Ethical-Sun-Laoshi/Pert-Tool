var express = require('express')
    , router = express.Router();

neo4j  = require('neo4j-driver').v1
    , driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , neo4j_session   = driver.session();

// ADD ACTIVITIES
router.post('/:username/project/:projectID/new_activity', function(request, response) {

    var connectedUser    = request.params.username
        , currectProject = request.params.projectID;

    if (request.body === undefined
        || request.body.description === ''
        || request.body.OT === ''
        || request.body.MLT === ''
        || request.body.PT === '')
    {
        //request.flash('error', "The form is empty");
        console.log('error', "The form is not complete");

    }
    else {

        // todo : PT <= MLT <= OT
        var description = request.body.description
            , tag       = request.body.tag
            , OT        = parseFloat(request.body.OT)
            , MLT       = parseFloat(request.body.MLT)
            , PT        = parseFloat(request.body.PT)
            , ET        = (OT + (MLT * 4) + PT)/6
            , parent    = []
            , parentTag = request.body.parent
            , nino      = [];

        //todo : neo4j_session.run query to ...
        // cypher query to return all the activities linked to the project
        for (i = 0, lenU = userArray.length; i < lenU; i++) {
            console.log('for running');
            if (userArray[i].username === connectedUser) {
                for (j = 0 , lenP = userArray[i].projects.length; j < lenP; j++) {
                    console.log(userArray[i].projects);
                    project = userArray[i].projects[j];
                    if ( project.id == currectProject ){
                        activities = project.activities;
                        if (activities.length === 0 || request.body.parent === 'none'){ //ADD ACTIVITY #1 || if there is no parent

                            neo4j_session
                                .run('MATCH (p:Project) WHERE ID(p)=toInt({pID})'
                                    +'CREATE (new:Activity {tag:{tag}, description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:{parent}, nino:{nino}}),'
                                    +'(p)-[:CONTAINS]->(new)'
                                    +'RETURN new'
                                    , {pID: currectProject, tag:tag, description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:[], nino:nino}) /*parent and nino are not necessary*/
                                /*but should be arrays if I use userArray*/

                                .then(function(result){addActivity(result, connectedUser, currectProject, response)}, function (error) {console.log(error);}); //then
                        } else { // ADD ACTIVITY #2 and + || or the ones with parents
                            parent.push(parentTag);
                            neo4j_session
                                .run('MATCH(parent:Activity), (p:Project) '
                                    +'WHERE parent.tag = {parentTag} '
                                    +'AND ID(p)=toInt({pID}) SET parent.nino = {description}'
                                    +'CREATE (new:Activity {tag:{tag}, description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:parent+{parentTag}, nino:{nino}}),(new)-[isChild:DEPENDS_ON]->(parent),(parent)-[isParent:ENABLES]->(new),(p)-[:CONTAINS]->(new)'
                                    +'RETURN new' // todo: no need return the relationships
                                    , {pID : currectProject,tag: tag, description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parentTag:parentTag, nino:nino})

                                .then(function(result){addActivity(result, connectedUser, currectProject, response)}, function (error) {console.log(error);}); //then
                        } // else activity #2

                        // request.flash('success', "Activity added");
                        console.log('success, activity added');

                    } //else





                }//if2
            }//for2
        }//if1
    }//for1
}); //app.post CREATION

function addActivity  (result, user, project, response) {

    result.records.forEach(function (record) {
        newActivity = {
            id: record._fields[0].identity.low
            , tag : record._fields[0].properties.tag
            , description: record._fields[0].properties.description
            , PT: parseFloat(record._fields[0].properties.PT)
            , MLT: parseFloat(record._fields[0].properties.MLT)
            , OT: parseFloat(record._fields[0].properties.OT)
            , ET: record._fields[0].properties.ET
            , parent: record._fields[0].properties.parent
            , nino: record._fields[0].properties.nino
        };
        activities.push(newActivity); //push
    });//forEach

    response.redirect('/'+ user + '/project/' + project);
    neo4j_session.close();
}// addActivity

module.exports = router ;