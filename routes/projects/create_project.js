var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();

router.post('/:username/create',function(request, response, next){

    var connectedUser = request.params.username
        , projectName = request.body.projectName;

    neo4j_session.run('MATCH (u:User)'
        +'WHERE u.username={currentUser}'
        +'CREATE (p:Project{name:{projectName}}),(u)-[r:OWNS]->(p), (start:Activity{tag:"start", description:"start", ET:0 }), ('
        +'RETURN p'
        ,{ currentUser: connectedUser, projectName: projectName })

        .then(function(result){
            console.log("******* PROJECT CREATED *****");
            response.redirect('/'+ connectedUser + '/project/' + result.records[0].get('p').identity.low);

        },function(error){
            console.log(error)
        })//then

});



module.exports = router;