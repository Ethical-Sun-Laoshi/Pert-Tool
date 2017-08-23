var router = require('express').Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
sess   = driver.session();

var activityArray = [];

module.exports = delete_all = function () {

    router.get('/eraseproject', function(request, response) { //todo : url not modified

        sess
            .run('MATCH (n) DETACH DELETE n')


            .then( function(result) {
                //var empty = [];
                //activityArray = empty;

                activityArray = [];

                response.redirect('/');
                //response.render('index', {activities: activityArray, activityCount : activityArray.length})
            })


            .catch(function (error) {
                console.log(error);
            });

    });//app.get DELETION
};

module.exports = router;