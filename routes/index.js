var User = require("../models/user");
var crypto = require("crypto");
module.exports = function (app) {
    /**
     * 验证登录
     */
    app.get("/",checkLogin);
    app.get("/",function (req , res){
        res.render('message', {
            user : req.session.user,
            title: "聊天室首页",
            error: req.flash("error").toString(),
            success: req.flash("success").toString()
        });
    });

    /**
     * 发送消息
     */
    app.get("/message",checkLogin);
    app.get("/message", function (req, res) {
        res.render('message', {
            user : req.session.user,
            title: "聊天室首页",
            error: req.flash("error").toString(),
            success: req.flash("success").toString()
        });
    });

    /**
     * 注册路由
     */
    app.get("/register",checkNotLogin);
    app.get("/register",function (req,res){
        res.render("register",
            {
                title:"用户注册",
                success:req.flash("success").toString(),
                error:req.flash("error").toString()
            }
            );
    });

    /**
     * 注册路由请求处理
     */
    app.get("/register",checkNotLogin);
    app.post("/register",function (req,res){
        var password = req.body.password;
        var username = req.body.username;
        var email = req.body.email;
        var md5 = crypto.createHash("md5");
        password = md5.update(password).digest("hex");
        //检查用户名是否存在
        var newUser = new User({
            username:username,
            password:password,
            email:email
        });

        User.getOne(username,function (error,user){
            if(error){
                req.flash("error","发生错误");
                return res.redirect("/");
            }
            if(user){
                req.flash("error","用户已存在");
                res.redirect("/register");
            }else{
                newUser.save(function (error,user){
                    if(error){
                        req.flash("error","发生错误");
                        return res.redirect("/");
                    }
                    req.flash("success","注册成功");
                    req.session.user = user;
                    return res.redirect("/");
                });
            }
        });
    });

    /**
     * 用户登录路由
     */
    app.get("/login",checkNotLogin);
    app.get("/login",function (req ,res){
        res.render("login",
            {
                title:"用户登录",
                error:req.flash("error").toString(),
                success:req.flash("success").toString()
            });
    });

    /**
     * 登录路由处理
     */
    app.post("/login",checkNotLogin);
    app.post("/login",function (req,res) {
        var username = req.body.username;
        User.getOne(username ,function (error,user){
            if(error){
                req.flash("error","出现错误"+error);
                res.redirect("back");
            }

            if(!user){
                req.flash("error","此用户不存在");
                res.redirect("back");
            }
            //console.log('登录后信息');
            //console.log(user);
            req.session.user= user;
            req.flash("success","登录成功");
            res.redirect("/message");
        });
    });

    /**
     * 退出按钮
     */
    app.get("/logout",function (req,res){
        req.session.user = null;
        res.redirect("/login");
    });

    /**
     * 未登录判断
     * @param req
     * @param res
     * @param next
     */
    function checkLogin(req,res,next){
        if(!req.session.user){
            res.redirect("/login");
        }
        next();
    }

    /**
     * 登录之后判断
     * @param req
     * @param res
     * @param next
     */
    function  checkNotLogin(req,res,next){
        if(req.session.user){
            res.redirect("back");
        }
        next();
    }
}