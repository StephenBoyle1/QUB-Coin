/**
 * Created by Stephen on 08/08/2016.
 */
var express = require('express');
var router = express.Router();

//var html = new EJS({url: 'instructorDashboard.ejs'}).render(data);

/* Get adminClassesCreated page. */
router.get('/', function(req, res){
    res.render('homePage', {


    });
});

module.exports = router;