/**
 * Created by Linzi on 28/07/2016.
 */
var express = require('express');
var router = express.Router();
var ethClasses = require('../lib/classes.js');


/* Get adminClassesCreated page. */
router.get('/', function(req, res, next){
    res.render('adminClassesCreated', {
        classes: ethClasses.getAllClasses()
    });
});

module.exports = router;