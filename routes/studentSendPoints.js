/**
 * Created by linzi on 26/07/2016.
 */
var express = require('express');
var router = express.Router();
var inst = require('../instructor.json');


/* Get instructor-dashboard page. */
router.get('/', function(req, res, next){
    res.render('studentSendPoints', {
        header: 'Student Send Points' ,
        instructor: inst

    });
});


module.exports = router;