// Name: index.js
// Desc: Contains database requests for Master CS
// eslint-disable-next-line no-unused-vars

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

router.get('/getcourses/:Course', function (req, res) {
  // res.status(200).send({"Success": "Base API"});

  mysql.query("SELECT * FROM courses WHERE title = ?",[req.params.Course], function (err, rows) {
      if(err) {
        res.status(500).send(err);
        return;
      }

      if(rows) {
        res.status(200).send(rows);
      }

  });

});

router.get('/getAllcourses', function (req, res) {
  // res.status(200).send({"Success": "Base API"});

  mysql.query("SELECT * FROM courses", function (err, rows) {
      if(err) {
        res.status(500).send(err);
        return;
      }

      if(rows) {
        res.status(200).send(rows);
      }

  });

});

router.get('/getCourseData/:courseID', function (req, res) {
  // res.status(200).send({"Success": "Base API"});

  mysql.query("SELECT course_id, course_completion FROM courseEnrollData where user_id =1 and course_id = ?",[req.params.courseID], function (err, rows) {
      if(err) {
        res.status(500).send(err);
        return;
      }

      if(rows) {
        res.status(200).send(rows);
      }

  });

});


router.get('/getForumData/:courseID', function (req, res) {
  // res.status(200).send({"Success": "Base API"});
  mysql.query("SELECT * FROM Forum where course_id = ? ORDER BY posted_on DESC;",[req.params.courseID], function (err, rows) {
      if(err) {
        res.status(500).send(err);
        return;
      }

      if(rows) {
        res.status(200).send(rows);
      }

  });

});

router.get('/getUserData', function (req, res) {
  mysql.query("SELECT * FROM User where userId =1", function (err, rows) {
      if(err) {
        res.status(500).send(err);
        return;
      }

      if(rows) {
        res.status(200).send(rows);
      }

  });

});

router.get('/getUserEnrolledCourses/:userId', function (req, res) {
  mysql.query("SELECT * FROM courses INNER JOIN courseEnrollData ON courses.id=courseEnrollData.course_id where courseEnrollData.user_id =?",[req.params.userId], function (err, rows) {
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
  mysql.query("INSERT INTO Event (EventTitle, EventDescription, EventInstructor, EventSpots, EventDate) VALUES (?,?,?,?,?)", [req.body.EventTitle, req.body.EventDescription, req.body.EventInstructor, req.body.EventSpots, req.body.EventDate ], function (err, rows, fields) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });
})

// Post to Course
router.get('/enrollUser/:userId/:courseID/:courseCompletion', function requestHandler(req,res) {
  mysql.query("INSERT INTO courseEnrollData (user_id, course_id, course_completion) VALUES (?,?,?)", [req.params.userId, req.params.courseID, req.params.courseCompletion], function (err, rows, fields) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });
})

router.get('/removeEnrolledUser/:userId/:courseID', function requestHandler(req,res) {
  mysql.query("Delete FROM courseEnrollData WHERE user_id=? and course_id=? ", [req.params.userId, req.params.courseID], function (err, rows, fields) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });
})

// Delete Event
router.delete('/event/:EventID', function requestHandler(req,res) {

  console.log(`Deleting event with ID ${req.params.EventID}`)
  mysql.query("DELETE FROM Event WHERE EventID = ? ", [req.params.EventID], function (err, rows, fields){

    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send({message:"success"});
    }
  });

})

//  forum delete 
router.delete('/forum/:forumID', function requestHandler(req,res) {
  mysql.query("DELETE FROM Forum WHERE id = ? ", [req.params.forumID], function (err, rows){

    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send({message:"success"});
    }
  });

})

//  forum delete 
router.delete('/announcment/:id', function requestHandler(req,res) {
  console.log(req.params.id)
  mysql.query("DELETE FROM Announcement WHERE id = ? ", [req.params.id], function (err, rows){

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

router.post('/userpost', function (req , res) {

  //let firstname;
  let record = {
    firstname : req.body.FirstName,
    lastname : req.body.LastName,
    //role : req.body.Role,
    Username : req.body.username,
    Password : req.body.password
    /*firstname : 'Sam',
    lastname : 'Smith',
    role : 'Student',
    Username : 'johnsmith@email.com',
    Password : 'password'*/
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
  mysql.query('INSERT INTO User SET ?', record, function(error, results) {
    if (error) throw error;
    console.log(results.insertId);
  });

});

/*router.post('/user', function requestHandler(req,res) {
  mysql.query("INSERT INTO User (FirstName, LastName, username, password) VALUES (?,?,?,?)", [req.body.FirstName, req.body.LastName, req.body.username, req.body.password ], function (err, rows, fields) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send({message:"success"});
    }

  });
})*/

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

  mysql.query("SELECT * FROM Quiz WHERE CourceId", function (err, rows) {
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

//Access User Events Table
router.get('/UserEvents', function (req, res) {

  mysql.query("SELECT * FROM UserEvents", function (err, rows) {
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

router.post('/forum/add', function (req , res) {
  try {
    //let firstname;
    let record = {
      course_id : req.body.course_id,
      user_id : req.body.user_id,
      //role : req.body.Role,
      question : req.body.title,
      forum_src : req.body.forum_src,
      posted_on: new Date(),
    };
  
    mysql.query('INSERT INTO Forum SET ?', record, function(error, results, fields) {
      if (error) throw error;
      res.status(200).send(results);
    });
  } catch (error) {
    console.log(error);
  }

});

router.post('/announcment/add', async function (req , res) {
  try {
    //let firstname;
    console.log(req)

    let record = {
      course_id : req.body.course_id,
      user_id : req.body.user_id,
      title : req.body.title,
      img_src : req.body.img_src,
      description: req.body.description,
      posted_on: new Date(),
    };
  
    mysql.query('INSERT INTO Announcement SET ?', record, function(error, results, fields) {
      if (error) throw error;
      res.status(200).send(results);
    });
  } catch (error) {
    console.log(error);
  }

});

router.get('/getAnnouncments/:courseID', function (req, res) {
  // res.status(200).send({"Success": "Base API"});
  mysql.query("SELECT * FROM Announcement where course_id = ? ORDER BY posted_on DESC;",[req.params.courseID], function (err, rows) {
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