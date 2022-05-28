// 京东618口令转变量 --二改自口令解析插件
//本插件与口令解析插件冲突，使用本插件需移除或禁用口令解析插件
//from https://t.me/Leven_Yi
// [rule: raw [\s\S]*[(|)|#|@|$|%|¥|￥|!|！]([0-9a-zA-Z]{10,14})[(|)|#|@|$|%|¥|￥|!|！][\s\S]*]

var jcode = param(1);

function main() {
    var ret = call("jd_cmd")(jcode)
    var exports = {}
    if (!ret) {
        return
    }
    queries = ret.queries
	if (ret.raw.indexOf("https://wbbny.m.jd.com/babelDiy/Zeus/2fUope8TDN3dUJfNzQswkBLc7uE8/index.html") != -1) {
        var temp = queries["inviteId"]
		if (temp.indexOf("-")!=-1){
			sendText("口令错了，叼毛，不是膨胀口令")
			return
		}else{
			text.push(fmt.Sprintf("ql env set PZ %s", temp))
			sendText(text)
			sendText("ql cron run jd_19EPZ_help.js")
			return
		}
    }	
    var text = []
    for (var key in exports) {
        text.push(fmt.Sprintf("export %s=\"%s\"", key, exports[key]))
    }
    if(text.length==0){
        sendText(ret.raw)
    }else{
		sendText(text.join("\n"))
    }
}

main()