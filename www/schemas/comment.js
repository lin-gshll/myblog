const mongoose = require("mongoose");
let schema = mongoose.Schema; //代表一个表
//定义用户表结构
module.exports = new schema({
    blogid: String,
    count: {
        type: Number,
        default: 0
    }
})