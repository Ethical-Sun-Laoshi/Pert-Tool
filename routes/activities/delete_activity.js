var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();

// DELETE ONE ACTIVITY
router.post('/:user/project/:project/activity/:activity/delete', function(request, response) {

    var user        = request.params.user
        ,project    = request.params.project
        ,activityID = neo4j.int(request.params.activity); // or toInt(jsnumber) in the cypher query

    neo4j_session
        .run('MATCH (a:Activity) WHERE ID(a)={id} DETACH DELETE a', {id:activityID})

        .then( function() {
            console.log('Activity erased...');
            response.redirect('/'+user+'/project/'+ project);
        }); // then

});//app.get DELETION



module.exports = router;