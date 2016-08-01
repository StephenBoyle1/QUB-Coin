/**
 * Created by Stephen on 27/07/2016.
 */
var express = require('express');
var router = express.Router();
var ethAuth = require('../lib/auth.js');

/* Get instructor-dashboard page. */
router.get('/', function(req, res, next){
    res.render('signup', {
        header: 'signup'

    });
});

router.post('/', function(req, res, next){
  try{
    var newRegisteredAccount = ethAuth.registerUser(req.body.email, req.body.password);
    req.session.authenticatedUser = newRegisteredAccount;
    res.status(201).redirect("/studentViewClass");
  } catch(error){
    console.log("Failed to register new account for [%s], error: %s", req.body.email, error);
    res.status(500).send({status:'Registration failed', reason: error});
  }
});

module.exports = router;
