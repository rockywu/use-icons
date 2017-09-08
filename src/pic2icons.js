"use strict";
/**
 * Created by rocky on 2017/8/25.
 */
var Spritesmith = require("spritesmith");
var _ = require("lodash");
var fs = require("fs");
var p = __dirname + "/../templates/";

var _cssTpl = "";
/**
 * 获取css模板文件
 */
function getCssTemplate() {
    if(_cssTpl) {
        return _cssTpl;
    }
    _cssTpl = fs.readFileSync(p + "sprites.css.template", "utf8");
    return _cssTpl;
}

var _htmlTpl = "";
/**
 * 获取html模板
 */
function getHtmlTemplate() {
    if(_htmlTpl) {
        return _htmlTpl;
    }
    _htmlTpl = fs.readFileSync(p + "sprites.html.template", "utf8");
    return _htmlTpl;
}



/**
 * 雪碧图生成器
 * @param data
 * {
 *      classname : "样式名",
 *      src : "",文件路径
 * }
 * @param options
 *  {
 *      padding : 5, //间距默认为5
 *      algorithm : "binary-tree",//top-down从上到下，left-right从左到右，diagonal从左上到右下对角线，alt-diagonal反对角线，binary-tree二叉树
 *      quality : 100, //默认为100
 *      sort : false,//是否排序，默认为false
 *      imageName : "", //雪碧图图片文件名 默认为sprites.png
 *      imageUrl : "",//background-image:url图片对外路径
 *      mainClass : "class-main", //主样式名
 *      prefixClass : "" //样式前缀
 *  }
 *  @param callback
 */
exports.generator = function generator(data, options, callback) {
    var files = data.map(function(v) { return v.src});
    options = options || {};
    Spritesmith.run({
        src : files,
        padding : options.padding || 5,
        exportOpts: {
            quality: options.quality || 100
        },
        algorithm : options.algorithm || "binary-tree",
        algorithmOpts : {
            sort : options.sort === true
        }
    }, function(err, rs) {
        rs = rs || {};
        //create css ,image and demo.html
        var $SpriteImageName = options.imageName || "sprites.png";
        var $SpriteImageUrl = options.imageUrl || $SpriteImageName;
        var $SpritePrefix = options.prefixClass || "sprites-";
        var $SpriteMain = options.mainClass || "sprites";
        var $SpriteImages = [];
        data.forEach(function(row) {
            if(rs.coordinates[row.src]) {
                $SpriteImages.push(_.extend({}, rs.coordinates[row.src], {
                    classname : row.classname
                }));
            }
        });
        var templateData = {
            $SpriteImages : $SpriteImages,
            $SpriteImageName : $SpriteImageName,
            $SpriteImageUrl : $SpriteImageUrl,
            $SpriteMain : $SpriteMain,
            $SpritePrefix : $SpritePrefix
        };
        if(err) {
            callback(err);
        } else {
            callback(null, [
                {name : $SpriteImageName, content : rs.image},
                //获取css模板
                {name : "sprite.css", content : _ .template(getCssTemplate())(templateData)},
                //获取html模板
                {name : "sprite.html", content : _.template(getHtmlTemplate())(templateData)}
            ]);
        }
    });
}

module.exports = exports;
