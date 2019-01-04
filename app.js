//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Complete AD01 Certification"
});
const item2 = new Item({
  name: "Complete Blue Prism Dashboard"
});
const item3 = new Item({
  name: "Learn AWS Professional Certification"
});

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Inserted My Items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  });
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

List.findOne({name:customListName},function(err,foundList){

  if(!err){
    if(!foundList){
     //Create a New List
     const list = new List({name:customListName,items:defaultItems});

     list.save();
     res.redirect("/" +customListName);
    }
    else {
      //Show an existing List
      res.render("list", {
        listTitle: customListName,
        newListItems: foundList.items
      });
    }
  }
});

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

 if(listName === "Today"){
   item.save();
   res.redirect("/");
 } else {

   List.findOne({name: listName}, function(err, foundList){
     foundList.items.push(item);
     console.log(foundList);
     foundList.save();
     res.redirect("/"+ listName);
   });
 }

});

app.post("/delete",function(req,res){
  const itemCheckedId= req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(itemCheckedId,function(err){
      if(!err){
        console.log("Successfully Removed the completed Item");
        res.redirect("/");
      }
    });
  } else {

    List.findOneAndUpdate({name: listName},{$pull: {items: {_id:itemCheckedId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }
});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
