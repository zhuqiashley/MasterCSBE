// Name: index.js
// Desc: Contains database requests for Master CS

var express = require('express');
var router = express.Router();
var mysql = require('../config/config');

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

// Post to Event
router.post('/event', function requestHandler(req,res) {
  mysql.query("INSERT INTO Event (EventTitle, EventDescription, EventInstructor, EventSpots) VALUES (?,?,?,?)", [req.body.EventTitle, req.body.EventDescription, req.body.EventInstructor, req.body.EventSpots ], function (err, rows, fields) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send({message:"success"});
    }

  });
})

// Delete Event
router.delete('/event', function requestHandler(req,res) {
  mysql.query("DELETE FROM Event WHERE EventID = ? ", [req.body.EventID], function (err, rows, fields){
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send({message:"success"});
    }
  });
})

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

// // // Table used for testing purposes only
// router.get('/test', function (req, res) {

//   mysql.query("SELECT * FROM Test", function (err, rows) {
//     if(err) {
//       res.status(500).send(err);
//       return;
//     }

//     if(rows) {
//       res.status(200).send(rows);
//     }

//   });

// });

// // Post to Test
// router.post('/test', function requestHandler(req,res) {
//   mysql.query("INSERT INTO Test (TestSentence) VALUES (?)", [req.body.TestSentence], function (err, rows, fields) {
//     if(err) {
//       res.status(500).send(err);
//       return;
//     }

//     if(rows) {
//       res.status(200).send({message:"success"});
//     }

//   });
// })


module.exports = router;