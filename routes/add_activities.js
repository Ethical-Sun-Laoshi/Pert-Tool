var router = require('express').Router();

neo4j  = require('neo4j-driver').v1,
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes')),
sess   = driver.session();

var activityArray = [];


// ADD ACTIVITY #1
module.exports = activity_one = function () {

    router.post('/', function(request, response) {

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
                , parent    = ""
                , nino      = "";


            // session adding activity in database
            sess
                .run('CREATE (new:Activity {description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:{parent}, Nino:{nino}})'
                    + 'RETURN new'
                    , {description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:parent, nino:nino})


                .then(function (result) {
                    response.redirect('/');
                    sess.close();
                })


                .catch(function (error) {
                    console.log(error);
                });

            // request.flash('success', "Activity added");
            console.log("body : ");
            console.log(request.body);
            console.log('success, activity added');

            response.redirect("/");

        } //else
    }); //app.post CREATION

};

// ADD ACTIVITY #2 and +
module.exports = add_activity = function() {

    router.post('/', function(request, response) {

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
                , parent
                , nino ='';

            if (request.body.parent === ''){
                parent   = '';
            }else if (request.body.parent){
                parent = request.body.parent;
            };


            // session  for add activity in database
            sess
                .run('MATCH(parent:Activity) WHERE parent.description = {parent} SET parent.nino = {description}'
                    +'CREATE (new:Activity {description:{description}, PT:{PT}, MLT:{MLT}, OT:{OT}, ET:{ET}, parent:{parent}, Nino:{nino}}),'
                    +'(new)-[isChild:DEPENDS_ON]->(parent),'
                    +'(parent)-[isParent:ENABLES]->(new)'
                    +'RETURN new, parent, isChild'
                    , {description:description, PT:PT, MLT:MLT, OT:OT, ET:ET, parent:parent, nino:nino})
                .then(function (result) {
                    response.redirect('/');
                    sess.close();
                })
                .catch(function (error) {
                    console.log(error);
                });

            // request.flash('success', "Activity added");
            console.log("body : ");
            console.log(request.body);
            console.log('success, activity added');

            response.redirect("/");

        } //else
    }); //app.post CREATION
};

module.exports = router;