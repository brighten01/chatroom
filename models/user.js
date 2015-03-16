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
        username: this.username,
        password: this.password,
        email: this.email
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
 * 获取在线的用户
 * @param callback
 */
User.getOnline = function (callback) {
    mongodb.close();
    mongodb.open(function (error, db) {

        if (error) {
            mongodb.close();
            return callback(error);
        }

        db.collection("users", function (error, collection) {
          //  console.log(collection);
            collection.find({online: 1}).sort({"time":-1}).toArray(function (error,userlist){
                if(error){
                    return callback(error);
                }
                callback(null ,userlist);
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
        db.collection("users", function (error, collection) {
            collection.update({"username": username}, {$set: {"online": "0"}}, function (error, doc) {
                if(error){
                    return callback(error);
                }
                callback(null,doc);
            });
        });
    });
}

/**
 * 更新在线状态
 * @param username
 * @param callback
 */
User.updateOnline = function (username, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            callback(error);
            mongodb.close();
        }
        console.log("更新用户"+username);
        db.collection("users", function (error, collection) {
            collection.update({"username": username}, {$set:{"online":1}}, function (error, doc) {
                if(error){
                    return callback(error);
                }
                callback(null,doc);
            });
        });
    });
}

module.exports = User;
