"use strict";
/**
 * Created by rocky on 2017/8/25.
 */
var Spritesmith = require("spritesmith");
/**
 * 雪碧图生成器
 * @param data
 * {
 *      classname : "样式名",
 *      src : "",文件路径
 * }
 * @param options
 *  {
 *      padding : 20, 间距
 *      algorithm : "binary-tree",//top-down从上到下，left-right从左到右，diagonal从左上到右下对角线，alt-diagonal反对角线，binary-tree二叉树
 *      algorithmOpts : {
 *          sort : false//是否排序，默认为false
 *      }
 *  }
 *  @param callback
 */
exports.generator = function generator(data, options, callback) {
    var files = data.map(function(v) { return v.src});
    options = options || {};
    Spritesmith.run({
        src : files,
        exportOpts: {
            quality: options.quality || 100
        },
        algorithm : options.algorithm || "binary-tree",
        algorithmOpts : {
            sort : options.sort === true
        }
    }, function(err, rs) {
        rs = rs || {};
        callback(err || null, rs.coordinates, rs.properties, rs.image);
    });

}

module.exports = exports;