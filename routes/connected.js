// --- routes/connected.js ---  //

// ** DEPENDENCIES ** //
// > all the modules we need
var router        = require('../configs/modules').router;
var neo4j_session = require('../configs/db').neo4j_session;


// ** CONFIGURATION ** //
// - User Dashboard - /
// >> Show all the projects of the user and enable project creation
router.get('/:username/dashboard', function(request, response) {

    // > recognise the user
    connectedUser = request.params.username;

    neo4j_session
    // >> Retrieve and return all the projects of the current user
        .run('MATCH (u:User{username:{currentUser}})'
            +'OPTIONAL MATCH (u)-[:OWNS]->(p:Project) '
            +'RETURN u, collect(p) AS projects, size(collect(p)) AS projectCount'
            , {currentUser: connectedUser})

        .then(function (result) {

            // >> If there are results
            if (result.records.length > 0) {
                // >> And if the connected user exists
                if (connectedUser === result.records[0].get('u').properties.username) {
                    // >> Display the Home page with unlocked element
                    response.render('index', {
                        authenticated   : true
                        , projectEdition: false
                        , user          : result.records[0].get('u').properties.username
                        , projects      : result.records[0].get('projects')
                        , projectCount  : parseInt(result.records[0].get('projectCount'))
                    })
                }//if2

            } else {

                response.render('index', {
                    authenticated   : true
                    , projectEdition: false
                    , user          : result.records[0].get('u').properties.username
                    , projects      : [properties ={name : ''}]
                    , projectCount  : 0})

            }// if1

        }, function (error) {
            console.log(error)
        })
}); //router.get



module.exports = router;