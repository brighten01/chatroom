var express = require("express");
var routes = require("./routes");
var settings = require("./settings");
var path = require("path");
var http = require("http");
var info = require("./models/info");
var checkdata = new info();
var session = require('express-session');
var MongoStore = require("connect-mongo")(express);
var sessionStore = new MongoStore({
    db: settings.db
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
app.use(express.bodyParser({uploadDir: path.join(__dirname, 'public/uploadfiles')}));

app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.db,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},
    store: sessionStore
}));
var system_message = require("./models/message.js");

var port = process.env.DEFAULT_PORT || 1337;
app.use(app.router);
app.set("views", path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));
var io = require("socket.io").listen(app.listen(port));
// 设置socket.io 认证信息存储session
var users = require("./models/user.js");

var messages = [];
var onlinUser = [];
var clients = []; //根据用户区别不同的socket 客户端
var room_message = [];
io.sockets.on("connection", function (socket) {

    socket.on("getAllMessages", function (data) {
        // todo 取数据
        socket.emit("allMessages", messages);
    });

    /**
     * 发送系统消息
     */
    system_message.select(function (error, message) {
        if (message != null) {
            room_message[message._id] = socket;
            room_message[message._id].emit("system message", {message: message.content});
            //清空数组
            delete room_message[message._id];
        }
    });

    socket.on("show system message",function(data){
       if(data.roomid!=''){
           socket.join(data.roomid);
           io.sockets.in(data.roomid).emit("system message",{message:data.message});
           socket.leave(data.roomid);
        }else{
           console.log(data);
           socket.emit("system message",{message:data.message});
       }
   });
    /**
     * 设置房间
     */
    socket.on("setroom", function (data) {
        socket.room_id = data.room_id;
        socket.join(socket.room_id);
    });

    /**
     * 发送信息
     */
    socket.on("createMessage", function (message) {
        io.sockets.in(message.room_id).emit("messageAdded", message);
    });

    /**
     *  离开房间
     */
    socket.on('leave room', function (data) {
        //onlinUser = checkdata.del(onlinUser, data.username);
        socket.join(data.room_id);
        onlinUser.splice(onlinUser.indexOf(data.username), 1);
        //延迟发送
        users.deleteOnline(data.username, function (error, online_users) {
            if (error) {
                console.log(error);
                return false;
            }
            io.sockets.in(data.room_id).emit("user_online_detail", {data: online_users});
        });
        io.sockets.in(data.room_id).emit("onlineuser", {data: onlinUser});
    });

    /**
     * 登录房间
     */
    socket.on("login room", function (data) {
        console.log(data.username+"登入");
        // 推送在线用户
        socket.join(data.room_id);
        clients[data.username] = socket;
        users.getOnline(function (error, online_users) {
            if (error) {
                console.log(error);
                return false;
            }

            io.sockets.in(data.room_id).emit("user_online_detail", {data: online_users});
        });

        if (onlinUser.length > 0) {
            var flag = checkdata.find(onlinUser, data.username);
            if (flag == false) {
                onlinUser.push(data.username);
                io.sockets.in(data.room_id).emit("login user", {message: "welcome " + data.username + " 进入房间 "});
                users.updateOnline(data.username, function (error, online_users) {
                    if (error) {
                        console.log(error);
                        return false;
                    }

                    io.sockets.in(data.room_id).emit("user_online_detail", {data: online_users});
                });

            }
            io.sockets.in(data.room_id).emit("onlineuser", {data: onlinUser});
        } else if (onlinUser == undefined || onlinUser.length == 0) {
            onlinUser.push(data.username);
            io.sockets.in(data.room_id).emit("onlineuser", {data: onlinUser});
            io.sockets.in(data.room_id).emit("login user", {message: "welcome " + data.username + " 进入房间 "});
            users.updateOnline(data.username, function (error, online_users) {
                if (error) {
                    console.log(error);
                    return false;
                }
                io.sockets.in(data.room_id).emit("user_online_detail", {data: online_users});
            });

        }
    });

    //私聊

    socket.on("sayto", function (data) {
        socket.join(data.room_id);
        var from_user = data.message.from_user;
        var to_user = data.message.to_user;

        setTimeout(function () {
            clients[from_user].emit("say", {message: data});
            clients[to_user].emit("say", {message: data});
        }, 100);


    })
});

routes(app);
console.log("application running on " + port);

