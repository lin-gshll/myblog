const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Blogtype = require("../models/blogtype");
const Blog = require("../models/blog");
const fs = require("fs");
const path = require("path");
router.use(function(req, res, next) {
    if (req.cookies.get("userAdmin") == undefined) {
        res.send("你没有权限");
        res.end();
        return;
    } else {
        req.username = req.cookies.get("userAdmin");
        next();
    }
});

//子路由
router.get("/", function(req, res, next) {
    res.render("admin/index.html", { username: req.username });
});
router.get("/user", function(req, res, next) {
    /*
    limi():限制显示条数
    skip():忽略数据的条数
    1：1-2:skip:0;->当前页减一 * limit
    2: 3-4:skip :2
    */

    let page = Number(req.query.page || 1); //当前页数
    let limit = 7; //每页显示几条
    //读取数据库中的所有数据
    User.count().then(function(count) {
        let pages = Math.ceil(count / limit); //总共分页数
        page = Math.min(page, pages); //限制最大值
        page = Math.max(page, 1); //限制最小值
        limit = Math.min(limit, count);
        let skip = (page - 1) * limit;
        User.find().limit(limit).skip(skip).then((users) => {
            res.render("admin/user-index.html", {
                users: users,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                username: req.username
            });
        });
    })
});

//删除用户
router.get("/user/delete", function(req, res, next) {
    let id = req.query.id || 0;
    User.findOne({
        _id: id
    }).then(function(i) {
        if (i) {
            User.remove({
                _id: id
            }).then(function(t) {
                if (t) {
                    res.render("admin/success.html", {
                        username: req.username,
                        message: `用户${i.username}删除成功`,
                        url: "/admin/user"
                    });
                    return;
                } else {
                    res.render("admin/error.html", {
                        username: req.username,
                        message: `用户${i.username}删除失败`,

                    });
                    return;
                }
            })
        } else {
            res.render("admin/error.html", {
                username: req.username,
                message: `用户不存在`,
            });
            return;
        }
        return;
    });

});
// 分类首页
router.get("/blogclass", (req, res, next) => {
    let page = Number(req.query.page || 1);
    let limit = 7;
    //读取数据库中的所有数据
    Blogtype.count().then(function(count) {
        let pages = Math.ceil(count / limit); //总共分页数
        page = Math.min(page, pages); //限制最大值
        page = Math.max(page, 1); //限制最小值
        limit = Math.min(limit, count);
        let skip = (page - 1) * limit;
        Blogtype.find().limit(limit).skip(skip).then((blogtypes) => {
            res.render("admin/blogclass_index.html", {
                blogtypes: blogtypes,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                username: req.username
            });
        });
    })

});
//添加分类
router.get("/blogclass/add", (req, res, next) => {
    res.render("admin/blogclass_add.html", {
        username: req.username
    })
});
//post实现添加分类
router.post("/blogclass/add", (req, res, next) => {

    let blogtype = req.body.blogtype || "";
    if (blogtype == "") {
        res.render("admin/error.html", {
            username: req.username,
            message: "分类名称不能为空",
        });
        return;
    }
    //判断数据库中是否存在同名
    Blogtype.findOne({
        type: blogtype
    }).then(function(data) {
        if (data) {
            //表示分类已经存在
            res.render("admin/error.html", {
                username: req.username,
                message: "分类名称已经存在",
            });
        } else {
            //分类不存在
            return new Blogtype({
                type: blogtype
            }).save();
        }

    }).then(function(data) {
        if (data) {
            if (!fs.existsSync(path.join(__dirname, "../views/blog/" + blogtype))) {
                fs.mkdirSync(path.join(__dirname, "../views/blog/" + blogtype));
            }
            res.render("admin/success.html", {
                username: req.username,
                message: "保存成功",
                url: "/admin/blogclass"
            })
        }

    });

});

