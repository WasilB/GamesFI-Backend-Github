const express = require("express");
const app = express();
const path = require("path");
const exphbs = require("express-handlebars");
const port = 3000;

const MongoClient = require("mongodb").MongoClient;
var mongourl = "mongodb://127.0.0.1:27017/gamesfi";

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.get("/", (req, res) => {
//   res.send("Hello World!!!!!!");
// });
//hande bars
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//homepage route
app.get("/login.html", (req, res) => {
  MongoClient.connect(mongourl, function (err, db) {
    if (err) throw err;
    var dbo = db.db("gamesfi");
    dbo
      .collection("userData")
      .find()
      .toArray((err, result) => {
        if (err) throw err;
        else {
          res.render("index", {
            title: "Members app",
            result,
          });
        }
      });
  });
});
// //static folder for frontend
app.use(express.static(path.join(__dirname, "public")));

//member api route
app.use("/api/members", require("./routes/api/members"));

app.listen(port, () => {
  console.log("App started on port: " + port);
});
