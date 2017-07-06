//用户模型类
var mongoose = require("mongoose");
var userSchema = require("../schemas/blog.js");
module.exports = mongoose.model("Blog", userSchema);