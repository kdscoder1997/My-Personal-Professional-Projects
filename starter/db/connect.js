const mongoose = require("mongoose");

function connectDb(url) {
  mongoose.set("strictQuery", true);
  connection = mongoose.connect(url);
  return connection;
}

module.exports = connectDb;
