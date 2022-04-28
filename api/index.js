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
  
        mysql.query("SELECT UserEvents.UserID, EventID, User.FirstName, User.LastName FROM UserEvents LEFT JOIN User ON User.UserID = UserEvents.UserID", function (err, users) {
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
      console.log(req.body.UserID)
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
      console.log(req.params.userid)
    }
  });
});

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
router.get('/userwithoutid', function (req, res) {

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

// Get user object - I'm using this mainly for roles - kg
router.get('/user/:id', function (req, res) {
  const id = req.params.id;
  
  mysql.query("SELECT UserID, FirstName, LastName, username, UserImage, Role FROM User WHERE UserID = ? ", [ id ], function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows[0]);
    }

  });

});


//
//get all fields of user, used for profile
router.get('/userprofile/:id', function (req, res) {
  const id = req.params.id;
  
  mysql.query("SELECT * FROM User WHERE UserID = ? ", [ id ], function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows[0]);
    }

  });

});

//get user profile by name, for login
router.get('/userlogin/:username', function (req, res) {
  const username = req.params.username;
  
  mysql.query("SELECT * FROM User WHERE username = ? ", [ username ], function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows[0]);
    }

  });

});


//get all quiz scores for a user, used for statistics
router.get('/quizscoreswithid/:id', function (req, res) {
  const id = req.params.id;
  
  mysql.query("SELECT * FROM QuizScores WHERE UserID = ? ", [ id ], function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});

router.get('/introresult/:id', function (req, res) {
  const id = req.params.id;
  
  mysql.query("SELECT * FROM IntroQuizResult WHERE UserID = ? ", [ id ], function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows[0]);
    }

  });

});


