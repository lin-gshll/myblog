const express = require("express");
const router = express.Router();
const Blogtype = require("../models/blogtype");
const Blog = require("../models/blog");
const User = require("../models/user");

router.get("/", function(req, res, next) {
    Blogtype.find().sort({ _id: 1 }).then(function(types) {
        Blog.find().sort({ _id: -1 }).limit(8).then(function(datas) {
            var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
            var index = reg.exec(datas[0].content).index;
            datas[0].content = datas[0].content.substring(index, index + 20);
            res.render("blog/index.html", {
                _datas: datas,
                _types: types,
                firstId: datas[0]._id.toString()
            });
            return;
        });
    });
})

router.get("/blogclass", function(req, res, next) {
    let typeid = req.query.id || 0;
    Blogtype.findOne({
        _id: typeid
    }).then(function(types) {
        Blog.find({
            type: types.type
        }).sort({ _id: -1 }).then(function(datas) {

            res.render("blog/blogclass.html", {
                _datas: datas || null,
            });
        });
    });

});

router.get("/reading", function(req, res, next) {
    let id = req.query.id || 0;
    Blog.findOne({
        _id: id
    }).then(function(datas) {
        if (datas) {
            User.find({
                blogid: id
            }).sort({
                _id: -1
            }).then(function(users) {
                //查找上下一篇文章
                Blog.find({
                    _id: { $gt: datas._id }
                }).sort({ _id: -1 }).limit(1).then(function(preblog) {
                    preblog = preblog || "";
                    Blog.find({
                        _id: { $lt: datas._id }
                    }).sort({ _id: -1 }).limit(1).then(function(nextblog) {
                        nextblog = nextblog || "";
                        res.render("blog/blog_layout.html", {
                            _datas: datas,
                            _users: users,
                            _nextblog: nextblog[0],
                            _preblog: preblog[0]
                        });
                    });
                });

            })
        }

    });
});


module.exports = router;