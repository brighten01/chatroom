var fs = require("fs");
var path = require("path");

function File() {

}


/**
 * 创建多级目录
 * @param dirpath
 * @param mode
 * @param callback
 */
File.createDir = function (dirpath, mode, callback) {
    var _self = this;
    callback = callback ||
    function () {
    };
    fs.exists(dirpath,
        function (exitsmain) {
            if (!exitsmain) {
                //目录不存在
                var pathtmp;
                var pathlist = dirpath.split("/");
                var pathlistlength = pathlist.length;
                var pathlistlengthseed = 0;
                _self.mkdir_auto_next(mode, pathlist, pathlist.length,
                    function (callresult) {
                        if (callresult) {
                            callback(true);
                        }
                        else {
                            callback(false);
                        }
                    });

            }
            else {
                callback(true);
            }

        });
}

/**
 * 异步建立文件
 * @param mode
 * @param pathlist
 * @param pathlistlength
 * @param callback
 * @param pathlistlengthseed
 * @param pathtmp
 */
File.mkdir_auto_next = function (mode, pathlist, pathlistlength, callback, pathlistlengthseed, pathtmp) {
    var _self = this;
    callback = callback ||
    function () {
    };
    if (pathlistlength > 0) {

        if (!pathlistlengthseed) {
            pathlistlengthseed = 0;
        }

        if (pathlistlengthseed >= pathlistlength) {
            callback(true);
        }
        else {

            if (pathtmp) {
                pathtmp = path.join(pathtmp, pathlist[pathlistlengthseed]);
            }
            else {
                pathtmp = pathlist[pathlistlengthseed];
            }

            fs.exists(pathtmp,
                function (exists) {
                    if (!exists) {
                        fs.mkdir(pathtmp, mode,
                            function (isok) {
                                if (!isok) {
                                    _self.mkdir_auto_next(mode, pathlist, pathlistlength,
                                        function (callresult) {
                                            callback(callresult);
                                        },
                                        pathlistlengthseed + 1, pathtmp);
                                }
                                else {
                                    callback(false);
                                }
                            });
                    }
                    else {
                        _self.mkdir_auto_next(mode, pathlist, pathlistlength,
                            function (callresult) {
                                callback(callresult);
                            },
                            pathlistlengthseed + 1, pathtmp);
                    }
                });

        }

    }
    else {
        callback(true);
    }

}
/**
 * 上传文件
 * @param sourceFile
 * @param dstFile
 * @param callback
 */
File.saveFile = function (sourceFile, dstFile, callback) {
    fs.rename(sourceFile, dstFile, function (error) {
        if (error) {
            return callback(error);
        }
        callback(true);
    });
}

module.exports = File;