//修改分类
router.get("/blogclass/edit", function(req, res, next) {
    let id = req.query.id || 0;
    Blogtype.findOne({
        _id: id
    }).then(function(_data) {
        if (!_data) {
            //表示分类信息不存在
            res.render("admin/error.html", {
                username: req.username,
                message: "分类信息不存在",
            });
            return Promise.reject();
        } else {
            res.render("admin/blogclass_edit.html", {
                username: req.username,
                oldtype: _data.type,
                id: _data._id.toString()
            })
        }
    })
});
//post提交修改保存
router.post("/blogclass/edit", function(req, res, next) {
    let id = req.body.id || 0;
    let type = req.body.type || "";
    Blogtype.findOne({
        _id: id
    }).then(function(_data) {
        if (!_data) {
            //表示分类信息不存在
            res.render("admin/error.html", {
                username: req.username,
                message: "分类信息不存在",
            });
            return Promise.reject();
        } else {
            if (type == _data.type) {

                res.render("admin/success.html", {
                    username: req.username,
                    message: "修改成功",
                    url: "/admin/blogclass"
                });
                return Promise.reject();
            } else {
                //返回是否找到的对象，满足id不等，type相等的情况
                return Blogtype.findOne({
                    _id: { $ne: id },
                    type: type
                });

            }
        }
    }).then(function(_data) {
        if (_data) {
            res.render("admin/error.html", {
                username: req.username,
                message: "分类名称已经存在"
            });
            return Promise.reject();
        } else {
            //不存在更新操作
            Blogtype.update({
                _id: id
            }, {
                type: type
            }).then(function() {
                if (!fs.existsSync(path.join(__dirname, "../views/blog/" + type))) {
                    fs.mkdirSync(path.join(__dirname, "../views/blog/" + type));
                }
                res.render("admin/success.html", {
                    username: req.username,
                    message: "修改成功",
                    url: "/admin/blogclass"
                });
                return;
            })

        }

    })
});
//删除分类信息
router.get("/blogclass/delete", function(req, res, next) {
    //获取分类ID
    let id = req.query.id || 0;
    Blogtype.findOne({
        _id: id
    }).then(function(datas) {
        if (datas) {
            Blogtype.remove({
                _id: id
            }).then(function(t) {
                if (t.result.n > 0) {
                    Blog.remove({
                        type: datas.type
                    }).then(function(j) {
                        res.render("admin/success.html", {
                            username: req.username,
                            message: "删除成功",
                            url: "/admin/blogclass"
                        });
                        return Promise.reject();
                    });

                } else {
                    fs.unlinkSync(curPath);
                    res.render("admin/error.html", {
                        username: req.username,
                        message: "删除失败",

                    });
                    return Promise.reject();
                }
            })

        } else {
            res.render("admin/error.html", {
                username: req.username,
                message: "分类不存在",
            });
            return;
        }
    });


});
//文章列表
router.get("/blogs", function(req, res, next) {
    let page = Number(req.query.page || 1);
    let limit = 7;
    //读取数据库中的所有数据
    Blog.count().then(function(count) {
        let pages = Math.ceil(count / limit); //总共分页数
        page = Math.min(page, pages); //限制最大值
        page = Math.max(page, 1); //限制最小值
        limit = Math.min(limit, count);
        let skip = (page - 1) * limit;
        Blog.find().sort({
            _id: -1
        }).limit(limit).skip(skip).then((blogs) => {
            res.render("admin/blog_index.html", {
                blogs: blogs,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                username: req.username
            });
        });
    })
});

