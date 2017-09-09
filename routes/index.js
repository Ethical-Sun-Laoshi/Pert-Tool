var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();


router.get('/', function(request, response) {

    neo4j_session
        //the usernames are unique
        .run('CREATE CONSTRAINT ON (u:User) ASSERT u.username IS UNIQUE')

        // callback function
        .then( function(result) {

            var authenticated = request.isAuthenticated();
            console.log('authenticated: ' + authenticated);

            console.log("size acti : " + request.session.activityArray.length);
            console.log("size user : " + userArray.length);
            response.render('index', {
                authenticated: authenticated,
                activities: request.session.activityArray,
                activityCount: request.session.activityArray.length
            });
        }, function (error) {
            console.log('error : ');
            console.log(error);
        }); // then

});//router.get



module.exports = router;