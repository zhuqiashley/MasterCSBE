// Name: index.js
// Desc: Contains database requests for Master CS

var express = require('express');
var router = express.Router();
var mysql = require('../config/config');

router.use(express.json());

// Acces Events Table
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

// Access User Table
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

router.post('/userpost', function (req , res) {

  let record = {
    /*let firstname = req.body.FirstName

  let lastname = req.body.LastName;
  let role = req.body.Role;
  let Username = req.body.username;
  let Password = req.body.password;*/
    firstname : 'Sam',
    lastname : 'Smith',
    role : 'Student',
    Username : 'samsmith@email.com',
    Password : 'password'
  };

  /*mysql.query("INSERT INTO `User`(`UserID`, `FirstName`, `LastName`, `Role`, `username`, `password`, `BadgeGiven`, `LessonsTaken`, `CoursesTaken`, `QuizesTaken`, `Streaks`, `Points`) VALUES ('firstname',$firstname,'[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]','[value-9]','[value-10]','[value-11]','[value-12]')", function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });*/
  mysql.query('INSERT INTO User SET ?', record, function(error, results, fields) {
    if (error) throw error;
    console.log(results.insertId);
  });

});

//Access Achievements Table
router.get('/achievements', function (req, res) {

  mysql.query("SELECT * FROM Achievements", function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});

// Access Course Completion
router.get('/CourseCompletion', function (req, res) {

  mysql.query("SELECT * FROM CourseCompletion", function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});

// Access Quiz Table
router.get('/quiz', function (req, res) {

  mysql.query("SELECT * FROM Quiz", function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});

// Access Video Completion Table
router.get('/VideoCompletion', function (req, res) {

  mysql.query("SELECT * FROM VideoCompletion", function (err, rows) {
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