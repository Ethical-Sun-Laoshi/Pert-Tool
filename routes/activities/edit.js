var express = require('express'),
    router = express.Router();

neo4j  = require('neo4j-driver').v1;
driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'));
neo4j_session   = driver.session();

// todo : "parent" and "nino" become collections (cypher: []) to store multiple data
// EDIT ONE ACTIVITY
router.post('/edit', function(request, response, next){
    if (request.body === undefined
        || request.body.actEdit === ''
        || request.body.otEdit  === ''
        || request.body.mltEdit === ''
        || request.body.ptEdit  === '')
    {
        //request.flash('error', "The form is empty");
        console.log('error', "The form is empty");

    }
    else {

        var thisID       = neo4j.int(request.query.activity)
            , actEdit    = request.body.actEdit
            , otEdit     = parseFloat(request.body.otEdit)
            , mltEdit    = parseFloat(request.body.mltEdit)
            , ptEdit     = parseFloat(request.body.ptEdit)
            , etEdit     = ((otEdit+(4*mltEdit)+ptEdit)/6)
            , parentEdit = request.body.parentEdit;

        console.log('the activity selected is the ' +thisID );

        //console.log("body: ");
        console.log(request.body );

        if (request.body.parentEdit === 'none' || request.body.parentEdit == null){ //if there is no parent

            neo4j_session
                .run( 'MATCH (activity:Activity)-[r]-(parent:Activity) WHERE ID(activity) = {id}'
                    + 'SET activity.description = {description},activity.OT ={OT},activity.MLT = {MLT},activity.PT = {PT},activity.ET = {ET},activity.parent = {parent} '
                    + 'SET parent.nino = {nino}'
                    + 'DELETE r'

                    , {id:thisID, description:actEdit, PT:ptEdit, MLT:mltEdit, OT:otEdit, ET:etEdit, nino:'', parent:''}
                    , console.log('edited in neo4j'))
                .then( function (result) {

                    for ( index = 0;  index < request.session.activityArray.length; index ++){

                        console.log('index in activityArray1: '+ index);
                        console.log('id in array: ' + request.session.activityArray[index].id );

                        if ( thisID == request.session.activityArray[index].id ) {
                            console.log('index in activityArray2: '+ index);
                            console.log('ID of activity (neo4j): '+ thisID);
                            console.log('id in activityarray '+ request.session.activityArray[index].id);
                            console.log('before edition');
                            console.log(request.session.activityArray[index]);
                            request.session.activityArray[index].description = actEdit;
                            request.session.activityArray[index].PT          = ptEdit;
                            request.session.activityArray[index].MLT         = mltEdit;
                            request.session.activityArray[index].OT          = otEdit;
                            request.session.activityArray[index].ET          = etEdit;
                            request.session.activityArray[index].parent      = '';
                            request.session.activityArray[index].nino        = '' ;

                            console.log('after edition');
                            console.log(request.session.activityArray[index]);
                        } //if

                    } //for

                    console.log('success, activity edited without parent');
                    response.redirect("/");
                    neo4j_session.close();
                }, function (error) {
                    console.log(error);
                }); //then

        }//if

        else{ // if there is a parent
            neo4j_session
                .run('MATCH (activity:Activity) WHERE ID(activity) = {id}'
                    +'SET activity.description = {description},activity.OT = {OT},activity.MLT = {MLT},activity.PT = {PT},activity.ET = {ET},activity.parent = {parent}'
                    +'MERGE (parent:Activity {description:{parent}})'
                    +'MERGE (activity)-[isChild:DEPENDS_ON]->(parent)'
                    +'MERGE (parent)-[isParent:ENABLES]->(activity)'
                    +'SET parent.nino = {description}'
                    +'RETURN activity,parent,isChild,isParent'
                    , {id:id, description:actEdit, PT:ptEdit, MLT:mltEdit, OT:otEdit, ET:etEdit, parent:parentEdit})

                .then(function(result) {

                    //todo: add in activityArray


                    console.log('edited with parent');
                    response.redirect('/');
                    neo4j_session.close();
                }, function (error) {
                    console.log(error);
                });
        } // else activity #2
    } //else
}); //app.post EDITION

module.exports = router ;