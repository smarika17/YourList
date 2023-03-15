const express = require("express");
const app = express();
const PORT = process.env.PORT || 3030;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
var _ = require("lodash");
require('dotenv').config();
console.log(process.env.ATLAS_URL);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//#----MongoDB Atlas Connection----//
mongoose.connect(process.env.ATLAS_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//#------Schema Created------//
const todoSchema = new mongoose.Schema({
  name: String,
});

//# 2nd Schema for Dynamic List
const listSchema = new mongoose.Schema({
  name: String,
  items: [todoSchema],
});

//#------Model Created------//
const Item = mongoose.model("Item", todoSchema);

const defaultItems = [
  { name: "Welcome" },
  { name: "Hit + to enter your to do!" },
  { name: "Hit the checkbox to delete an item." },
];

//# 2nd Model for Dynamic List
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  const day = date();

  Item.find(function (err, results) {
    if (results.length === 0) {
      Item.insertMany(defaultItems, function (err) {});
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: results });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const list = req.body.list;
  const day = date();
  const item = new Item({
    name: itemName,
  });

  if (list === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: list }, function (err, foundlist) {
      foundlist.items.push(item); //! Didn't fully understand
      foundlist.save();
      res.redirect("/" + list);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkboxID = req.body.checkbox;
  const listName = req.body.listName;
  const day = date();

  if (listName === day) {
    Item.findByIdAndRemove(checkboxID, function (err) {});
    res.redirect("/");
  } else {
    //* Here $pull is from MongoDB and 
    //* Find FindOneAndUpdate is from Mongoose
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkboxID } } }, 
      function (err) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:customListName", function (req, res) {
  const listHeader = _.upperFirst(req.params.customListName);

  List.findOne({ name: listHeader }, function (err, result) {
    if (!err) {
      if (!result) {
        const list = new List({
          name: listHeader,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + listHeader);
      } else {
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items,
        });
      }
    } else {
      console.log(err);
    }
  });
});

app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});