var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();


router.get('/', function(request, response) {
        response.render('index', {authenticated : false })
    });//router.get

module.exports = router;