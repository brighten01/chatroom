var express = require("express");
var routes = require("./routes");
var settings = require("./settings");
var path = require("path");
var http =require("http");
var info = require("./models/info");
var checkdata = new info();
var session = require('express-session');
var MongoStore = require("connect-mongo")(express);
var sessionStore = new MongoStore({
    db:settings.db
});
//var Cookie = require("cookie");
var flash = require("connect-flash");
var app = express();
// 设置html引擎
app.use(flash());
//app.set("view engine","ejs");
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret:settings.cookieSecret,
    key : settings.db,
    cookie:{maxAge :1000 *60 *60 *24 *30},
    store:sessionStore
}));

var port= process.env.DEFAULT_PORT|| 1337;
app.use(app.router);
app.set("views",path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,"public")));
var io = require("socket.io").listen(app.listen(port));
// 设置socket.io 认证信息存储session
var users  = require("./models/user.js");

var messages = [];
var onlinUser = [];
io.sockets.on("connection",function (socket) {

    socket.on("getAllMessages",function (data){
        // todo 取数据
        socket.emit("allMessages",messages);
    });

    /**
     * 设置房间
     */
    socket.on("setroom",function(data){
        socket.room_id = data.room_id;
        socket.join(socket.room_id);
    });

    /**
     * 发送信息
     */
    socket.on("createMessage",function (message){
        io.sockets.in(message.room_id).emit("messageAdded",message);
    });

    /**
     *  离开房间
     */
    socket.on('leave room', function(data) {
        onlinUser = checkdata.del(onlinUser ,data.username);
        io.sockets.in(data.room_id).emit("onlineuser",{users:onlinUser});
    });

    /**
     * 登录房间
     */
    socket.on("login room",function(data){

        // 推送在线用户
        socket.join(data.room_id);
        var flag =false ;

        if(onlinUser.length > 0) {
           flag =  checkdata.find(onlinUser,data.username);
            if(flag == false ) {
                onlinUser.push(data.username);
                io.sockets.in(data.room_id).emit("login user",{message:"welcome "+ data.username+" 进入房间 "});

                users.updateOnline(data.username,function (error,userinfo){
                    if(error){
                        console.log(error);
                        return false;
                    }

                    //更新完毕后取得用户信息
                    users.getOnline(function (error,online_users){
                        if(error){
                            console.log(error);
                            return false;
                        }
                        io.sockets.in(data.room_id).emit("user_online_detail",{data:online_users});
                    });
                });
                io.sockets.in(data.room_id).emit("onlineuser",{data:onlinUser});
            }
        }else if(onlinUser==undefined || onlinUser.length==0) {
            onlinUser.push(data.username);
            io.sockets.in(data.room_id).emit("login user",{message:"welcome "+ data.username+" 进入房间 "});
            users.updateOnline(data.username,function (error,userinfo){
                if(error){
                    console.log(error);
                    return false;
                }

                //更新完毕后取得用户信息
                users.getOnline(function (error,online_users){
                    if(error){
                        console.log(error);
                        return false;
                    }
                    io.sockets.in(data.room_id).emit("user_online_detail",{data:online_users});
                });
            });
            io.sockets.in(data.room_id).emit("onlineuser",{data:onlinUser});
        }


    });
});

routes(app);
console.log("application running on " +port);

