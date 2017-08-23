var router = require('express').Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
sess   = driver.session();

var activityArray = [];

module.exports = index = function () {

    router.get('/', function(request, response) {
        sess
            .run('MATCH (n:Activity) RETURN n LIMIT 25') //n = all nodes ; n:Activity = all activities

            // callback function
            .then( function(result) {

                //var activityArray = []

                result.records.forEach(function (record) {
                    activityArray.push({
                        id            : record._fields[0].identity.low
                        , description : record._fields[0].properties.description
                        , PT          : parseFloat(record._fields[0].properties.PT)
                        , MLT         : parseFloat(record._fields[0].properties.MLT)
                        , OT          : parseFloat(record._fields[0].properties.OT)
                        , ET          : record._fields[0].properties.ET
                        , parent      : record._fields[0].properties.parent
                        , nino        : record._fields[0].properties.nino
                    }); //push

                    console.log('record :');
                    console.log(record._fields[0].properties);
                });//forEach

                response.render('./views/index', {activities: activityArray, activityCount : activityArray.length})
            })//then


            .catch(function (error) {
                console.log('error : ');
                console.log(error);
            }); // catch

    });//app.get
};

module.exports = router;