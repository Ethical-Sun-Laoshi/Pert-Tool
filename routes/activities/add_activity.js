var express = require('express')
    , router = express.Router();

neo4j  = require('neo4j-driver').v1
    , driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , neo4j_session   = driver.session();

// todo : "parent" and "nino" become collections (cypher: []) to store multiple data
// ADD ACTIVITIES
router.post('/add', function(request, response) {

    if (request.body === undefined
        || request.body.description === ''
        || request.body.OT === ''
        || request.body.MLT === ''
        || request.body.PT === '')
    {
        //request.flash('error', "The form is empty");
        console.log('error', "The form is empty");

    }
    else {

        var description = request.body.description
            , OT        = parseFloat(request.body.OT)
            , MLT       = parseFloat(request.body.MLT)
            , PT        = parseFloat(request.body.PT)
            , ET        = (OT + (MLT * 4) + PT)/6
            , parent    = request.body.parent
            , nino = '';

        if (request.session.activityArray.length === 0 || request.body.parent === 'none'){ //ADD ACTIVITY #1 || if there is no parent

            neo4j_session
                .run('CREATE (new:Activity {description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:{parent}, nino:{nino}})'
                    +'RETURN new'
                    , {description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:'', nino:nino})


                .then( function (result) {

                    result.records.forEach(function (record) {
                        request.session.activityArray.push({
                            id: record._fields[0].identity.low
                            , description: record._fields[0].properties.description
                            , PT: parseFloat(record._fields[0].properties.PT)
                            , MLT: parseFloat(record._fields[0].properties.MLT)
                            , OT: parseFloat(record._fields[0].properties.OT)
                            , ET: record._fields[0].properties.ET
                            , parent: record._fields[0].properties.parent
                            , nino: record._fields[0].properties.nino
                        }); //push

                        console.log('activity ' + record._fields[0].identity.low + 'was added.');
                        var last = request.session.activityArray.length - 1 ;
                        console.log('activity ' + request.session.activityArray[last]+ 'was added.');
                    });//forEach

                    response.render('index',{user:user.username});
                    neo4j_session.close();
                })
                .catch(function (error) {
                    console.log(error);
                });

        }//if

        else{ // ADD ACTIVITY #2 and + || or the ones with parents
            neo4j_session
                .run('MATCH(parent:Activity) WHERE parent.description = {parent} SET parent.nino = {description}'
                    +'CREATE (new:Activity {description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:{parent}, nino:{nino}}),'
                    +'(new)-[isChild:DEPENDS_ON]->(parent),'
                    +'(parent)-[isParent:ENABLES]->(new)'
                    +'RETURN new, parent, isChild'
                    , {description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:parent, nino:nino})

                .then( function (result) {

                    result.records.forEach(function (record) {
                        request.session.activityArray.push({
                            id: record._fields[0].identity.low
                            , description: record._fields[0].properties.description
                            , PT: parseFloat(record._fields[0].properties.PT)
                            , MLT: parseFloat(record._fields[0].properties.MLT)
                            , OT: parseFloat(record._fields[0].properties.OT)
                            , ET: record._fields[0].properties.ET
                            , parent: record._fields[0].properties.parent
                            , nino: record._fields[0].properties.nino
                        }); //push

                    });//forEach

                    response.render('index',{user:user.username});
                    neo4j_session.close();
                }, function (error) {
                    console.log(error);
                }); //then
        } // else activity #2


// request.flash('success', "Activity added");
        console.log("body : ");
        console.log(request.body);
        console.log('success, activity added');

//response.redirect("/");

    } //else


}); //app.post CREATION



module.exports = router ;