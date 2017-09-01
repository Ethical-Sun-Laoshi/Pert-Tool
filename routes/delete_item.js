var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
sess   = driver.session();

// DELETE ONE ACTIVITY
router.get('/delete', function(request, response) { //todo : url not modified

    var id = neo4j.int(request.query.activity);
    console.log('the activity selected is the ' +id );

    sess
        .run('MATCH (activity:Activity)'
            +'WHERE ID(activity)={id}'
            +'OPTIONAL MATCH (activity)-[relations]-()'
            +'DELETE activity, relations'

            , {id:id}, console.log('done on  neo4j'))

        //todo delete correctly like in edit
        //https://www.w3schools.com/js/tryit.asp?filename=tryjs_array_remove
        .then( function(result) {
            array = [1,2,3,4,5,6,7,8,9];
            console.log("size before delete: " + array.length);

            if (id != ''){
                console.log("the activity to delete is: " + array[id]);
                array.splice(id, 1);
                console.log('activity deleted');
            }

            console.log('size after delete: ' + array.length);
            console.log('array : ' + array);

            /*
            console.log("size before delete: " + request.session.activityArray.length);

            if (id != ''){
                console.log("the activity to delete is: " + request.session.activityArray[id]);
                request.session.activityArray.splice(id, 1);
                console.log('activity deleted');
            }

            console.log('size after delete: ' + request.session.activityArray.length);
            console.log('array : ' + request.session.activityArray);
*/
            response.redirect('/');
        })//then


        .catch(function (error) {
            console.log(error);
        });

});//app.get DELETION



module.exports = router;