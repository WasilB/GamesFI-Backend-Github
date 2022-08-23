const express = require("express"); // Express
const router = express.Router(); // Router
const bcrypt = require("bcryptjs"); //// Encryption
const uuid = require("uuid"); // Unique ID
const upload = require("../../multer"); //File Storage and validation from multer.js
const userSchema = require("../../userSchema"); //JOI schema and data validation from userSchema.js
const { string, func } = require("joi");
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const MongoClient = require("mongodb").MongoClient; // MongoDB
var mongourl = "mongodb://127.0.0.1:27017/gamesfi"; // DATABASE Link
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// gets all members
router.get("/", (req, res) => {
  MongoClient.connect(mongourl, function (err, db) {
    if (err) throw err;
    var dbo = db.db("gamesfi");
    dbo
      .collection("userData")
      .find()
      .toArray((err, result) => {
        if (err) throw err;
        res.json(result);
      });
  });
});

//get single member
router.get("/:name", (req, res) => {
  MongoClient.connect(mongourl, function (err, db) {
    if (err) throw err;
    var dbo = db.db("gamesfi");
    dbo.collection("userData").findOne(
      {
        name: req.params.name,
      },
      (err, result) => {
        if (err) throw err;
        res.json(result);
        db.close();
      }
    );
  });
});

const saltRounds = 10;

//Create member
router.post("/", async (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    res.json(error);
  } else {
    const storedPassword = await bcrypt.hash(req.body.password, saltRounds);
    MongoClient.connect(mongourl, function (err, db) {
      if (err) throw err;
      var dbo = db.db("gamesfi");
      dbo
        .collection("userData")
        .findOne({ name: req.body.name }, function (error, result) {
          if (error) throw error;
          else {
            //console.log(result);
          }
          if (result == null) {
            dbo.collection("userData").insertOne(
              {
                id: uuid.v4(),
                name: req.body.name,
                email: req.body.email,
                password: storedPassword,
                status: "Active",
              },
              function (err, result) {
                if (err) throw err;
                res.json(result);
                //res.redirect("/login.html");
                db.close;
              }
            );
          } else {
            res.json(
              "User Name is Already In use! Please try a different User Name "
            );
          }
        });
    });
  }
});

//update member
router.put("/:name", async (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    res.json(error);
  } else {
    const storedPassword = await bcrypt.hash(req.body.password, saltRounds);
    MongoClient.connect(mongourl, function (err, db) {
      if (err) throw err;
      var dbo = db.db("gamesfi");
      var myQuery = { name: req.params.name };
      var newValues = {
        $set: {
          name: req.body.name,
          email: req.body.email,
          password: storedPassword,
        },
      };

      dbo
        .collection("userData")
        .updateOne(myQuery, newValues, (err, result) => {
          if (err) throw err;
          res.json("User Updated!");
          db.close();
        });
    });
  }
});

//Delete member

router.delete("/:name", (req, res) => {
  MongoClient.connect(mongourl, function (err, db) {
    if (err) throw err;
    var dbo = db.db("gamesfi");

    dbo
      .collection("userData")
      .deleteOne({ name: req.params.name }, (err, result) => {
        if (err) throw err;
        res.json(result);
        db.close();
      });
  });
});
//Uploading Images Only
router.post("/uploadfile", function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      return res.end("Error uploading file.");
    } else {
      res.end("File is uploaded successfully!");
    }
  });
});
//Login user
router.post("/userLogin", (req, res) => {
  let userEnteredName = req.body.name;
  let userEnteredPassword = req.body.password;
  MongoClient.connect(mongourl, (err, db) => {
    if (err) throw err;
    var dbo = db.db("gamesfi");
    dbo.collection("userData").findOne(
      {
        name: userEnteredName,
      },
      (err, result) => {
        if (err) throw err;
        else if (result == null) {
          res.json(
            "This User Name Password Combination does not exsist in the system!"
          );
        } else {
          let hash = result.password;
          bcrypt.compare(userEnteredPassword, hash, function (err, isMatch) {
            if (err) {
              throw err;
            } else if (!isMatch) {
              res.json("Password doesn't match!");
            } else {
              res.json("Password matches!");
            }
          });
        }
      }
    );
  });
});

module.exports = router;
