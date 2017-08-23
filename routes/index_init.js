var router = require('express').Router();
neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
sess   = driver.session();

var activityArray = [];

module.exports = router;