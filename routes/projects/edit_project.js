var express = require('express')
    , router = express.Router();

neo4j  = require('neo4j-driver').v1
    , driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '16038943Brookes'))
    , neo4j_session   = driver.session();

// EDIT PROJECT
router.get('/:username/project/:projectID', function (request, response) {

    var connectedUser = request.params.username
        , projectID   = parseInt(request.params.projectID)
        , project;

    neo4j_session
        .run('MATCH (a:Activity),(p:Project) '
            + 'WHERE ID(p)=toInt({projectID}) AND (p)-[:CONTAINS]->(a)'
            + 'RETURN a'
            , {projectID : projectID})

        .then(function(result){
            console.log('result: ');
            console.log(result);
            console.log('records');
            console.log(result.records);
            console.log('result.length: ' + result.records.length);
            for (i = 0, lenU = userArray.length; i < lenU; i++) {
                console.log('for running');
                if (userArray[i].username === connectedUser){
                    for (j =0 , lenP = userArray[i].projects.length;  j < lenP; j++) {
                        //console.log(userArray[i].projects);
                        //console.log('type: ' + typeof(j) + ", j: "+j);
                        //console.log(userArray[i].projects[j]);
                        project = userArray[i].projects[j];
                        if ( project.id == projectID ){
                            console.log(true);
                            console.log(userArray[i].projects[j]);
                            console.log('name: '+userArray[i].projects[j].name);
                            console.log( 'name: '+ project.name);

                            if(result.records.length > 0){

                                console.log('*****************record fields: ****************');
                                for (r =0, lenR = result.records.length; r < lenR; r++) {

                                   console.log(result.records[r]._fields);
                                   console.log('///////// TEST');
                                   console.log(result.records[r]._fields[0]);
                                   console.log('///////// title of activity');
                                   console.log(result.records[r]._fields[0].properties.description);
                                }


                                //result.records.forEach(function(record){
                                  //  console.log('record fields:');
                                    //console.log(record._fields);
                                    //console.log('record fields 2:');
                                    //console.log(record._fields[0]);

                                //})
                            }


                            response.render('index',
                                {authenticated      : true
                                    , projectEdition: true
                                    , user          : connectedUser
                                    , project       : project
                                    , activities    : result.records
                                })
                            neo4j_session.close();
                        }// if2
                    } // for2
                } //if1
            } // for1

        }, function(error){console.log(error)});//then

});

module.exports = router;