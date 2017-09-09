var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();

router.post('/create',function(request, response){

    var user = request.session.user
    , projectName = request.body.projectName;

    neo4j_session.run('MATCH (u:User)'
        +'WHERE u.username={currentUser}'
        +'CREATE (p:Project{name:{projectName}),(u)-[r:OWNS]->(p)'
        ,{currentUser: user.username, projectName: projectName })

        .then(function(request,response){
            result.records.forEach(function (record) {
                request.session.userArray.projects.push({
                    id: record._fields[0].identity.low
                    , name: record._fields[0].properties.name
                }); //push

                console.log('project ' + record._fields[0].identity.low + 'was added.');
                var last = request.session.userArray.projects.length - 1 ;
                console.log('activity ' + request.session.userArray.projects[last]+ 'was added.');
            });//forEach

            response.render('index',{user:user.username});
        },function(error){
            console.log(error)
        })
});

module.exports = router;