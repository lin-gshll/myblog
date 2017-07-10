var express = require("express");
var path = require("path");
//服务端的对象
var app = express();
var ueditor = require("ueditor");
var bodyParse = require("body-parser");
//配置bodyParser,这样res就有一个body属性操作post请求
app.use(bodyParse.urlencoded({ extended: true }));

app.use(bodyParse.json());
//设置cookies信息
var Cookies = require("cookies");
app.use(function(req, res, next) {
    //把cookies放到头信息中
    req.cookies = new Cookies(req, res);
    // res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    // res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
    next();
});
//连接数据库
var mongoose = require("mongoose");

//设置静态文件托管
app.use(express.static(path.join(__dirname, 'public')));
// app.use("/public", express.static(__dirname + "/public"));
//模板配置；
var swig = require("swig");
//定义模板引擎
//第一个参数是模板名称，第二个参数是模板方法
app.engine("html", swig.renderFile);
//设置目录，第一个参数固定
app.set("views", "./views");
//注册模板引擎，第一个参数固定
app.set("view engine", "html");
//取消模板缓存
swig.setDefaults({ cache: false });
/*
根据功能划分模块
*/
app.use("/admin", require('./routers/admin'));
app.use("/api", require('./routers/api'));
app.use("/blog", require('./routers/blog'));
app.use("/", require('./routers/main'));
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {

    //客户端上传文件设置
    var imgDir = '/img/ueditor/'
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir; //默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; //视频
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = imgDir;
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json');
    }
}));


mongoose.connect("mongodb://localhost:27017/blog", function(err) {
    if (err) {
        console.log("数据库连接失败");
        return;
    } else {
        console.log("数据库连接成功");
        //监听端口号
        app.listen(80,"120.25.194.191", function() {
            console.log("listening 8080");
        });
    }
});