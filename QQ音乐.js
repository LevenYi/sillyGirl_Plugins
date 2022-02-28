// [rule: QQ音乐 ?]
// [rule: qq音乐 ?]
// [rule: qqm ?]
let keyword = encodeURI(param(1))
let data = "";
let index = 0;
function main() {
    if (query(keyword, "")) {
        var content = [];
        for (i in data.data) {
            content.push((Number(i) + 1) + "." + data.data[i]);
        }
        content = content.join("\n");
        sendText(content)
        sleep(666)
        sendText("请在15s内告诉我，你要听的歌曲序号")
        let select = input(15000)
        while (select > index || select == "q" || select == "Q" || select == "") {
            if (select == "q" || select == "Q") {
                return sendText("已结束会话")
            } else if (select == "") {
                return sendText("大兄弟，你超时了")
            } else {
                sendText("哎哟，不错哦~第" + select + "号的《" + param(1) + "》是你唱的吗？我咋不知道咧？\n再给你次机会，重新选！\n或者也可以发“q”取消选择。");
                select = input(15000);
            }
        }
        if (query(keyword, select) && data.code == 1) {
            let imtype = ImType();
            if (imtype == "qq") {
                sendText("[CQ:music,type=qq,id=" + data.data.songid + "]")
            } else {
                sendText(data.data.music)
            }
        } else {
            sendText("歌曲链接获取失败！")
        }
    } else {
        sendText("音乐API暂时不可用，请稍后再试")
    }
}
main()

function query(keyword, select) {
    let newRequest = Request();
    let flag = false
    if (select == "") {
        var url = "http://ovooa.com/API/QQ_Music/?Skey=&uin=&msg=" + keyword;
    } else {
        var url = "http://ovooa.com/API/QQ_Music/?Skey=&uin=&msg=" + keyword + "&n=" + select;
    }
    let options = {
        "url": url,
        "json": true,
        "method": "GET"
    }
    newRequest(options, function (error, response) {
        if (error || response.statusCode != 200) {
            return
        } else {
            data = response.body
            index = data.length
            flag = true
        }
    });
    return flag
}