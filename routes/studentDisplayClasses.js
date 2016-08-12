/**
 * Created by linzi on 30/07/2016.
 */
var express = require('express');
var router = express.Router();
var ethClasses = require('../lib/classes.js');

/* Get instructor-dashboard page. */
router.get('/', function(req, res, next){
    res.render('studentDisplayClasses', {
        header: 'Student Display Classes' ,
        // TODO: re-enable the getClassesFor(user) once the enrollment is working
        // classes: ethClasses.getClassesFor(req.session.authenticatedUser)
        classes: ethClasses.getAllClasses()
    });
});


module.exports = router;
