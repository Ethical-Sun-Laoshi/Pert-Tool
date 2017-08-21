var MyApp, express;

express = require('express');

module.exports = MyApp = (function() {
    function MyApp(graphDb1) {
        var app, graphDb, indexPromise, port;
        this.graphDb = graphDb1;
        graphDb = this.graphDb;
        app = express.createServer(express.logger());
        app.configure(function() {
            app.set('views', __dirname + '/public');
            app.set('view options', {
                layout: false
            });
            app.use(express.methodOverride());
            app.use(express.bodyParser());
            return app.use(app.router);
        });
        indexPromise = graphDb.index.createNodeIndex("myIndex");
        indexPromise.then(function(index) {
            app.get('/', function(request, response) {
                return index.query("name:*").then(function(nodes) {
                    return response.render('index.jade', {
                        nodes: nodes
                    });
                });
            });
            return app.post('/', function(request, response) {
                var name, node;
                name = request.body.name;
                node = graphDb.node({
                    name: name
                });
                return index.index(node, "name", name).then(function() {
                    return response.redirect("/");
                });
            });
        });
        port = process.env.PORT || 3000;
        app.listen(port, function() {
            return console.log("Listening on " + port);
        });
    }

    return MyApp;

})();