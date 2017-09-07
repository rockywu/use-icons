/**
 * Created by rocky on 2017/8/25.
 */
var fs = require("fs");
var utils = require("./utils");

/**
 * 创建文件流
 * @param content
 * @param name
 * @param unicode
 * @return Stream
 */
function iconStreamByFile(file, name, unicode, doReset) {
    var stream = null;
    try {
        if(doReset) {
            stream = utils.iconStream(fs.readFileSync(file, "utf8"), name, unicode, doReset);
        } else {
            stream = fs.createReadStream(file, "utf8");
            stream.metadata = {
                unicode : unicode,
                name: name
            };
        }
    } catch(e) {
        console.log(e);
    }
    return stream;
}

/**
 * 字体生成
 */
exports.generator = function generator(data, options, callback) {
    callback = typeof callback == "function" ? callback : function(){};
    var streams = [];
    var resetViewBoxSize = options.resetViewBoxSize === true;
    data.forEach(function(row) {
        if(row.file) {
            streams.push(iconStreamByFile(row.file, row.name || row.unicode, utils.setUnicode(row.unicode), resetViewBoxSize));
        } else if(row.content) {
            streams.push(utils.iconStream(row.content, row.name || row.unicode, utils.setUnicode(row.unicode), resetViewBoxSize));
        }
    });
    try {
        utils.makeFonts(streams, options || {}, callback);
    } catch(e) {
        callback("svg2icons generator error");
    }
}

module.exports = exports;
