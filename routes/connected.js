var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();


router.get('/:username/dashboard', function(request, response) {
    connectedUser = request.params.username;
    console.log (connectedUser +' is connected');

    neo4j_session
        .run('MATCH (p:Project) RETURN p') //n = all nodes ; p:Project = all projects

        // callback function
        .then(function (result) {
            console.log("size user : " + userArray.length);

            for (var i = 0, len = userArray.length; i < len; i++) {
                var user = userArray[i];
                if (user.username === connectedUser) {
                    response.render('index', {
                        authenticated   : true
                        , projectEdition: false
                        , user          : user.username
                        , projects      : user.projects
                    })}
            }}, function (error) {
            console.log(error)
        })
}); //router.get



module.exports = router;