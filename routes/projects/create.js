// --- routes/projects/create.js ---  //

// ** DEPENDENCIES ** //
// > all the modules we need
var router        = require('../../configs/modules').router;
var neo4j_session = require('../../configs/db').neo4j_session;


// ** CONFIGURATION ** //
// - Project List : Create a project - /
router.post('/:username/create',function(request, response){

    // >> Store URL params and user input
    var connectedUser = request.params.username
        , projectName = request.body.projectName;

    // >> Create an empty project with the START and FINISH nodes
    neo4j_session.run( // ** Retrieve the current user
        'MATCH (u:User) WHERE u.username={currentUser}'
        // ** Create a new project , link the project to the user
        +' CREATE (p:Project{name:{projectName}, activityCount:0, variance:0, standardDeviation:0 , duration:0.0001}),(u)-[r:OWNS]->(p),'
        // ** Create START and FINISH endpoints
        +' (start:EndPoint{position:"Start", ES:0, EF:0, LS:0, LF:0 }),'
        +' (finish:EndPoint{position:"Finish", ES:0.0001, EF:0.0001, LS:0.0001, LF:0.0001 }),'
        // ** Link the endpoints to the project
        +' (p)-[:CONTAINS]->(start),(p)-[:CONTAINS]->(finish)'
        // ** Return the project to get its
        +' RETURN p.name AS project, ID(p) AS pID'
        ,{ currentUser: connectedUser, projectName: projectName })

        .then(function(result){
            console.log('**** '+connectedUser+' created the "'+result.records[0].get('project')+'" project');
            // >> Redirect to the project edition page
            response.redirect('/'+ connectedUser + '/project/' + result.records[0].get('pID'));

        },function(error){
            console.log('____ ERROR : CREATING A PROJECT ____');
            console.log(error)
        })//then

});



module.exports = router;