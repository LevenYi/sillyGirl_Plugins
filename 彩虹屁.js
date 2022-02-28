// 彩虹屁
// [rule: 彩虹屁] 
//接口ID 181
//自己去 https://www.tianapi.com/apiview/181 申请KEY替换一下
var key="abad18c3e9669de2daa0effe13a4228a"//天行数据申请的key网站https://www.tianapi.com/
function main() {
  var content = request({
    // 内置http请求函数
    "url":"http://api.tianapi.com/caihongpi/index?key="+key,//请求链接
    	  "method": "get", //请求方法
      "dataType": "json", //这里接口直接返回文本，所以不需要指定json类型数据
  })
  if (content["code"] == 200) {
  	content = content.newslist[0]
    sendText(
        content.content
    )
  } else {
    sendText(content.msg)
  }
}
main()
