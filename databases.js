const mongoose = require("mongoose");
var connection = mongoose.createConnection("mongodb://127.0.0.1:27017/kebelleDb", { useNewUrlParser: true });
module.exports = connection;