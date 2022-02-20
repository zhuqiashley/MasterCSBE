// Name: index.js
// Desc: Contains database requests for Master CS

var express = require('express');
var router = express.Router();
var mysql = require('../config/config');

// Get Cards
router.get('/event', function (req, res) {
    // res.status(200).send({"Success": "Base API"});

    mysql.query("SELECT * FROM Event", function (err, rows) {
        if(err) {
          res.status(500).send(err);
          return;
        }

        if(rows) {
          res.status(200).send(rows);
        }

    });

});

router.get('/user', function (req, res) {

  mysql.query("SELECT * FROM User", function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});


module.exports = router;