//文章内容添加
router.get("/blogs/add", function(req, res, next) {
    Blogtype.find().sort({ _id: -1 }).then(function(types) {
        res.render("admin/blog_add.html", {
            types: types
        });
    });

});
//内容保存
router.post("/blogs/add", function(req, res, next) {

    let title = req.body.title || "";
    let type = req.body.types || "";
    let tag = req.body.tag || "";
    let content = req.body.content || "";

    let date = Date.now();

    // let date = newD.getFullYear() + "年" + (newD.getMonth() + 1) + "月" + newD.getDate() + "日";
    //检测判断
    if (title == "") {
        res.render("admin/error.html", {
            username: req.username,
            message: "标题不能为空"
        });
        return;
    } else if (content == "") {
        res.render("admin/error.html", {
            username: req.username,
            message: "内容不能为空"
        });
        return;
    }
    var item = new Blog({
        title: title,
        type: type,
        tag: tag,
        content: content,
        //datatime: date
    });
    item.save().then(function(i) {

        if (i) {
            var blogpath = path.join(__dirname, `../views/blog/${i.type}/${i._id.toString()}.html`);
            var html = fs.readFileSync(path.join(__dirname, `../views/blog/blog_layout.html`));
            console.log(html);
            console.log(blogpath);
            fs.writeFileSync(blogpath, html);

            res.render("admin/success.html", {
                username: req.username,
                message: "保存成功",
                url: "/admin/blogs"
            });
        } else {
            res.render("admin/error.html", {
                username: req.username,
                message: "保存失败"
            });
            return;
        }
    })
});

//文章修改
router.get("/blogs/edit", function(req, res, next) {

    let id = req.query.id || 0;
    Blogtype.find().then(function(types) {
        Blog.findOne({
            _id: id
        }).then(function(_data) {
            if (!_data) {
                //表示分类信息不存在
                res.render("admin/error.html", {
                    username: req.username,
                    message: "文章内容信息不存在",
                });
                return Promise.reject();
            } else {
                res.render("admin/blog_edit.html", {
                    username: req.username,
                    data: _data,
                    types: types
                })
            }
        });

    })
});
//post提交修改保存
router.post("/blogs/edit", function(req, res, next) {

    let id = req.body.id;
    let title = req.body.title || "";
    let type = req.body.types || "";
    let tag = req.body.tag || "";
    let content = req.body.content || "";
    // let date = newD.getFullYear() + "年" + (newD.getMonth() + 1) + "月" + newD.getDate() + "日";
    //检测判断
    // var html = fs.readFileSync(path.join(__dirname, "../views/blog/blog_layout.html"), "utf-8");
    // console.log(html);
    // fs.writeFileSync(path.join(__dirname, "../views/blog/" + type + "/" + id + ".html"), html);
    if (title == "") {
        res.render("admin/error.html", {
            username: req.username,
            message: "标题不能为空"
        });
        return;
    } else if (content == "") {
        res.render("admin/error.html", {
            username: req.username,
            message: "内容不能为空"
        });
        return;
    }
    var item = {
        title: title,
        type: type,
        tag: tag,
        content: content,
        datatime: Date.now()
    };
    Blog.update({
        _id: id
    }, item).then(function(i) {
        if (i) {

            res.render("admin/success.html", {
                username: req.username,
                message: "修改成功",
                url: "/admin/blogs"
            });
            return;
        } else {
            res.render("admin/error.html", {
                username: req.username,
                message: "保存失败"
            });
            return;
        }
    })


});
//删除文章
router.get("/blogs/delete", function(req, res, next) {

    let id = req.query.id || 0;
    Blog.findOne({
        _id: id
    }).then(function(i) {
        //有该记录就删除
        if (i) {
            Blog.remove({
                _id: id
            }).then(function(t) {
                //把对用的用户评论也删了
                User.remove({
                    blogid: id
                });
                if (t) {
                    res.render("admin/success.html", {
                        username: req.username,
                        message: "删除成功",
                        url: "/admin/blogs"
                    });
                } else {
                    res.render("admin/error.html", {
                        username: req.username,
                        message: "删除失败",
                    });
                }
            })
        } else {
            res.render("admin/error.html", {
                username: req.username,
                message: "没有该条记录",
            });
        }
    })

});
//将路由对象返回，到app里面的第二个参数
module.exports = router;