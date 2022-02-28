// [rule: 归属地? ] 归属地 手机号
function main() {
  var tel = param(1) //匹配规则第一个问号的值
  var data = request({
    // 内置http请求函数
    url:
      "https://www.mxnzp.com/api/mobile_location/aim_mobile?mobile="+tel+"&app_id=ovtyzrfpxetq8pte&app_secret=U2NtQ1pnNGtJWDRXTFNwUVlSK1gxdz09", 
    	  "method": "get", //请求方法
       "dataType": "json", //这里接口直接返回文本，所以不需要指定json类型数据
  })
  if (data["code"] == "1") {
  	sendText(data.data.carrier)
  } else {
    sendText(data.msg)
  }
}
main()
