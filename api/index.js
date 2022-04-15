// Name: index.js
// Desc: Contains database requests for Master CS
// eslint-disable-next-line no-unused-vars

var express = require('express');
var router = express.Router();
var mysql = require('../config/config');

router.use(express.json());



// Access Events Table
router.get('/event', function (req, res) {
    // res.status(200).send({"Success": "Base API"});
    const today = new Date();
    mysql.query("SELECT * FROM Event ORDER BY EventDate DESC", async function (err, rows) {
        if(err) {
          res.status(500).send(err);
          return;
        }
  
      mysql.query("SELECT EventID, Tag FROM EventTag", function (err, tags) {
        if(err) {
            res.status(500).send(err);
            return;
        }
  
        mysql.query("SELECT EventID, User.FirstName, User.LastName FROM UserEvents LEFT JOIN User ON User.UserID = UserEvents.UserID", function (err, users) {
          if(err) {
              res.status(500).send(err);
              return;
          }
          
          if(rows) {
            // Return Upcoming Events and Past Events based on EventDate
            const upcomingEvents = [];
            const pastEvents = [];
  
            for(let i = 0; i < rows.length; i++) {
              rows[i].EventTags = tags.filter(tag => tag.EventID === rows[i].EventID);
              rows[i].Attendees = users.filter(user => user.EventID === rows[i].EventID);
  
              if(rows[i].EventDate > today) {
                upcomingEvents.push(rows[i]);
              }
              else {
                pastEvents.push(rows[i]);
              }
            }
  
            // Order Upcoming Events by EventDate nearest to current date
            upcomingEvents.sort(function(a, b) {
              return new Date(a.EventDate) - new Date(b.EventDate);
            });
  
            // Count total per tag
            const tagCount = {};
            for(let i = 0; i < tags.length; i++) {
              if(!tagCount[tags[i].Tag]) {
                tagCount[tags[i].Tag] = 1;
              }
              else {
                tagCount[tags[i].Tag]++;
              }
            }
            
            res.status(200).send({"upcomingEvents": upcomingEvents, "pastEvents": pastEvents});
          }
        });
      });
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
      
   if (rows){
      const EventID = rows.insertId;
      // Add Tags to Tags Table
      var tags = req.body.EventTags;
      for(var i = 0; i < tags.length; i++) {
        mysql.query("INSERT INTO EventTag (Tag, EventID) VALUES (?, ?)", [tags[i], EventID], function (err, rows, fields) {
          if(err) {
            res.status(500).send(err);
            return;
          }
        });
      }

      if(rows) {
        res.status(200).send(rows);
      }
    }

  });
})

// Add user registration
router.post('/event/register', function requestHandler(req, res) {
  mysql.query("INSERT INTO UserEvents (UserID, EventID) VALUES (?, ?)", [req.body.UserID, req.body.EventID], function (err, rows, fields) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }
  });
});

// Remove user registration
router.delete('/event/register/:eventid/:userid', function requestHandler(req, res) {
  mysql.query("DELETE FROM UserEvents WHERE UserID = ? AND EventID = ?", [req.params.userid, req.params.eventid], function (err, rows, fields) {
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

// Update Event
router.put('/event/:id', function requestHandler(req,res) {
  mysql.query("UPDATE Event SET EventTitle = ?, EventDescription = ?, EventInstructor = ?, EventSpots = ?, EventDate = ? WHERE EventID = ?", [req.body.EventTitle, req.body.EventDescription, req.body.EventInstructor, req.body.EventSpots, req.body.EventDate, req.params.id ], function (err, rows, fields) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    // Delete tags from event (will eventually replace with deleting individual tags)
    mysql.query("DELETE FROM EventTag WHERE EventID = ?", [req.params.id], function (err, deletedRows, fields) {
      if(err) {
        res.status(500).send(err);
        return;
      }

      // Add tags to event
      var tags = req.body.EventTags;
      for(var i = 0; i < tags.length; i++) {
        mysql.query("INSERT INTO EventTag (Tag, EventID) VALUES (?, ?)", [tags[i], req.params.id], function (err, rows, fields) {
          if(err) {
            res.status(500).send(err);
            return;
          }
        });
      }

      if(rows) {
        res.status(200).send(rows);
      }
    });
  });
});

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

    mysql.query("DELETE FROM Event WHERE EventID = ? ", [req.params.EventID], function (err, rows, fields){
      if(err) {
        res.status(500).send(err);
        return;
      }

      if(rows) {
        // Delete Tags from Tags Table
        mysql.query("DELETE FROM EventTag WHERE EventID = ?", [req.params.EventID], function (err, rows, fields) {
          if(err) {
            res.status(500).send(err);
            return;
          }

          res.status(200).send({message:"success"});
        });
      }
    });
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