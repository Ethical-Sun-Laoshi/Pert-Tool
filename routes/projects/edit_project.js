var express = require('express')
    , router = express.Router();

neo4j  = require('neo4j-driver').v1
    , driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , neo4j_session   = driver.session();

// todo : "parent" and "nino" become collections (cypher: []) to store multiple data
// EDIT PROJECT
router.get('/edit/project/', function (request, response) {

neo4j_session.run()
    .then(function(request,response){

    },function(error){
        console.log(error)
    })
});

router.post('/edit/project/', function (request, response) {
    neo4j_session.run()
        .then(function(request,response){

        },function(error){

        })
});

module.exports = router;