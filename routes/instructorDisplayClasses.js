/**
 * Created by linzi on 09/09/2016.
 */
var express = require('express');
var router = express.Router();
var classesTable = require('../classes.json');


/* Get instructor-dashboard page. */
router.get('/', function(req, res){
    res.render('instructorDisplayClasses', {
        header: 'Instructor Classes' ,
        classes: classesTable

    });
});


module.exports = router;