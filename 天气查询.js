// 查天气-傻妞Javascripts插件开发示例
// [rule: ?天气 ] 北京天气
// [rule: 天气 ? ] 天气 北京
// [cron: 0 6 * * * ] 每天早上6点推送天气信息

function main() {
    var address = param(1) //匹配规则第一个问号的值
    var isCron = false //标记是否定时任务
    if (address == "") { //定时任务时为空，给address赋予默认值桂林
        address = "桂林"
        isCron = true
    }
    var content = request({ // 内置http请求函数
        "url": "http://hm.suol.cc/API/tq.php?msg=" + address + "&n=1", //请求链接
        "method": "get", //请求方法
        //"dataType": "json", //这里接口直接返回文本，所以不需要指定json类型数据
    })
    if (!content) {
        data = "天气接口异常。" //请求失败时，返回的文字
    }
    if (!isCron) {
        sendText(content) //主动询问时进行回复
    } else {
        push({ imType: "tg", groupCode: "-1001583071436", content: content }) //定时任务发起群组推送
    }
}

main()