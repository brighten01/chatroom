var User = require("../models/user");
var crypto = require("crypto");
var Room = require("../models/room");
module.exports = function (app) {
    /**
     * 验证登录
     */
    app.get("/",checkLogin);
    app.get("/",function (req , res){
        res.redirect("/roomlist");
        //res.render('message', {
        //    user : req.session.user,
        //    title: "聊天室首页",
        //    error: req.flash("error").toString(),
        //    success: req.flash("success").toString()
        //});
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
                    return res.redirect("/roomlist");
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
            req.session.user = user;
            req.flash("success","登录成功");
            res.redirect("/roomlist");
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
     * 进入某个房间页面 并且判断是否登录
     */
    app.get("/room/:name",checkLogin);
    app.get("/room/:name",function(req,res){
        var name = req.params.name;
        var room_id = 0;
        var newRoom = new Room(name);
        Room.getOne(name,function (error,room){
            if(error){
                req.flash("error","发生错误");
            }
            room_id = room.room_id;
            if(room){
                res.render("message",{
                    title:"房间"+name,
                    error:req.flash("error").toString(),
                    success:req.flash("success").toString(),
                    user:req.session.user,
                    room:name,
                    room_id : room_id
                });
            }else{
                //否则跳转
                req.flash("error","您请求的房间不存在");
                return res.redirect("/");
            }
        });

    });

    /**
     * 添加房间
     */
    app.get("/addroom",checkLogin);
    app.get("/addroom",function (req,res){
        res.render("addroom",{
            title:"添加房间",
            user:req.session.user,
            success:req.flash("success").toString(),
            error:req.flash("error").toString()
        });
    });

    /**
     * 添加房间
     */
    app.post("/addroom",checkLogin);
    app.post("/addroom",function (req,res){
        var name = req.body.name;
        var room_id  =req.body.room_id;
        var newRoom = new Room(name,room_id);

        Room.getOne(name,function (error,room){
            console.log("房间信息");
            if(room){
                req.flash("error","房间名已经存在");
                return res.redirect('back');
            }

            newRoom.save(function (error,room){
                if(error){
                    console.log("error",error);
                    req.flash("error","请求错误"+error);
                    return res.redirect("/addroom");
                }
                req.flash("sucess","添加成功");
                res.redirect("/roomlist");
            });

        });
    });


    /**
     * 房间列表
     */
    app.get("/roomlist",checkLogin);
    app.get("/roomlist",function (req,res){

        Room.getList(function (error,roomlist){
            if(error){
                req.flash("error","房间列表载入出错"+error);
            }
            var rooms = null;
            if(roomlist){
                rooms = roomlist;
            }
            res.render("roomlist",{
                title:"房间里列表",
                user:req.session.user,
                error:req.flash("error").toString(),
                success:req.flash("success").toString(),
                roomlist:rooms
            });
        });
    });

    /**
     * 未登录判断
     * @param req
     * @param res
     * @param next
     */
    function checkLogin(req,res,next){
        if(!req.session.user) {
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