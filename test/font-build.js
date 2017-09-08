/**
 *
 *
 * Created by rocky on 2017/9/8.
 */
var useIcons = require("../index");
var fs = require("fs");
var ic = __dirname + "/icons/";
var out = __dirname + "/out/";
useIcons.svg2icons([{
    file : ic + "a1.svg"
},{
    file : ic + "a2.svg"
}, {
    file : ic + "a3.svg"
}], {
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
    files.forEach(function(file) {
        fs.writeFileSync(out + file.fileName + "." + file.fileType, file.content, "utf8");
    });
})
