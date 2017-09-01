var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
sess   = driver.session();

//DELETE ALL THE PROJECT
router.get('/erase', function(request, response, next) {

    sess
        .run('MATCH (n) DETACH DELETE n')


        .then( function(result) {

            request.session.activityArray = [];
            console.log('Project erased. New project ... ');
            response.redirect('/');

        })


        .catch(function (error) {
            console.log(error);
        });

});//app.get DELETION

module.exports = router ;