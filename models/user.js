var mongodb = require("./db");

function User(user) {
    this.email = user.email;
    this.password = user.password;
    this.username = user.username;
    this.avatar = user.avatar;
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
 *
 * @param room_id  房间id
 * @param username 用户名用于校验好友
 * @param callback 回调函数
 */
User.getOnline = function (room_id, username, callback) {
    mongodb.close();
    var _self = this;
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
                // 更改对象
                var new_userlist = [];
                userlist.forEach(function (user, index) {
                    var isfriend;
                    _self.isFriend(username, user.username, function (error, doc) {
                        if (doc) {
                            userlist[index].isfriend = 1;
                        } else {
                            userlist[index].isfriend = 0;
                        }

                        new_userlist.push(userlist[index]);
                    });
                });
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
                if (room_id != null || room_id !== undefined) {
                    _self.getOnline(room_id, username, function (error, online_users) {
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
            collection.update({"username": username}, {$set: {"online": 1, "room_id": room_id}}, function (error, doc) {
                if (error) {
                    return callback(error);
                }
                _self.getOnline(room_id, username, function (error, onlin_users) {
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
User.modify = function (username, data, callback) {
    mongodb.close();
    data.username = username;
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }

        db.collection("users", function (error, collection) {
            if (error) {
                callback(error);
            }
            collection.update({"username": username}, {$set: data}, function (error, changed) {
                if (error) {
                    callback(error);
                }
                callback(null, changed);
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
User.findFriend = function (username, friendUser, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }

        db.collection("relationship", function (error, collection) {
            if (error) {
                return callback(error);
            }
            collection.findOne({username: username, friendUser: friendUser, isconfirm: 0}, function (error, docs) {
                if (error) {
                    return callback(error);
                }
                callback(null, docs);
            });
        })
    });
}


/**
 * 添加好友关系
 * @param username
 * @param friendUser
 * @param isconfirm
 * @param is_refuse
 * @param reason
 * @param callback
 */
User.addRelations = function (username, friendUser, isconfirm, is_refuse, reason, callback) {
    mongodb.close();
    var _self = this;
    var relationship = {
        username: username,
        friendUser: friendUser,
        isconfirm: isconfirm,
        is_refuse: is_refuse,
        reason: reason != "" ? reason : "",
        time: new Date().getTime()
    };
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("relationship", function (error, collection) {
            if (error) {
                callback(error);
            }

            _self.findFriend(username, friendUser, function (error, doc) {
                if (!doc) {
                    collection.insert(relationship, function (error, doc) {
                        if (error) {
                            callback(error);
                        }
                        //查找好友未确认的关系
                        return callback(null, doc);
                    });
                } else {
                    return callback(null, doc);
                }

            });
        });
    });
}


/**
 * 返回用户好友信息
 * @param username
 * @param callback
 */
User.friendList = function (username, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("relationship", function (error, collection) {
            if (error) {
                callback(error);
            }
            collection.find({"friendUser": username, "isconfirm": 1}).sort({time: -1}).toArray(function (error, docs) {
                if (error) {
                    return callback(error);
                }
                callback(null, docs);
            });

        });
    });
}
/**
 * 查找用户好友关系列表
 * @param username
 * @param callback
 */
User.findRelations = function (username, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("relationship", function (error, collection) {
            if (error) {
                callback(error);
            }
            collection.find({
                "username": username,
                "isconfirm": 0,
                "is_refuse": 0
            }).sort({time: -1}).toArray(function (error, docs) {
                if (error) {
                    return callback(error);
                }
                callback(null, docs);
            });

        });
    });
}

/**
 *  查找好友关系
 * @param username
 * @param friendUser
 * @param callback
 */
User.isFriend = function (username, friendUser, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("relationship", function (error, collection) {
            collection.findOne({"friendUser": friendUser, "username": username}, function (error, doc) {
                if (error) {
                    return callback(error);
                }
                if (doc) {
                    callback(null, doc);
                }
            });
        });

    });
}


/**
 * 更新好友关系 拒绝或者同意
 * @param username
 * @param friendUser
 * @param callback
 */
User.updatRelations = function (username, friendUser, isrefuse, reason, callback) {
    mongodb.close();

    var relationship = {
        username: username,
        friendUser: friendUser,
        isrefuse: isrefuse,
        reason: reason,
        isconfirm: 1,
        time:new Date().getTime()
    };

    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        //插入一条数据并且更新数据
        db.collection("relationship", function (error, collection) {
            if (isrefuse == 1) {
                collection.update({"friendUser": friendUser, "username": username, "isconfirm": 0}, {
                    $set: {
                        isconfirm: 1,
                        is_refuse: 1
                    }
                }, function (error, ischanged) {
                    callback(error, ischanged);
                });
            } else {
                collection.insert(relationship, function (error, doc) {
                    if (error) {
                        callback(error);
                    }
                    collection.update({"friendUser": username, "username": friendUser, "isconfirm": 0}, {
                        $set: {
                            isconfirm: 1,
                            is_refuse: 1
                        }
                    }, function (error, ischanged) {
                        callback(error, ischanged);
                    });

                });
            }

        });


    });
};
module.exports = User;
