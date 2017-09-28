/**
 *
 * 字体生成demo
 * Created by rocky on 2017/9/8.
 */
var useIcons = require("../index");
var fs = require("fs");
var ic = __dirname + "/icons/";
var out = __dirname + "/out/";
var list = fs.readdirSync(ic);
list = list.filter(function(name) {
    return /\.svg$/.test(name);
}).map(function(v) {
    return {
        file : ic + v
    };
});
useIcons.svg2icons(list, {
    prependUnicode : true,
    resetViewBoxSize : true,
    fontHeight : 1000,
    centerHorizontally: true,
    normalize : true,
    fontOptions: [{
        family : "iconfonts",
        classname : "iconfonts"
    }, {
        family : "iconfont",
        classname : "iconfont"
    }],
}, function(err, files) {
    if(err) {
        return console.log("fonts error:", err);
    }
    files.forEach(function(file) {
        fs.writeFileSync(out + file.fileName + "." + file.fileType, file.content, "utf8");
    });
})
