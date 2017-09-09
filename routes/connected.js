var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();


router.get('/:username', function(request, response, next) {
 username = request.params.username;
 console.log (username);
    neo4j_session
        .run('MATCH (p:Project) RETURN p') //n = all nodes ; p:Project = all projects

        // callback function
        .then(function (result) {

            if (typeof(request.session.activityArray) == 'undefined') {
                request.session.activityArray = [];
                console.log('initialisation... activity count: ' + request.session.activityArray.length)
            }
            next();


            response.render('index', {
                authenticated: authenticated
                , activities: request.session.activityArray,
                activityCount : request.session.activityArray.length,
                user:userArray[lastUser].username, projects:userArray[lastUser].projects});
            response.json({messa : 'connected'});

        }, function (error) {
            console.log(error)
        })
}); //router.get



module.exports = router;