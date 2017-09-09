//*************************
//***** CONFIGURATION *****
//*************************

// Dependences
var express  = require('express')
    , router = express.Router();

// Call of the controllers
var project_controller    = require ('../routes/projects')
    , activity_controller = require ('../routes/activities')
    , index               = require ('../routes/index');

