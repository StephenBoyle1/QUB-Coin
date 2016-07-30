/**
 * Created by Linzi on 28/07/2016.
 */
var express = require('express');
var router = express.Router();
var classesTable = require('../classes.json');
//var html = new EJS({url: 'instructorDashboard.ejs'}).render(data);

/* Get adminClassesCreated page. */
router.get('/', function(reg, reg, next){
    reg.render('adminClassesCreated', {
        classes: classesTable

    });
});

module.exports = router;