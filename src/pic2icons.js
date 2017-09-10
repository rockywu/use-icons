"use strict";
/**
 * Created by rocky on 2017/8/25.
 */
var Spritesmith = require("spritesmith");
var template = require("lodash.template");
var fs = require("fs");
var p = __dirname + "/../templates/";
var Vinyl = require('vinyl');

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
 * 初始化文件
 * @param files
 * @return {*}
 */
function initFiles(files) {
    return files.map(function(v) {
        if(v.file) {
            return v.file;
        } else if(v.content && v.ext && v.classname && Buffer.isBuffer(v.content)) {
            return new Vinyl({
                path : v.classname + "." + v.ext,
                contents : v.content
            });
        } else {
            return null;
        }
    }).filter(function(v) {
        return v !== null;
    });
}

/**
 * 初始化数据
 * @param data
 * @return {*}
 */
function initData(data, coordinates) {
    var tmp = null;
    return data.map(function(v) {
        if(v.file) {
            tmp = coordinates[v.file] || null;
            if(tmp) {
                tmp.classname = v.classname || (v.file.replace(/([\w_-]+)\.[^\.]+$/, "") && RegExp.$1);
            }
        } else if(v.content && v.classname && Buffer.isBuffer(v.content)) {
            tmp  = coordinates[v.classname + "." + (v.ext || "png")];
            if(tmp) {
                tmp.classname = v.classname;
            }
        }
        return tmp || null;
    }).filter(function(v) {
        return v !== null;
    });
}

/**
 * 获得例子
 * @param data
 * @param options
 */
function getDemo($SpriteImages, options, imageContent) {
    //create css ,image and demo.html
    var $SpriteImageName = options.imageName || "sprites.png";
    var $SpriteImageUrl = options.imageUrl || $SpriteImageName;
    var $SpritePrefix = options.classPrefix || "sprites-";
    var $SpriteMain = options.classMain || "sprites";
    var templateData = {
        $SpriteImages : $SpriteImages,
        $SpriteImageName : $SpriteImageName,
        $SpriteImageUrl : $SpriteImageUrl,
        $SpriteMain : $SpriteMain,
        $SpritePrefix : $SpritePrefix
    };
    return [
        //图片资源
        {fileName : $SpriteImageName.replace(/\.([^\.]+)$/, ""), fileType : RegExp.$1, content : imageContent},
        //获取css模板
        {fileName : "sprites", fileType : "css", content : template(getCssTemplate())(templateData)},
        //获取html模板
        {fileName : "sprites", fileType : "html", content : template(getHtmlTemplate())(templateData)}
    ];
}

/**
 * 雪碧图生成器
 * @param data
 * {
 *      classname : "样式名",
 *      file : "",文件路径
 *      content: "",//图片文件buffer source, 当使用content时，classname必填
 *      ext : "png",//default png, 当使用content时，classname必填
 * }
 * @param options
 *  {
 *      padding : 5, //间距默认为5
 *      algorithm : "binary-tree",//top-down从上到下，left-right从左到右，diagonal从左上到右下对角线，alt-diagonal反对角线，binary-tree二叉树
 *      quality : 100, //默认为100
 *      sort : false,//是否排序，默认为false
 *      imageName : "", //雪碧图图片文件名 默认为sprites.png
 *      imageUrl : "",//background-image:url图片对外路径
 *      classMain : "class-main", //主样式名
 *      classPrefix : "" //样式前缀
 *  }
 *  @param callback
 */
exports.generator = function generator(data, options, callback) {
    var files = initFiles(data);
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
        if(err) {
            return callback(err);
        }
        rs = rs || {};
        data = initData(data, rs.coordinates);
        console.log("Sprites created");
        callback(null, getDemo(data, options, rs.image));
    });
}

module.exports = exports;
