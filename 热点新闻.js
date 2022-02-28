// [rule: 热点新闻 ]
// [rule: 热点 ]
var data = request({
		url: "https://www.mxnzp.com/api/news/list?typeId=525&page=1&app_id=ovtyzrfpxetq8pte&app_secret=U2NtQ1pnNGtJWDRXTFNwUVlSK1gxdz09",
		"method": "get", //请求方法
		"dataType": "json", //这里接口直接返回文本，所以不需要指定json类型数据
	})
if (data.code == "1") {
	data = data.data
	var html = ""
	data.forEach(function (e,i) {
		html += i+1 +"、"+e.title + "\n"
	})
	sendText(html)
} else {
	sendText(data.msg)
}

