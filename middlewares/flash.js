module.exports = function(request, response, next ) {

   if(request.session.flash){
       response.locals.flash = request.session.flash;
       request.session.flash = undefined;
   }


    request.flash = function (type, content) {
        if(request.session.flash === undefined){
            request.session.flash = {}
        }
        request.session.flash[type] = content
    };
        next()
};





/*
routes
app.get('/',function(request, response) {
    if(request.session.error){
        console.log(request.session.error);
        response.locals.error = request.session.error;
        request.session.error = undefined
    }

    response.render('index')
});






app.post('/', upload.fields(), function(request,response) {

    if (request.body === undefined
        || request.body.description === ''
        || request.body.OT === ''
        || request.body.MLT === ''
        || request.body.PT === '')
    {
        request.session.error = "The form is empty";
        response.redirect('/')
    }
    else {
        var Activity = require('./models/Activity');
         Activity.create(request.body.description, function () {
        console.log(request.body);
        })
        response.json(request.body);
    }})

    */