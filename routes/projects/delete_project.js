var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();

//DELETE ALL THE PROJECT
router.get('/erase', function(request, response) {

    neo4j_session
        .run('MATCH (n) DETACH DELETE n') //todo : this project belonging to this user


        .then( function(result) {

            request.session.activityArray = [];
            console.log('Project erased...');
            response.redirect('/');

        },function (error) {
            console.log(error);
        });

});//app.get DELETION

module.exports = router ;