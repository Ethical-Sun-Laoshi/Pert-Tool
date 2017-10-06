// --- routes/projects/delete.js ---  //

/* ! NOT USED ! */

// ** DEPENDENCIES ** //
// > all the modules we need
var router        = require('../../configs/modules').router;
var neo4j_session = require('../../configs/db').neo4j_session;

// ** CONFIGURATION ** //
// - Project List : Delete the project - /
router.post('/:user/project/:projectID/delete', function(request, response) {

    // >> Store URL params
    var user             = request.params.user
        ,projectToDelete = request.params.projectID;

    neo4j_session
        // ** Retrieve the current project and delete it with all its relationships and all "inferior" nodes
        .run('MATCH path=(p:Project)-->() WHERE ID(p)=toInteger({projectID}) DETACH DELETE path', {projectID:projectToDelete})
        .then( function() {
            console.log('Project erased...');
            // >> Return to user dashboard
            response.redirect('/'+user+'/dashboard');

        },function (error) {
            console.log(error);
        });

});//router.post DELETION

module.exports = router ;