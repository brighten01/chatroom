var mongodb = require("./db");

function User(user) {
    this.email = user.email;
    this.password = user.password;
    this.username = user.username;
    this.avatar = user.avatar;
    this.friend_username = "";
}
/**
 * 保存用户数据
 * @param callback
 */
User.prototype.save = function (callback) {
    mongodb.close();
    var user = {
        username: this.username,
        password: this.password,
        email: this.email,
        avatar: this.avatar
    };
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("users", function (error, collection) {
            if (error) {
                callback(error);
            }
            collection.insert(user, {safe: true}, function (error, user) {
                if (error) {
                    return callback(error);
                }
                callback(null, user);
            });
        });
    });
}

/**
 * 查找用户是否存在
 * @param username
 * @param callback
 */
User.getOne = function (username, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("users", function (error, collection) {
            collection.findOne({username: username}, function (error, user) {
                if (error) {
                    return callback(error);
                }
                callback(null, user);
            });
        });
    });
}
/**
 * 获取在线人数
 * @param room_id
 * @param callback
 */
User.getOnline = function (room_id, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {

        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("users", function (error, collection) {
            collection.find({"room_id": room_id, "online": 1}).sort({"time": -1}).toArray(function (error, userlist) {
                if (error) {
                    return callback(error);
                }
                callback(null, userlist);
            });
        });
    });

}

/**
 *删除在线人数
 * @param username
 * @param room_id
 * @param callback
 */
User.deleteOnline = function (username, room_id, callback) {
    mongodb.close();
    var _self = this;
    mongodb.open(function (error, db) {
        db.collection("users", function (error, collection) {
            collection.update({"username": username}, {$set: {"online": 0, "room_id": 0}}, function (error, doc) {
                if (error) {
                    return callback(error);
                }

                //如果是在其他页面退出则不广播
                if(room_id!=null || room_id!==undefined){
                    _self.getOnline(room_id, function (error, online_users) {
                        callback(null, online_users);
                    });
                }
            });
        });
    });
}

/**
 * 更新用户在线状态
 * @param username
 * @param room_id
 * @param callback
 */
User.updateOnline = function (username, room_id, callback) {
    mongodb.close();
    var _self = this;
    mongodb.open(function (error, db) {
        if (error) {
            callback(error);
            mongodb.close();
        }
        db.collection("users", function (error, collection) {
            collection.update({"username": username}, {$set: {"online": 1,"room_id":room_id}}, function (error, doc) {
                if (error) {
                    return callback(error);
                }
                _self.getOnline(room_id,function (error, onlin_users) {
                    return callback(null, onlin_users);
                });

            });
        });
    });
}

/**
 * 用户更改资料
 * @param username 用户名
 * @param data 数据
 * @param callback 回调函数
 */
User.modify=function (username,data ,callback){
    mongodb.close();
    data.username = username;
    mongodb.open(function (error,db){
        if(error){
            mongodb.close();
            return callback(error);
        }

     db.collection("users",function (error,collection){
            if(error){
                callback(error);
            }
            collection.update({"username":username},{$set : data},function (error,changed){
                if(error){
                    callback(error);
                }
                callback(null,changed);
            });
        });
    });
}


/**
 * 查找用户好友
 * @param username 用户名
 * @param callback 回调函数
 * //todo 在线好友在在线列表中不显示显示在好友列表中
 */
User.findFriend =function (username,callback){
    mongodb.close();
    mongodb.open(function (error,db){
        if(error){
            mongodb.close();
            return callback(error);
        }

        db.collection("users",function (error,collection){
            if(error){
                return callback(error);
            }
            collection.find({friend_username:username}).sort({time:"-1"}).toArray(function(error,docs){
                if(error){
                    callback(error);
                }
                callback(null,docs);
            });
        })
    });
}
module.exports = User;
