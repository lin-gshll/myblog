var mongoose = require("mongoose");
var schema = mongoose.Schema; //代表一个表
//定义用户表结构

module.exports = new schema({
    //用户名
    username: String,
    //邮件
    email: String,
    //内容
    content: String,
    //blogID
    blogid: String,
    //管理员
    isAdmin: Boolean,
    datatime: Date,
      
})