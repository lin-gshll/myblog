//用户模型类
var mongoose = require("mongoose");
var userSchema = require("../schemas/blogtype.js");
module.exports = mongoose.model("Blogtype", userSchema);