//[rule: 微博热搜]
//[rule: 微博]
var data = request({
	url: "https://api.iyk0.com/wbr",
});
//默默吐槽依据,,,json返回的都不标准。
data = JSON.stringify(data);
data = data.replace(/"}/g, '"}qefqwqngejeq4555');
data = JSON.parse(data);
data = data.split("qefqwqngejeq4555");
var info = "";
data = data.slice(0,15)
data.forEach(function (e, i) {
	e = JSON.parse(e);
	info += i + 1 + "、" + e.title + "\n";
});
info+="默认只显示前15条热搜。"
sendText(info);
