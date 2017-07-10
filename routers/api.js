var express = require("express");
var router = express.Router();
var User = require("../models/user");
//统一数据放回格式
// var responseDate;
//一进来就处理数据
// router.use(function(req, res, next) {
//     responseDate = {
//         code: "0",
//         message: ""
//     }
//     next();
// })

router.post("/user/comment", function(req, res, next) {

    let username = req.body.username || 0;
    let email = req.body.email || 0;
    let content = req.body.content || 0;
    let blogid = req.body.blogid || 0;
    let datatime = Date.now();
    let user = new User({
        username: username,
        email: email,
        content: content,
        blogid: blogid,
        datatime: datatime,
        isAdmin: true
    });
    user.save().then(function(t) {
        res.end(t._id.toString());
        return;

    })
});
router.get("/user/login", function(req, res, next) {
    //转到登录页面
    res.render("main/login.html");

});
router.post("/user/login/check", function(req, res, next) {
    //登录验证
    let username = req.body.username;
    let email = req.body.password;
    User.findOne({
        username: username,
        email: email
    }).then(function(admin) {
        if (admin) {
            if (admin.isAdmin) {
                //返回Cookies信息保存在浏览器中
                req.cookies.set('userAdmin', username);
                res.end("1");
            } else {
                res.end("0");
            }
        } else {
            res.end("-1");
        }
    })
});
router.get("/contact",function(req,res,next)
{
	res.send("邮箱:1432667757@qq.com");
		res.end();
})
module.exports = router;