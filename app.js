var express = require("express");
var routes = require("./routes");
var settings = require("./settings");
var path = require("path");
var http =require("http");
var MongoStore = require("connect-mongo")(express);
var flash = require("connect-flash");
var app = express();
app.use(flash());
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret:settings.cookieSecret,
    key : settings.db,
    cookie:{maxAge :1000 *60 *60 *24 *30},
    store:new MongoStore({
        db:settings.db
    })
}));
var port= process.env.DEFAULT_PORT|| 1337;
app.use(app.router);
app.set("views",path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,"public")));
var io = require("socket.io").listen(app.listen(port));
var messages = [];
io.sockets.on("connection",function (socket){
    var sessions = socket.request.sessions;
    if(sessions!="" && sessions!=undefined){
        socket.username =sessions.username;
        console.log(socket.username);
    }
    socket.on("getAllMessages",function (){
        socket.emit("allMessages",messages);
    });
    socket.on("createMessage",function (message){
        messages.push(message);
        io.sockets.emit("messageAdded",message);
    });
    socket.on('disconnect', function(){});
});

console.log("application running on " +port);
routes(app);
