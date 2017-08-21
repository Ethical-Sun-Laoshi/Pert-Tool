var express = require('express')
    //, app   = express()
    , router  = express.Router();
var apoc        = require ('apoc')
    , controller  = require('../controllers/controller');

//check if the application is responding
var isLogged = function (request, response, next){
    console.log('LOGGED');
    next()
};
router.use(isLogged);


router.route("/otherfunction")
    .get(controller.otherfunction);

module.exports = router;