// 翻译翻译什么叫 xxx
// [rule: 好看的 ] 支持正则匹配
// [rule: 二次元 ]

function main() {

  var data = request({
    // 内置http请求函数
    url: "https://acg.toubiec.cn/random.php", //请求链接
    dataType: "location", //指定数据类型

  });

  sendImage(data)

}

main()
