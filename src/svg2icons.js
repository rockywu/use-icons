/**
 * Created by rocky on 2017/8/25.
 */
var fs = require("fs");
var utils = require("./utils");
var template = require("lodash.template");
var p = __dirname + "/../templates/";

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
 * 根据配置初始化字体数据
 */
function initData(data, options) {
    var prependUnicode = options.prependUnicode === true;
    var startUnicode = typeof options.startUnicode == "number" ? parseInt(options.startUnicode, 10) : 0xE001;
    return data.filter(function(v) {
        return !prependUnicode ? !!v.unicode && (!!v.file || !!v.content) : !!v.file || !!v.content;
    }).map(function(v) {
        //自动编号
        prependUnicode && (v.unicode = utils.int2hex(startUnicode++));
        v.classname = v.classname || v.unicode;
        return v;
    })

}

var _cssTpl = "";
/**
 * 获取css模板文件
 */
function getCssTemplate() {
    if(_cssTpl) {
        return _cssTpl;
    }
    _cssTpl = fs.readFileSync(p + "iconfonts.css.template", "utf8");
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
    _htmlTpl = fs.readFileSync(p + "iconfonts.html.template", "utf8");
    return _htmlTpl;
}

/**
 * 生成demo模板
 */
function getDemo(data, options) {
    var htmlTpl = getHtmlTemplate();
    var cssTpl = getCssTemplate();
    var source = {
        icons : data,
        fontOptions : options.fontOptions || [{
            family : "iconfonts",
            classname : "iconfonts"
        }],
        classPrefix : options.classPrefix,
        fontBaseUri : options.fontBaseUri,
        fileName : options.fileName
    };
    return [{
        fileType : "css",
        fileName : options.fileName,
        content : template(cssTpl)(source)
    }, {
        fileType : "html",
        fileName : options.fileName,
        content : template(htmlTpl)(source)
    }];
}

/**
 * 字体生成 output iconfonts
 * @param data
 * @param options //reference https://github.com/nfroidure/svgicons2svgfont#new-svgicons2svgfontstreamoptions
 * {
 *    fileName : "", //Type: String default: iconfonts, 字体文件名
 *    classPrefix : "",//css class前缀 default: "icon-", //字体样式前缀
 *    fontBaseUri : "", //字体文件路径
 *    fontOptions : [], //Type: Array default : [{family : "iconfonts", classname : "iconfonts"}]
 *
 *    resetViewBoxSize : false, //Type : Boolean Default: false, 将画布和字体调整成相同尺寸
 *    prependUnicode : false, //Type : Boolean Default: false, 自动生成unicode , default-false , The automation of module
 *    startUnicode : 0xE001, //自动开始编号, default - 0xE001, the number of the start unicode
 *    fontName : "", //required, Type: String Default value: 'iconfont',The font family name you want.
 *    fontId : "", //Type: String Default value: the options.fontName value,The font id you want.
 *    fontStyle : "", //Type: String Default value: '',The font style you want.
 *    fontWeight : "", //Type: String Default value: '',The font weight you want.
 *    fixedWidth : false, // Type: Boolean Default value: false,Creates a monospace font of the width of the largest input icon
 *    centerHorizontally : false, //Type: Boolean Default value: false,Calculate the bounds of a glyph and center it horizontally.
 *    normalize : false, //Type: Boolean Default value: false,Normalize icons by scaling them to the height of the highest icon.
 *    fontHeight : "", //Type: Number Default value: MAX(icons.height) The outputted font height (defaults to the height of the highest input icon).
 *    round : 10e12,//Type: Number Default value: 10e12 Setup SVG path rounding.
 *    descent : 0, //Type: Number Default value: 0,The font descent. It is usefull to fix the font baseline yourself.
 *    ascent : "", //Type: Number Default value: fontHeight - descent,The font ascent. Use this options only if you know what you're doing. A suitable value for this is computed for you.
 *    metadata : "", //Type: String Default value: undefined,The font metadata(https://www.w3.org/TR/SVG/metadata.html). You can set any character data in but it is the be suited place for a copyright mention.
 *    log : "",//Type: Function Default value: console.log,Allows you to provide your own logging function. Set to function(){} to impeach logging.
 * }
 * @param callback
 */
exports.generator = function generator(data, options, callback) {
    callback = typeof callback == "function" ? callback : function(){};
    var streams = [];
    var resetViewBoxSize = options.resetViewBoxSize === true;
    data = initData(data, options);
    data.forEach(function(row, k) {
        if(row.file) {
            streams.push(iconStreamByFile(row.file, row.name || row.unicode, utils.setUnicode(row.unicode), resetViewBoxSize));
        } else if(row.content) {
            streams.push(utils.iconStream(row.content, row.name || row.unicode, utils.setUnicode(row.unicode), resetViewBoxSize));
        }
    });
    //初始化部分参数
    options.classPrefix = options.classPrefix || "icon-";
    options.fontBaseUri = options.fontBaseUri || "";
    options.fileName = options.fileName || "iconfonts";
    try {
        utils.makeFonts(streams, options || {}, function(err, files) {
            files = files.map(function(v) {
                v.fileName = options.fileName;
                return v;
            });
            callback(null, files.concat(getDemo(data, options)));
        });
    } catch(e) {
        callback("svg2icons generator error");
    }
}

module.exports = exports;
