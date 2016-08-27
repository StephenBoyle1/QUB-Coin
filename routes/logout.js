    var express = require('express');
    var router = express.Router();
    var ethAuth = require('../lib/auth.js');
    router.get('/', function (req, res, next) {
        var user = ethAuth.login(req.body.username, req.body.password);
        res.render('logout', {
            header: 'logout'
        });

        req.session.clearCookie();
        req.session = null;
        req.session.authenticatedUser.destroyAll();
        req.session.destroy(function (err) {
                res.status(200).redirect("/logout")
        })
    });