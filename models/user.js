var mongodb = require("./db");

function User(user) {
    this.email = user.email;
    this.password = user.password;
    this.username = user.username;
}
/**
 * 保存用户数据
 * @param callback
 */
User.prototype.save = function (callback) {
    mongodb.close();

    var user = {
        username:this.username,
        password:this.password,
        email:this.email
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
           collection.insert(user
               , {safe: true}, function (error, user) {
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
                //console.log("返回用户信息");
                //console.log(user);
                callback(null, user);
            });
        });
    });
}
/**
 * 获取在线的用户
 * @param username
 * @param callback
 */
User.getOnline = function (username, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("online_user", function (error, collection) {
            collection.find({}, function (error, users) {
                if (error) {
                    return callback(error);
                }
                callback(null, users);
            });
        });
    });
}

/**
 * 删除在线用户
 * @param username
 * @param callback
 */
User.deleteOnline = function (username, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        db.collection("online_user", function (error, collection) {
            collection.remove({username: username}, function (error) {
                if (error) {
                    callback(error);
                }
                callback(null);
            });
        });
    });
}
module.exports = User;
