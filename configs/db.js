// --- configs/db.js ---  //

// Neo4j database
// ** CONFIGURATION ** //
var  neo4j          = require('neo4j-driver').v1
    , driver        = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'p@ssw0rd'))
    , neo4j_session = driver.session();

module.exports.neo4j_session = neo4j_session;



