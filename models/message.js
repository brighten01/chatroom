var mongodb = require("./db");
function Message(message) {
    this.content = message.content;
    this.room_id = message.room_id;
}


/**
 * 保存系统消息
 * @param callback
 */
Message.prototype.save = function (callback) {
    var message = {
        "content": this.content,
        "time": new Date().getTime(),
        "roomid": this.room_id
    }
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {

            mongodb.close();
            return callback(error);
        }
        db.collection("system_message", function (error, collection) {
            if (error) {
                return callback(error);
            }
            collection.insert(message, function (error, doc) {
                if (error) {
                    callback(error);
                }
                callback(null, doc);
            });
        });

    });
}

/**
 * 删除消息
 * @param message_id
 * @param callback
 */
Message.delete = function (message_id, callback) {

    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            return callback(error);
        }
        db.collection("system_message", function (error, collection) {
            if (error) {
                callback(error);
                return false;
            }
            collection.remove({"_id": message_id}, function (error) {
                if (error) {
                    callback(error);
                }

                callback(null, true);
            });
        });
    });
}

/**
 * 查询系统消息
 * @param callback
 */
Message.select = function (callback) {
    mongodb.close();
    mongodb.open(function (error, db) {
        if (error) {
            return callback(error);
        }
        db.collection("system_message", function (error, collection) {
            collection.findOne({}, function (error, doc) {
                if (error) {
                    callback(error);
                    return false;
                }
                callback(null, doc);
            });
        });
    });
}

module.exports = Message;
