// [rule: vip ?]
// [rule: vip ]
// 解析路线
var parseInterfaces = [{ "name": "B站1", "url": "https://vip.parwix.com:4433/player/?url=" }, { "name": "LE", "url": "https://lecurl.cn/?url=" }, { "name": "M3U8", "url": "https://jx.m3u8.tv/jiexi/?url=" }, { "name": "乐多", "url": "https://api.leduotv.com/wp-api/ifr.php?isDp=1&vid=" }, { "name": "OK", "url": "https://okjx.cc/?url=" }, { "name": "m2090", "url": "https://m2090.com/?url=" }, { "name": "51wujin", "url": "http://51wujin.net/?url=" }, { "name": "660e", "url": "https://660e.com/?url=" }, { "name": "思古", "url": "https://api.sigujx.com/?url=" }, { "name": "MUTV", "url": "https://jiexi.janan.net/jiexi/?url=" }, { "name": "百域", "url": "https://jx.618g.com/?url=" }, { "name": "云端", "url": "https://jx.ergan.top/?url=" }, { "name": "147g", "url": "https://api.147g.cc/m3u8.php?url=" }, { "name": "17kyun", "url": "http://17kyun.com/api.php?url=" }, { "name": "纯净1", "url": "https://z1.m1907.cn/?jx=" }, { "name": "爱跟", "url": "https://vip.2ktvb.com/player/?url=" }, { "name": "江湖", "url": "https://api.jhdyw.vip/?url=" }, { "name": "可乐", "url": "https://jx.keleapi.com/?url=" }, { "name": "懒猫", "url": "https://api.lanmaody.com/dm/?url=" }, { "name": "沐白", "url": "https://www.miede.top/jiexi/?url=", "t": "m" }, { "name": "RDHK", "url": "https://jx.rdhk.net/?v=" }, { "name": "听乐", "url": "https://jx.dj6u.com/?url=", "t": "m" }, { "name": "4K", "url": "https://jx.4kdv.com/?url=" }]


function main() {
  var sec = param(1);
  var i = 0
  var reg = /^((ht|f)tps?):\/\/[\w-]+(\.[\w-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/;
  var parseInterfacesName = parseInterfaces.map(function (v, i) {
    var num = i + 1
    return "" + num + "：" + v.name + ""
  }).join('\n')
  var parseInterfacesUrl = []

  while (sec == "" || sec) {
    i++
    if (i > 6) return sendText("输入错误次数过多，已退出。")
    if (sec === 'q') return sendText("已退出操作")
    if (!reg.test(sec) && !parseInterfacesUrl.length) {
      sendText("请输入正确的链接，输入q退出")
      sec = input()
    }
    else if (Number(sec) >= 0 && Number(sec) <= parseInterfaces.length) {
      sleep(1000)
      sendText("" + parseInterfacesUrl[Number(sec - 1)] + "")
      sec = input()
      return
    } else {
      !parseInterfacesUrl.length && (parseInterfacesUrl = parseInterfaces.map(function (v, i) {
        return parseInterfaces[i].url + sec
      }))
      sleep(1000)
      sendText("请您选择需要的线路(输入序号)，输入q退出\n" + parseInterfacesName + "")
      sec = input()
    }
  }

}

main()