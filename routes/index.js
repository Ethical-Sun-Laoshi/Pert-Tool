// --- routes/index.js ---  //

// ** DEPENDENCIES ** //
// > all the modules we need
var router        = require('../configs/modules').router;

// ** CONFIGURATION ** //
// - Home Page - /
router.get('/', function(request, response) {
        response.render('index', {authenticated : false })
    });//router.get

module.exports = router;