// --- routes/activities/delete.js ---  //

/* ! NOT IN USE !*/


// ** DEPENDENCIES ** //
// > all the modules we need
var router        = require('../../configs/modules').router;
var neo4j_session = require('../../configs/db').neo4j_session;

// ** CONFIGURATION ** //

/* TODO : DELETE AN ACTIVITY */
// - Activity List : Delete an activity - /
router.post('/:user/project/:project/activity/:activity/delete', function(request, response) {

    // >> Store the URL parameters
    var user        = request.params.user
        ,project    = request.params.project
        ,activityID = neo4j.int(request.params.activity); // or toInt({JSnumber}) in the cypher query

    neo4j_session
        .run(// ** Select the current activity
            'MATCH (a:Activity) WHERE ID(a)={id}'
            // ** Delete the activity and all the relative relationships
            +' DETACH DELETE a'
            , {id:activityID})

        .then( function() {
                console.log('Activity '+activityID+' erased...');
                response.redirect('/'+user+'/project/'+ project);
            }
            ,function (error) {
                console.log('____ ERROR : ACTIVITY DELETION ____');
                console.log(error);}
        ); // then

    // Todo : change the relationships
    // See : add activity --> updateNetwork(projectID)

});//router.post DELETE ONE

/* TODO : DELETE ALL ACTIVITIES*/
router.post('/:user/project/:project/activities/delete', function(request, response){
    // >> Store URL params
    var user             = request.params.user
        ,project         = request.params.projectID;

    neo4j_session
    // ** Retrieve the current project and delete it with all its relationships and all "inferior" nodes
        .run('MATCH (p:Project)-->(a:Activity) WHERE ID(p)=toInteger({projectID}) DETACH DELETE a', {projectID:project})
        .then( function() {
            console.log('Activities erased...');
            // >> Return to project edition
            response.redirect('/'+user+'/project/'+project);
        },function (error) {
            console.log(error);
        });
}); //router.post DELETE ALL

module.exports = router;