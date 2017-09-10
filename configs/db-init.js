module.exports = function(request, response, next){


// CREATE ARRAY
    /* If there is no user list, we create an empty one
    app.use(function(request, response, next){
            if (typeof(request.session.userArray) == 'undefined') {
                request.session.userArray = [];
                userArray = request.session.array;
                console.log('initialisation... user count : ' + userArray.length);
                console.log('initialisation... user count : ' + userArray.length);
                return userArray

            }next();
        return userArray;


        });*/

// CREATE USERS
  var user1 = {
        userID     : 10
        , username : 'prothfuss'
        , password : 'pass'
        , projects : [{
            id   : 1
            , name : 'project1'
            , activities:[{
                id : 1
                ,description : "activity 1"
                , OT        : 10
                , MLT       : 20
                , PT        : 30
                , ET        : 20
                , nino      : ""
                , parent    : ""

            }, {
                id : 2
                ,description : "activity 2"
                , OT        : 20
                , MLT       : 30
                , PT        : 40
                , ET        : 30
                , nino      : ""
                , parent    : ""
            }, {
                id : 3
                , description : "activity 3"
                , OT        : 5
                , MLT       : 10
                , PT        : 15
                , ET        : 10
                , nino      : ""
                , parent    : ""
            }]},{
            id   : 2
            , name : 'project2'
            , activities:[{
                id : 4
                ,description : "a 1"
                , OT        : 10
                , MLT       : 20
                , PT        : 30
                , ET        : 20
                , nino      : ""
                , parent    : ""

            }, {
                id : 5
                ,description : "a 2"
                , OT        : 20
                , MLT       : 30
                , PT        : 40
                , ET        : 30
                , nino      : ""
                , parent    : ""
            }, {
                id : 6
                ,description : "a 3"
                , OT        : 5
                , MLT       : 10
                , PT        : 15
                , ET        : 10
                , nino      : ""
                , parent    : ""
            }]}
        ]
    }, user2 = {
        userID     : 11
        , username : 'bbova'
        , password : 'pass'
        , projects : []
    }, user3 = {
        userID     : 12
        , username : 'iamisov'
        , password : 'pass'
        , projects : [{
            id   : 7
            , name : 'new game'
            , activities:[]
        }]
    };

// PUSH USERS IN THE ARRAY
    if (userArray.length === 0) {
        userArray.push(user1);
        console.log('initialisation... user count : ' + userArray.length);
        userArray.push(user2);
        console.log('initialisation... user count : ' + userArray.length);
        userArray.push(user3);
        console.log('initialisation... user count : ' + userArray.length);

        next();}


next()
};