var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();

//DELETE ALL THE PROJECT
router.post('/:user/project/:projectID/delete', function(request, response) {

    var user             = request.params.user
        ,projectToDelete = request.params.projectID;

    neo4j_session
        .run('MATCH (p:Project) WHERE ID(p)=toInt({projectID}) DETACH DELETE p', {projectID:projectToDelete})

        .then( function() {

            console.log('Project erased...');
            response.redirect('/'+user+'/dashboard');

        },function (error) {
            console.log(error);
        });

});//router.post DELETION

module.exports = router ;