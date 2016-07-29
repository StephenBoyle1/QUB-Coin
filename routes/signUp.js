/**
 * Created by Stephen on 27/07/2016.
 */
var express = require('express');
var router = express.Router();
//var html = new EJS({url: 'instructorDashboard.ejs'}).render(data);

/* Get instructor-dashboard page. */
router.get('/', function(reg, reg, next){
    reg.render('signup', {
        header: 'signup'

    });
});

module.exports = router;