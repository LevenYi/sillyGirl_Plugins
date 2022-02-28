 // [rule: 快手?]
var content = request({ url: "http://wusan0503.cn/test/getKsImgs?url=" + encodeURI(param(1)) })



var arr = new Array();  
arr=content.split(",")
var reg=/http(\S*)webp/


for (var i = 0; i < arr.length; i++) {
sendImage(reg.exec(arr[i]))
}