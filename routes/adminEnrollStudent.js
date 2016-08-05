/**
 * Created by Linzi on 05/08/2016.
 */
var express = require('express');
var router = express.Router();
var classesTable = require('../classes.json');
//var html = new EJS({url: 'instructorDashboard.ejs'}).render(data);

/* Get adminClassesCreated page. */
router.get('/', function(req, res){
    res.render('adminEnrollStudent', {
        classes: classesTable

    });
});

module.exports = router;