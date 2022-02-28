// [rule: 值得买?]

var key = encodeURI(param(1))
option = {
    "method": "get",
    "url": `https://search.smzdm.com/?c=faxian&s=${key}&order=time&v=b`,
}

request(option, (error, response, body) => {
    body = body.replace(/\n/g, "")
    var result = body.match(/<div class="feed-link-btn-inner">(.*?)<\/div>/g)
    var goods = []
    for (let index = 0; index < result.length; index++) {

        var name = result[index].match(/'name':'(.*?)'/)[1]
        var price = result[index].match(/'price':(\d+),/)[1]
        var link = result[index].match(/href="(.*?)"/)[1]
        goods.push(`${index+1}. ${name}\n￥${price}\n${link}`)
    }
    sendText(`为您找到${goods.length}个商品：` + "\n" + goods.join("\n"))
})