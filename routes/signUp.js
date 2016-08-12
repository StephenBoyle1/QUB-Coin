/**
 * Created by Stephen on 27/07/2016.
 */
var express = require('express');
var router = express.Router();
var ethAuth = require('../lib/auth.js');

/* Get instructor-dashboard page. */
router.get('/', function(req, res, next){
    res.render('signUp', {
        header: 'signUp'
    });
});

router.post('/', function(req, res, next){
    try{
        ethAuth.registerUser(req.body.name, req.body.email, req.body.password, true, function(error, newRegisteredAccount){
            if(error){
                console.log("Failed to register new user=" + error);
                res.status(500).send({status:'Registration failed', reason: error});
            } else{
                console.log("newRegisteredAccount=[%j]", newRegisteredAccount);
                req.session.authenticatedUser = newRegisteredAccount;
                req.session.authenticatedUsername = newRegisteredAccount.email;
                res.status(201).redirect("/studentWallet");
            }
        });
    } catch(error){
        console.log("Failed to register new account for [%s], error: %s", req.body.email, error);
        res.status(500).send({status:'Registration failed', reason: error});
    }
});

module.exports = router;
