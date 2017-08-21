
var url = 'http://neo4j:16038943Brookes@localhost:7474';
var neo4j = require('neo4js');

var graphDb = new neo4j.GraphDatabase(url);

var App = require('../server');

app = new App(graphDb);

module.exports = graphDb;