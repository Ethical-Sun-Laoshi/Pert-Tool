// --- routes/activities/edit.js ---  //

/* ! NOT IN USE !*/
/* TODO : EDIT AN ACTIVITY */

// / ** DEPENDENCIES ** //
// > all the modules we need
var router        = require('../../configs/modules').router;
var neo4j_session = require('../../configs/db').neo4j_session;

// ** CONFIGURATION ** //
// - Activity List : Activity Edition - /
router.post(':username/project/:projectID/activity/:activityID/edit', function(request, response){

    // Store URL params
    var username = request.params.username
        , projectID  = parseInt(request.params.projectID)
        , activityID = parseInt(request.params.activityID);

    // >> If the body is empty ...
    if (request.body === undefined
            // >> ... or one of the required fields
        || request.body.actEdit === ''  || request.body.otEdit  === ''
        || request.body.mltEdit === ''  || request.body.ptEdit  === '')
    {
        console.log('error', "The form is empty");
    }
    // >> Else
    else {

        // >> Store the user inputs and make calculations
        var thisID       = neo4j.int(request.query.activity)
            , actEdit    = request.body.actEdit
            , otEdit     = parseFloat(request.body.otEdit)
            , mltEdit    = parseFloat(request.body.mltEdit)
            , ptEdit     = parseFloat(request.body.ptEdit)
            , etEdit     = ((otEdit+(4*mltEdit)+ptEdit)/6)
            , variance   = Math.pow(((ptEdit - otEdit)/6),2)
            , parentEdit = request.body.parentEdit;

        console.log('the activity selected is the ' + thisID );
        console.log(request.body );

        // See : add activity --> predecessors
        // ../../views/activity/edit.pug --> predecessors : select-multiple with not inferior activities (lower ID)
        // Todo : change the relationships
        // See : add activity --> updateNetwork(projectID)



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