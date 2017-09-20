// ** DEPENDENCIES ** //
// > all the modules we need
var express = require('express')
    , router = express.Router()
    , neo4j  = require('neo4j-driver').v1
    , driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , neo4j_session   = driver.session();


// ** CONFIGURATION ** //
// - User Dashboard - /
// > will show all the projects of the user and enable project creation
router.get('/:username/dashboard', function(request, response) {

    // > recognise the user
    connectedUser = request.params.username;

    neo4j_session
    // > we retrieve and return all the projects of the current user
    //    {currentUser}
        .run('MATCH (u:User{username:{currentUser}})'
            +'OPTIONAL MATCH r=(u)-[:OWNS]->(p:Project) '
            +'RETURN u, collect(p), size(collect(p)) as projectCount'
            , {currentUser: connectedUser})

        // > the result is u and p
        .then(function (result) {

            if (result.records.length > 0) {
                if (connectedUser === result.records[0].get('u').properties.username) {
                    response.render('index', {
                        authenticated: true
                        , projectEdition: false
                        , user: result.records[0].get('u').properties.username
                        , projects: result.records[0].get('collect(p)')
                        , projectCount : result.records[0].get('projectCount')
                    })
                }//if2

            } else {
                response.render('index', {
                    authenticated: true
                    , projectEdition: false
                    , user: result.records[0].get('u').properties.username
                    , projects : [properties ={name : ''}]})
            }// if1

        }, function (error) {
            console.log(error)
        })
}); //router.get



module.exports = router;