//course completion
router.get('/coursecompletionwithid/:id', function (req, res) {
  const id = req.params.id;
  
  mysql.query("SELECT * FROM CourseCompletion WHERE UserID = ? ", [ id ], function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});

//video completion
router.get('/videocompletionwithid/:id', function (req, res) {
  const id = req.params.id;
  
  mysql.query("SELECT * FROM VideoCompletion WHERE UserID = ? ", [ id ], function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});

router.get('/eventwithid', function (req, res) {
  const id = req.params.id;
  
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

router.get('/usereventwithid/:id', function (req, res) {
  const id = req.params.id;
  
  mysql.query("SELECT * FROM UserEvents WHERE UserID = ? ", [ id ], function (err, rows) {
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
    Username : req.body.username,
    Password : req.body.password,
    Role : req.body.role,
    SecurityQuestion : req.body.SecurityQuestion,
    SecurityAnswer : req.body.SecurityAnswer
  };

  mysql.query('INSERT INTO User SET ?', record, function(error, results, fields) {
    if (error) throw error;
    console.log(results.insertId);
  });

});


//Edit User Profile
router.put('/useredit', function (req , res) {

  let firstname = req.body.FirstName
  let lastname = req.body.LastName
  let Username = req.body.username
  let id = req.body.id;
  //console.log(id);

    mysql.query("UPDATE User SET FirstName = ?, LastName = ?, username = ? WHERE UserID = ?", [firstname, lastname, Username, id], function (err, rows, fields) {
      if(err) {
        console.log(id);
        res.status(500).send(err);
        return;
      }
  })

});

//change password
router.put('/changepassword', function (req , res) {

  let password = req.body.Password;
  let id = req.body.id;
  //console.log(id);

    mysql.query("UPDATE User SET password = ? WHERE UserID = ?", [password, id], function (err, rows, fields) {
      if(err) {
        console.log(id);
        res.status(500).send(err);
        return;
      }
  })

});

//Access Achievements Table
router.get('/achievements', function (req, res) {});
// Access CourseCompletion table to post COUNT() to QuizesTaken in User table
router.post('/user', function (req, res) {

  mysql.query("INSERT INTO User(QuizesTaken) VALUES ((SELECT COUNT(QuizComplete) FROM CourseCompletion))", function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});

// Access CourseComplettion table to post COUNT() to CoursesTaken in User table
router.post('/user', function (req, res) {

  mysql.query("INSERT INTO User(CoursesTaken) VALUES ((SELECT COUNT(CourseComplete) FROM CourseCompletion))", function (err, rows) {
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
router.get('/achievement', function (req, res) {

  mysql.query("SELECT * FROM Achievement", function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});

// Post to Achievments Table
router.post('/achievement', function requestHandler(req,res) {
  mysql.query("INSERT INTO Achievement (BadgeID, AchievementTitle, AchievementDescription, BadgeImage) VALUES (?,?,?,?)", [req.BadgeID, req.AchievementTitle, req.AchievementDescription, req.BadgeImage], function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });
})

//Access UserAchievements Table
router.get('/userachievements', function (req, res) {

  mysql.query("SELECT * FROM UserAchievements", function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});

// Post to UserAchievments Table
router.post('/userachievements', function requestHandler(req,res) {
  mysql.query("INSERT INTO UserAchievements (UserAchievementsID, UserID, BadgeID) VALUES (?,?,?)", [req.UserAchievementsID, req.UserID, req.BadgeID], function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });
})

// Access Goals Table 
router.get('/goal', function (req, res) {
  mysql.query("SELECT * FROM Goal", function (err, rows) {
      if(err) {
        res.status(500).send(err);
        return;
      }

      if(rows) {
        res.status(200).send(rows);
      }

  });

});

// Post to Goals
router.post('/goal', function requestHandler(req,res) {
mysql.query("INSERT INTO Goal (GoalDescription, GoalTimeCreated) VALUES (?,?)", [req.body.GoalDescription, req.body.GoalTimeCreated], function (err, rows, fields) {
  if(err) {
    res.status(500).send(err);
    return;
  }

  if(rows) {
    res.status(200).send(rows);
  }

});
})

// Delete Goal
router.delete('/goal/:GoalID', function requestHandler(req,res) {

console.log(`Deleting goal with ID ${req.params.GoalID}`)
mysql.query("DELETE FROM Goal WHERE GoalID = ? ", [req.params.GoalID], function (err, rows, fields){

  if(err) {
    res.status(500).send(err);
    return;
  }

  if(rows) {
    res.status(200).send({message:"success"});
  }
});

})

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

  mysql.query("SELECT * FROM QuizScores", function (err, rows) {
    if(err) {
      res.status(500).send(err);
      return;
    }

    if(rows) {
      res.status(200).send(rows);
    }

  });

});
//change id to UserID
// Access Quiz Table with ID
router.get('/quiz/:id', function (req, res) {

  mysql.query("SELECT * FROM Quiz WHERE UserID = ?" + [req.params.UserID], function (err, rows) {
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

router.post('/forum/add', async function (req , res) {
  try {

    await mysql.query("SELECT FirstName, LastName, username, UserImage, Role FROM User WHERE UserID = ? ", [ req.body.user_id ],function (err, rows) {
      if(err) {
        return;
      }
      if(rows) {
        let firstName = ''
        let lastName = ''
        if(rows[0]) {
          firstName = rows[0].FirstName
          lastName = rows[0].LastName
        } 
        let postByName = firstName + ' ' + lastName 

        let record = {
          course_id : req.body.course_id,
          user_id : req.body.user_id,
          //role : req.body.Role,
          question : req.body.title,
          forum_src : req.body.forum_src,
          posted_on: new Date(),
          postByName: postByName,
        };
      
        mysql.query('INSERT INTO Forum SET ?', record, function(error, results, fields) {
          if (error) throw error;
          res.status(200).send(results);
        });
      }
    })
  } catch (error) {
    console.log(error);
  }

});

router.post('/announcment/add', async function (req , res) {
  try {
    console.log(req)
    //let firstname;
    let userData = ''
    await mysql.query("SELECT FirstName, LastName, username, UserImage, Role FROM User WHERE UserID = ? ", [ req.body.user_id ],function (err, rows) {
      if(err) {
        return;
      }
      if(rows) {
        let firstName = ''
        let lastName = ''
        if(rows[0]) {
          firstName = rows[0].FirstName
          lastName = rows[0].LastName
        } 
        let postByName = firstName + ' ' + lastName 

        let record = {
          course_id : req.body.course_id,
          user_id : req.body.user_id,
          title : req.body.title,
          img_src : req.body.img_src,
          description: req.body.description,
          posted_on: new Date(),
          postByName: postByName
        };
      
        mysql.query('INSERT INTO Announcement SET ?', record, function(error, results, fields) {
          if (error) throw error;
          return res.status(200).send(results);
        });
      }
    })
  } catch (error) {
    console.log(error);
    return res.status(500).send('internal server error!')
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

router.get('/ChapterInfo', function (req, res) {
  mysql.query("SELECT * FROM ChapterInfo WHERE CourseID = " + req.query.CourseID, function (err, rows) {
      if (err) {
          res.status(500).send(err);
      }
      if (rows) {
          res.status(200).send(rows);
      }
  });
});

router.get('/CourseQuizzes', function (req, res) {
  mysql.query("SELECT * FROM CourseQuizzes", function (err, rows) {
      if (err) {
          res.status(500).send(err);
      }
      if (rows) {
          res.status(200).send(rows);
      }
  });
});

router.get('/QuizAnswers', function (req, res) {
  mysql.query("SELECT * FROM QuizAnswers", function (err, rows) {
      if (err) {
          res.status(500).send(err);
      }
      if (rows) {
          res.status(200).send(rows);
      }
  });
});

router.get('/QuizScores', function (req, res) {
  mysql.query("SELECT * FROM QuizScores", function (err, rows) {
      if (err) {
          res.status(500).send(err);
      }
      if (rows) {
          res.status(200).send(rows);
      }
  });
});
router.get('/IntroQuiz', function (req, res) {
  mysql.query("SELECT * FROM IntroQuiz", function (err, rows) {
      if (err) {
          res.status(500).send(err);
      }
      if (rows) {
          res.status(200).send(rows);
      }
  });
});

router.get('/IntroQuizResult', function (req, res) {
  mysql.query("SELECT * FROM IntroQuizResult", function (err, rows) {
      if (err) {
          res.status(500).send(err);
      }
      if (rows) {
          res.status(200).send(rows);
      }
  });
});

router.get('/updateIntroQuizResult', function (req, res) {
  let params = req.query
  let addSql = 'REPLACE INTO IntroQuizResult(UserID,TypeOfLearner,CourseRecommended) VALUES(?,?,?)'
  let addSqlParams = [params.id, params.type, params.recommended];
  mysql.query(addSql, addSqlParams, function (err, result) {
      if (err) {
          res.send(err)
          return;
      }
      res.send(result)
  });
});

router.get('/getCourseQuizzes', function (req, res) {
  let params = req.query
  let Sql = 'SELECT * FROM CourseQuizzes WHERE CourseID = ' + params.CourseID + ' AND ChapterID = ' + params.ChapterID
  mysql.query(Sql, function (err, result) {
      if (err) {
          res.send(err)
          return;
      }
      res.send(result)
  });
});

router.get('/updateQuizScores', function (req, res) {
  let params = req.query
  let addSql = 'REPLACE INTO QuizScores(UserID,ChapterID,Score) VALUES(?,?,?)'
  let addSqlParams = [params.UserID, params.ChapterID, params.Score];
  mysql.query(addSql, addSqlParams, function (err, result) {
      if (err) {
          res.send(err)
          return;
      }
      res.send(result)
  });
});

router.get('/Scores', function (req, res) {
  let params = req.query
  let addSql = 'SELECT ChapterID FROM ChapterInfo WHERE CourseID = ' + params.CourseID
  mysql.query(addSql, function (err, result) {
      if (err) {
          res.send(err)
          return;
      }
      // addSql = 'SELECT ChapterInfo.ChapterName FROM QuizScores WHERE UserID = ' + params.UserID + ' AND ChapterID >= ' + result[0].ChapterID +
      //     ' AND ChapterID <= ' + result[result.length - 1].ChapterID
      addSql = 'SELECT QuizScores.Score,ChapterInfo.ChapterName ' +
          ' FROM QuizScores,ChapterInfo ' +
          ' WHERE QuizScores.UserID = ' + params.UserID +
          ' AND QuizScores.ChapterID >= ' + result[0].ChapterID +
          ' AND QuizScores.ChapterID <= ' + result[result.length - 1].ChapterID +
          ' AND QuizScores.ChapterID=ChapterInfo.ChapterID'
      mysql.query(addSql, function (err, result) {
          if (err) {
              res.send(err)
              return;
          }
          res.send(result)
      })
  });
});

router.get('/submitFeedback', function (req, res) {
  let params = req.query
  let addSql = 'INSERT INTO Feedback(CourseID,Content) VALUES(?,?)'
  let addSqlParams = [params.CourseID, params.Feedback];
  mysql.query(addSql, addSqlParams, function (err, result) {
      if (err) {
          res.send(err)
          return;
      }
      res.send('ok')
  });
});

router.get('/getReference', function (req, res) {
  let params = req.query
  let addSql = 'SELECT ReferenceLink FROM ChapterInfo WHERE CourseID = ? AND ChapterID = ?'
  let addSqlParams = [params.CourseID, params.ChapterID];
  mysql.query(addSql, addSqlParams, function (err, result) {
      if (err) {
          res.send(err)
          return;
      }
      if (result) {
          res.send(result)
      }
  });
});

router.get('/getVideo', function (req, res) {
  let params = req.query
  let addSql = 'SELECT ModuleVideo FROM Module WHERE CourseID = ? AND ModuleID = ?'
  let addSqlParams = [params.CourseID, params.ChapterID];
  mysql.query(addSql, addSqlParams, function (err, result) {
      if (err) {
          res.send(err)
          return;
      }
      if (result) {
          res.send(result)
      }
  });
});

router.get('/getChapterName', function (req, res) {
  let params = req.query
  let addSql = 'SELECT ChapterName FROM ChapterInfo WHERE ChapterID = ?'
  let addSqlParams = [params.ChapterID];
  mysql.query(addSql, addSqlParams, function (err, result) {
      if (err) {
          res.send(err)
          return;
      }
      if (result) {
          res.send(result)
      }
  });
});

router.post('/getProgress', function (req, res) {
  let postData = req.body
  let addSql = 'select * FROM courseEnrollData WHERE user_id = ? AND course_id = ?'
  let addSqlParams = [postData.user_id, postData.course_id];
  mysql.query(addSql, addSqlParams, function (err, result) {
      if (err) {
          res.send(err)
          return;
      }
      return res.send(result)
  });
});

router.post('/updateProgress', function (req , res) {
  try {
    const record = {
      course_completion: req.body.course_completion
    }
    mysql.query("UPDATE courseEnrollData SET ? WHERE course_id = ? AND user_id = ?",[record, req.body.course_id, req.body.user_id], function(err, result) {
      if (err) {
        return res.send(err);
      }
      res.send(result)
    })
    
  } catch (error) {
    console.log(error);
  }

});

router.post('/chapterCompletion', function (req , res) {
  try {
    mysql.query("INSERT INTO CourseCompletion(userID,CourseComplete, course_id) VALUES(?,?,?)",[req.body.user_id, 1, req.body.course_id], function(err, result) {
      if (err) {
        return res.send(err);
      }
      res.send(result)
    })
    
    
  } catch (error) {
    console.log(error);
  }

});

module.exports = router;

