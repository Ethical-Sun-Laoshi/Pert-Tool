var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();

router.post('/:username/create',function(request, response, next){

    var connectedUser = request.params.username
        , connectedUserIndex
        , projectName = request.body.projectName;

    for (i = 0, len = userArray.length; i < len; i++)
    {
        var record = userArray[i];
        if (record.username === connectedUser){

            connectedUserIndex = i;

            neo4j_session.run('MATCH (u:User)'
                +'WHERE u.username={currentUser}'
                +'CREATE (p:Project{name:{projectName}}),(u)-[r:OWNS]->(p)'
                +'RETURN p'
                ,{ currentUser: connectedUser, projectName: projectName })

                .then(function(result){

                    var newProject;

                    result.records.forEach(function (record) {

                        newProject = {
                            id           : record._fields[0].identity.low
                            , name       : record._fields[0].properties.name
                            , activities : []
                        };
                        userArray[connectedUserIndex].projects.push(newProject); //push

                        console.log('project ' + record._fields[0].identity.low + ' was added.');
                        console.log ('newProject ' + newProject.name + ' was added');
                    console.log(userArray[connectedUserIndex]);
                    });//forEach

                    response.redirect('/'+ connectedUser + '/project/' + newProject.id);

                },function(error){
                    console.log(error)
                })//then
        }//if
    }//for
});



module.exports = router;