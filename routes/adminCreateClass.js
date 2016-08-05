/**
 * Created by Stephen on 26/07/2016.
 */
var express = require('express');
var router = express.Router();
var classesTable = require('../classes.json');

/* Get instructor-dashboard page. */
router.get('/', function(req, res, next){
    res.render('adminCreateclass', {
        header: 'adminCreateClass',
        classes: classesTable

    });
});

module.exports = router;