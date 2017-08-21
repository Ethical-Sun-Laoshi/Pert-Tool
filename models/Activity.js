
var db = require('seraph')('http://localhost:7474');
var model = require('seraph-model');

var Activity = model(db,'activity');

Activity.schema = {
    description : {type: String, required : true},
    OT : {type: Number, min:0, required: true},
    MLT : {type: Number, min:0, required: true},
    PT : {type: Number, min:0, required: true}
    //ET : {type: Number} https://github.com/brikteknologier/seraph-model#computed-fields
};



module.exports = Activity;