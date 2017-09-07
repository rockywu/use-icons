/**
 * 主入口
 * Created by rocky on 2017/8/25.
 */
//svg字体生成器
var svg2icons = require("./src/svg2icons");
//图片雪碧图生成器
var pic2icons = require("./src/pic2icons");
//实用工具
var utils = require("utils");

module.exports = {
    svg2icons : svg2icons.generator,
    pic2icons : pic2icons.generator,
    hex2int : utils.hex2int,
    int2hex : utils.int2hex
}
