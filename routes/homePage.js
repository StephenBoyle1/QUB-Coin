/**
 * Created by Stephen on 08/08/2016.
 */
var express = require('express');
var router = express.Router();


/**
 * creating user authenticated so student cannot access the home page without logging in
 */
router.get('/', function (req, res) {
    if (req.session.authenticatedUsername && req.session.authenticatedUsername != '') {


        res.render('homePage', {
            header: 'Home Page',


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