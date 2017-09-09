var db      = require('../configs/db'),
    User    = require('seraph-model')(db,'user'); //we create the user model

User.Schema = {
    username : {
        type     : String,
        required : true
    }
    , password : {
        type     : String,
        required : true
    }
};


var userArray = [
    {id:01, username: 'jack', password: 'secret' }
    , {id:02, username: 'jill', password: 'birthday' }
];

exports.findById = function(id, cb) {
    process.nextTick(function() {
        var idx = id - 1;
        if (userArray[idx]) {
            cb(null, userArray[idx]);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
    });
}

exports.findByUsername = function(username,cb) {
    process.nextTick(function() {
        for (var i = 0, len = userArray.length; i < len; i++) {
            var record = userArray[i];
            if (record.username === username) {
                return cb(null, record);
            }
        }
    });
}