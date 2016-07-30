/**
 * Created by linzi on 30/07/2016.
 */
var express = require('express');
var router = express.Router();
var classesTable = require('../classes.json');


/* Get instructor-dashboard page. */
router.get('/', function(reg, reg, next){
    reg.render('studentDisplayClasses', {
        header: 'Student Display Classes' ,
        classes: classesTable

    });
});


module.exports = router;