// --- configs/modules.js ---  //
var express         = require('express')
    , app           = express()
    , router        = express.Router()
    , session       = require ('express-session')
    , bcrypt        = require('bcrypt')
    , bodyParser    = require ('body-parser')
    , morgan        = require('morgan');

module.exports.session       = session;
module.exports.router        = router;
module.exports.app           = app;
module.exports.bcrypt        = bcrypt;
module.exports.bodyParser    = bodyParser;
module.exports.morgan        = morgan;
