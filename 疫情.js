// [rule: ^疫情(.*)$]
// [rule: ?疫情]
// [cron: 10 10 * * *]
var strCode = param(1);
var isAdmin = isAdmin();
var nodeRequest = Request();
var urlTianAPI = "http://api.tianapi.com/ncov/index?key=";
var urlOtherAPI = "https://api.iyk0.com/yq/?msg=";
function tianQuery() {
    let data = ""
    let options = {
        'method': 'GET',
        "url": urlTianAPI + get("tianapi_key"),
        "json": true
    }
    nodeRequest(options, function (error, response) {
        if (error || response.statusCode != 200) {
            sendText("疫情数据查询失败")
        } else {
            data = response.body
        }
    });
    if (data.code == 230) {
        return sendText("天行API未配置，请至tianapi.com申请后对我发送以下命令\nset otto tianapi_key ?\n问号处填你的key")
    } else if (data.code != 200) {
        return sendText("疫情数据api访问失败Code：" + data.code)
    } else {
        return data
    }
}

if (isAdmin && (strCode == "" || /^推送$/.test(strCode))) {//定时或管理发起推送
    ncovNews(tianQuery(), true)
} else if (/^新闻$/.test(strCode)) {//返回新闻
    ncovNews(tianQuery(), false)
} else if (/^风险区域$/.test(strCode) || /^区域$/.test(strCode) || /^地区$/.test(strCode) || /^城市$/.test(strCode)) {//返回风险区域
    ncovAreaQuery(tianQuery())
} else if (/^数据$/.test(strCode)) {//返回数据
    ncvoDetail(tianQuery())
} else if (/^[\u4e00-\u9fa5]{2,}$/.test(strCode)) {//返回指定区域
    ncovSelectAreaQuery(strCode)
} else {
    sendText("无推送权限，不要捣乱")
}

/**
 * 回复、推送疫情新闻部分
 */

function ncovNews(obj, bool) {
    let newslist = ["疫情新闻："];
    for (i in obj.newslist) {
        for (j in obj.newslist[i].news) {
            newslist.push(obj.newslist[i].news[j].pubDateStr + "，" + obj.newslist[i].news[j].title)
        }
    }
    content = newslist.join("\n")
    if (bool) {
        var pushObj = eval('(' + get("ncov") + ')');
        for (i in pushObj) {
            message = pushObj[i]
            message["content"] = content
            push(message)
        }
        sendText("推送疫情新闻完成。")
    } else {
        sendText(content)
    }
}

/**
 * 总数据部分
 */

function ncvoDetail(obj) {
    let newslist = ["当前疫情数据："];
    newslist.push("现存确诊人数：" + obj.newslist[0].desc.currentConfirmedCount + "\n累计确诊人数：" + obj.newslist[0].desc.confirmedCount + "\n累计境外输入人数：" + obj.newslist[0].desc.suspectedCount + "\n累计治愈人数：" + obj.newslist[0].desc.curedCount + "\n累计死亡人数：" + obj.newslist[0].desc.deadCount + "\n现存无症状人数：" + obj.newslist[0].desc.seriousCount + "\n新增境外输入人数：" + obj.newslist[0].desc.suspectedIncr + "\n相比昨天现存确诊人数：" + obj.newslist[0].desc.currentConfirmedIncr + "\n相比昨天累计确诊人数：" + obj.newslist[0].desc.confirmedIncr + "\n相比昨天新增治愈人数：" + obj.newslist[0].desc.curedIncr + "\n相比昨天新增死亡人数：" + obj.newslist[0].desc.deadIncr + "\n相比昨天现存无症状人数：" + obj.newslist[0].desc.seriousIncr + "\n----疫情小贴士提醒----\n1. " + obj.newslist[0].desc.remark1 + "\n2. " + obj.newslist[0].desc.remark2 + "\n3. " + obj.newslist[0].desc.remark3 + "\n4. " + obj.newslist[0].desc.note1 + "\n5. " + obj.newslist[0].desc.note2 + "\n6. " + obj.newslist[0].desc.note3)
    content = newslist.join("\n")
    sendText(content)
}

/**
 * 风险区域部分
 */

function ncovAreaQuery(obj) {
    let newslist = ["当前风险区域如下："];
    let midArr = [];
    let highArr = [];
    for (i in obj.newslist) {
        midArr = obj.newslist[i].riskarea.mid
        highArr = obj.newslist[i].riskarea.high
    }
    if (midArr == []) { return sendText("暂无中风险区域") }
    let cutNum = 40
    let arrLength = Math.floor(midArr.length / cutNum)
    newslist.push("中风险区域：")
    if (arrLength <= 0) {
        for (i in midArr) {
            newslist.push((Number(i) + 1) + ". " + midArr[i])
        }
    } else {
        for (var i = 1; i <= arrLength; i++) {
            for (var j = cutNum * i - cutNum; j < i * cutNum; j++) {
                newslist.push((j + 1) + ". " + midArr[j])
            }
            content = newslist.join("\n")
            sendText(content)
            newslist = []
            content = ""
            sleep(2000)
            if (midArr.length - arrLength * cutNum > 0 && i == arrLength) {
                for (var k = 0; k < midArr.length - arrLength * cutNum; k++) {
                    newslist.push((j + 1) + ". " + midArr[k])
                    j++
                }
                content = newslist.join("\n")
                sendText(content)
            }
        }
    }
    if (highArr == []) { return sendText("暂无高风险区域") }
    sleep(1500)
    newslist = ["高风险区域："]
    content = ""
    for (i in highArr) {
        newslist.push((Number(i) + 1) + ". " + highArr[i])
    }
    content = newslist.join("\n");
    sendText(content)
}

/**
 * 指定区域查询
 */

function ncovSelectAreaQuery(area) {
    let options = {
        'method': 'GET',
        "url": urlOtherAPI + area,
        "json": true
    }
    nodeRequest(options, function (error, response) {
        if (error || response.statusCode != 200) {
            return content = ""
        } else {
            content = response.body
        }
    });
    if (content.code != 200) {
        sendText("暂时无法查询到“" + area + "”的相关疫情数据，请稍候重试")
    } else {
        sendText("查询地区：" + content.查询地区 + "\n目前确诊：" + content.目前确诊 + "\n死亡人数：" + content.死亡人数 + "\n治愈人数：" + content.治愈人数 + "\n新增确诊：" + content.新增确诊 + "\n现存确诊：" + content.现存确诊 + "\n现存无症状：" + content.现存无症状 + "\n更新时间：" + content.time)
    }
}