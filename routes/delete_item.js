var router = require('express').Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
sess   = driver.session();

var activityArray = [];


module.exports = delete_item =

    router.get('/delete', function(request, response) { //todo : url not modified

        var description = request.query.activity;
        console.log(description);

        sess
            .run('MATCH (activity)-[relations]-()'
                +'WHERE activity.description = {description}'
                +'DELETE activity, relations'
                , {description:description})


            .then( function(result) {
                var temp = activityArray.filter(function(value,index, array){

                    if (value.description === description)
                    { return false;}
                    return true;
                });

                activityArray = temp;

                response.redirect('/');
                //response.render('index', {activities: activityArray, activityCount : activityArray.length})
            })//then


            .catch(function (error) {
                console.log(error);
            });

    });//app.get DELETION



module.exports = router;