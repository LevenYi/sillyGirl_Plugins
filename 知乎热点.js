//[rule: 知乎热点]
//[rule: 知乎]
request("https://www.zhihu.com/api/v4/creators/rank/hot?domain=0&period=hour", (error,response,body) => {
    let data = JSON.parse(body).data
    let hots = []

    for (let index = 0; index < data.length; index++) {
        let element = data[index];
		hots.push(`${index + 1}. ${element.question.title}\n${element.question.url}`)
    }
	sendText(hots.join("\n"))
})