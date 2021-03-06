var express = require('express');
var router = express.Router();
var ethClasses = require('../lib/classes.js');

/* Get instructor-dashboard page. */
router.get('/', function (req, res, next) {
    if (req.session.authenticatedUsername && req.session.authenticatedUsername != '') {
        res.render('studentDisplayClasses', {
            header: 'Student Display Classes',
            classes: ethClasses.getClassesFor(req.session.authenticatedUser),
            authenticatedUsername: req.session.authenticatedUsername,
            authenticatedUser: req.session.authenticatedUser
        });
    } else {
        //redirecting to login page if current user is not registered onto the system
        console.log("req.session.User NOT authenticated, redirecting to login");
        res.redirect("login");
    }
});


module.exports = router;
