/**
 *
 * 雪碧图生成demo
 * Created by rocky on 2017/9/8.
 */
var useIcons = require("../index");
var fs = require("fs");
var ic = __dirname + "/icons/";
var out = __dirname + "/out/";
var list = fs.readdirSync(ic);
list = list.filter(function(name) {
    return /\.(png|jpg|jpeg)$/i.test(name);
}).map(function(name) {
    return {
        file : ic + name,
        classname : name.replace(/\.(png|jpg|jpeg)$/i, "")
    };
});
useIcons.pic2icons(list, {

}, function(err, files) {
    files.forEach(function(file) {
        fs.writeFileSync(out + file.fileName + "." + file.fileType, file.content, "utf8");
    });
})
