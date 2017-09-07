"use strict";
/**
 * 操作工具类
 * Created by rocky on 2017/8/25.
 */

var svgicons2svgfont = require('svgicons2svgfont');
var svg2ttf = require('svg2ttf');
var ttf2eot = require('ttf2eot');
var ttf2woff = require('ttf2woff');
var ttf2woff2 = require('ttf2woff2');
var StringDecoder = require('string_decoder').StringDecoder;
var Stream = require("stream").PassThrough;

/**
 * 格式化编码数据
 * @param unicode 'ea01,ea02' 'ea01' 'ea01&ea02'
 */
exports.setUnicode = function setUnicode(unicode) {
    var type = unicode.indexOf("&") > 0 ? 1 : 0;
    var unicodes = [];
    var flag = false;
    unicodes = unicode.split(/[,&]/).map(function(v, k) {
        var t = exports.hex2int(v);
        if(t === true) {
            flag = true;
        }
        return String.fromCharCode(t);
    });
    if(flag === true){
        return null;
    }
    return type === 1 ? [unicodes.join("")] : unicodes;
}

/**
 * 创建图标数据流
 * @param content
 * @param name
 * @param unicode // 如['\uE002', '\uEA02'],['\uE002\uEA02'],['\uE002']支持这三种格式
 * @param doReset 是否重置画布尺寸
 * @return Stream
 */
exports.iconStream = function iconStream(content, name, unicode, doReset) {
    if(!(unicode instanceof Array)) {
        throw new Error("Function iconStream, Unicode must be an array");
    }
    var iStream = new Stream();
    if(doReset) {
        content = exports.resetViewBoxSize(content);
    }
    iStream.write(content, "utf8");
    iStream.end();
    iStream.metadata = {
        unicode : unicode,
        name : name
    };
    return iStream;
}

/**
 * SVG字体数据
 * @param iconStreams 字体数据流
 * @param options 配置选项
 * @param callback
 */
exports.makeFonts = function makeFonts(iconStreams, options, callback) {
    var parts = [];
    var decoder = new StringDecoder('utf8');
    var fontStream = new svgicons2svgfont(options);
    fontStream.on('data', function(chunk) {
        parts.push(decoder.write(chunk));
    });
    fontStream.on('finish', function() {
        var data = [];
        var svgs = parts.join('');
        data.push({
            fileType : "svg",
            content : svgs
        });
        var ttfFontBuffer = makeTTF(svgs);
        data.push({
            fileType : "ttf",
            content : new Buffer(ttfFontBuffer)
        });
        data.push({
            fileType : "eot",
            content: new Buffer(makeEOT(ttfFontBuffer))
        });
        data.push({
            fileType : "woff",
            content: new Buffer(makeWOFF(ttfFontBuffer))
        });
        data.push({
            fileType : "woff2",
            content: new Buffer(makeWOFF2(ttfFontBuffer))
        });
        callback(null, data);
    });
    iconStreams.forEach(function(v) {
        if(v !== null) {
            fontStream.write(v);
        }
    });
    fontStream.end();
}

/**
 * TTF字体数据
 * @param svgFont
 * @return
 */
function makeTTF(svgFont) {
    return svg2ttf(svgFont).buffer;
}

/**
 * EOT字体数据
 * @param ttfFontBuffer
 * @return {*}
 */
function makeEOT(ttfFontBuffer) {
    return ttf2eot(ttfFontBuffer).buffer;
}

/**
 * WOFF字体文件
 * @param ttfFontBuffer
 * @return {*}
 */
function makeWOFF(ttfFontBuffer) {
    return ttf2woff(new Uint8Array(ttfFontBuffer.buffer)).buffer;
}

/**
 * WOFF2字体文件
 * @param ttfFontBuffer
 * @return {Uint8Array}
 */
function makeWOFF2(ttfFontBuffer) {
    ttfFontBuffer = new Uint8Array(ttfFontBuffer);
    var buf = new Buffer(ttfFontBuffer.length);
    for(var i = 0, j = ttfFontBuffer.length; i < j; i++) {
        buf.writeUInt8(ttfFontBuffer[i], i);
    }
    buf = ttf2woff2(buf);
    var woff2FontBuffer = new Uint8Array(buf.length);
    for(i = 0, j = buf.length; i < j; i++) {
        woff2FontBuffer[i] = buf.readUInt8(i);
    }
    return woff2FontBuffer;
}

/**
 * 16进制数转10进制数
 * @param hexStr
 * @return {*}
 */
exports.hex2int = function hex2Int(hexStr) {
    let val = parseInt(hexStr, 16);
    return isNaN(val) ? false : val;
}

/**
 * 10进制数转16进制数
 * @param intStr
 * @return {*}
 */
exports.int2hex = function int2hex(intStr) {
    if(typeof intStr != "number") {
        return false;
    }
    try {
        return intStr.toString(16);
    } catch(e) {
        return false;
    }
}

/**
 * 传入svg文本修复当画布大小不一致时导致的何必错误
 */
exports.resetViewBoxSize = function resetViewBoxSize(content) {
    var viewBoxRE = /viewBox=[^ ]+\s+[^ "']+\s+([^ "']+)\s+([^ "']+)/;
    var widthRE = /<svg [^>]+width=([0-9\."]+)[^>]+>/;
    var heightRE = /<svg [^>]+height=([0-9\."]+)[^>]+>/;
    var replaceWidthRE = /width="[0-9\.]+(px)?"/;
    var replaceHeightRE = /height="[0-9\.]+(px)?"/;
    var w = 0, h = 0;
    //重新设置画布
    content.replace(viewBoxRE, function() {
        w = RegExp.$1;
        h = RegExp.$2;
    });
    if(w && h) {
        content = content.replace(widthRE, function(v) {
            return v.replace(replaceWidthRE, "width=\"" + w + "px\"");
        });
        content = content.replace(heightRE, function(v) {
            return v.replace(replaceHeightRE, "height=\"" + h + "px\"");
        });
    }
    return content;
}

module.exports = exports;