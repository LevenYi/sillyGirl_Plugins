 // [rule: 抖音?]
var content = request({ url: "http://wusan0503.cn/test/getImgs?dyurl=" + encodeURI(param(1)) })

var arr = new Array();  
arr=content.split(",")
var reg=/https(\S*)images/

for (var i = 0; i < arr.length; i++) {
sendImage(reg.exec(arr[i]))
}