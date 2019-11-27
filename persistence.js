const mongoose = require("mongoose");
const url = process.env.DB_CONNECTION;

var Schema = mongoose.Schema;

const itemSchema = Schema({
  name: String,
  done: Boolean
});

const listSchema = Schema({
  name: String,
  items: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

exports.createItem = function(name) {
  return new Item({name: name});
};

exports.createList = function(name, items) {
  return new List({name: name, items: items});
};

exports.getItems = getItems;

function getItems(defaults, callback) {
  openConnection();
  Item.find().lean().exec(function(err, items) {
    //if the todo list doesn't contain any items then create some defaults
    if (!items || items.length === 0) {
      Item.insertMany(defaults, (err) => getItems(defaults, callback));
    } else {
      callback(items);
      closeConnection(err);
    }
  });
};

exports.addItems = function(items, callback) {
  openConnection();
  console.log("Adding items: ");
  console.log(items);

  if (Array.isArray(items)) {
    Item.insertMany(items, (err) => {
      closeConnection(err);
      callback();
    });
  } else {
    items.save((err) => {
      closeConnection(err);
      callback();
    });
  }
};

function getItems(defaults, callback) {
  openConnection();
  Item.find().lean().exec(function(err, items) {
    //if the todo list doesn't contain any items then create some defaults
    if (!items || items.length === 0) {
      Item.insertMany(defaults, (err) => getItems(defaults, callback));
    } else {
      callback(items);
      closeConnection(err);
    }
  });
};

exports.markAsDone = function(itemId, callback) {
  openConnection();
  console.log("Marking item as done: " + itemId);

  Item.findOneAndUpdate({_id: itemId}, {done: true}, {useFindAndModifyOption: false}, (err) => {
    closeConnection(err);
    callback();
  });
};

exports.removeItem = function(itemId, callback) {
  openConnection();
  console.log("Removing item: ");
  console.log(itemId);

  Item.findByIdAndRemove(itemId, (err) => {
    closeConnection(err);
    callback();
  });
};

exports.addList = function(list, callback) {
  openConnection();

  List.findOne({name: list.name}, function(err, foundList) {
    if (err) {
      console.log(err);
      closeConnection(err);
      callback();
    } else {
      if (!foundList) {
        console.log("Can't find the list, adding it: " + list.name)
        list.save((err) => {
          closeConnection(err);
          callback(list);
        });
      } else {
        console.log("List found: " + foundList.name)
        callback(foundList);
      }
    }
  });
};

function openConnection() {
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
}

function closeConnection(err) {
  if (err) {
    console.log(err)
  }
  mongoose.connection.close();
}
