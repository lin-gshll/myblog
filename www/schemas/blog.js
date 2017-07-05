const mongoose = require("mongoose");
let schema = mongoose.Schema; //代表一个表
//定义用户表结构
module.exports = new schema({
    //标题
    title: String,
    //内容
    content: String,

    //日期
    datatime: {
        type: Date,
        default: Date.now()
    },
    //标签
    tag: {
        type: String,
        default: ""
    },
    //类型
    type: {
        type: String,
        default: "其他"
    }

})