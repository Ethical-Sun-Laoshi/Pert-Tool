var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
sess   = driver.session();


    router.get('/', function(request, response) {

        sess
            .run('MATCH (n:Activity) RETURN n') //n = all nodes ; n:Activity = all activities

            // callback function
            .then( function(result) {
                /*
                            result.records.forEach(function (record) {
                                request.session.activityArray.push({
                                    id            : record._fields[0].identity.low
                                    , description : record._fields[0].properties.description
                                    , PT          : parseFloat(record._fields[0].properties.PT)
                                    , MLT         : parseFloat(record._fields[0].properties.MLT)
                                    , OT          : parseFloat(record._fields[0].properties.OT)
                                    , ET          : record._fields[0].properties.ET
                                    , parent      : record._fields[0].properties.parent
                                    , nino        : record._fields[0].properties.nino
                                }); //push

                                //console.log('record :');
                                //console.log(record._fields[0].properties);
                            });//forEach
                */

                console.log("size : " + request.session.activityArray.length);
                response.render('index', {activities: request.session.activityArray, activityCount : request.session.activityArray.length});
            })//then


            .catch(function (error) {
                console.log('error : ');
                console.log(error);
            }); // catch


    });//router.get

module.exports = router;