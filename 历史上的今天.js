// [rule: 历史上的今天 ] 历史上的今天
function main() {
	var data = request({
		// 内置http请求函数
		url:"https://api.ooomn.com/api/history?format=json",
		method: "get", //请求方法
		dataType: "json", //这里接口直接返回文本，所以不需要指定json类型数据
	});
	if (data["code"] == "200") {
		var info = data.day+ "\n";
		var content = data["content"];
		if(content.length > 0){
			content.forEach(function (e) {
				info += e + "\n";
			});
		}
		sendText(info);
	} else {
		sendText(data.msg);
	}
}
main();
