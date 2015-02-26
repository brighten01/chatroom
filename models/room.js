/**
 * 房间的基本操作
 * @type {exports}
 */
var mongodb = require("./db.js");
function Room(name,room_id) {
    this.name = name;
    this.room_id = room_id;
}

module.exports = Room;
/**
 * 增加房间
 * @param callback
 */
Room.prototype.save = function (callback) {
    mongodb.close();
    var names = {
        name: this.name,
        room_id:this.room_id
    }
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }

        db.collection("rooms", function (error, collection) {
            collection.insert(names, {safe: true}, function (error, room) {
                if (error) {
                    return callback(error);
                }
                callback(null, room);
            });
        });

    });
}

/**
 * 获取聊天室
 * @param name
 * @param callback
 */
Room.get = function (name, callback) {
    mongodb.close();
    var namedata = {
        name: name
    };
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("rooms", function (error, collection) {
            collection.findOne({"name": name}, function (error, room) {
                if (error) {
                    callback(error);
                }
                callback(null, room);
            });
        });
    });
}

/**
 * 获取房间列表
 */
Room.getList = function (callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("rooms", function (error, collection) {
            collection.find().toArray(function (error,rooms){
                if(error){
                    return callback(rooms);
                }
                callback(null,rooms);
            });
        });
    });
}

/**
 * 判断房间号是否存在
 * @param name
 * @param callback
 */
Room.getOne = function (name, callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            mongodb.close();
            return callback(error);
        }
        db.collection("rooms", function (error, collection) {
            if (error) {
                callback(error);
            }

            collection.findOne({name: name}, function (error, room) {
                if (error) {
                    return callback(error);
                }
                callback(null, room);
            });

        });
    });
}

