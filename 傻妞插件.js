//[rule: 傻妞插件]
var request = require('request');
var options = {
     'method': 'POST',
     'url': 'https://hi.kejiwanjia.com/wp-admin/admin-ajax.php',
     'headers': {
          'authority': 'hi.kejiwanjia.com',
          'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
          'accept': 'text/html, */*; q=0.01',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'x-requested-with': 'XMLHttpRequest',
          'sec-ch-ua-mobile': '?0',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
          'sec-ch-ua-platform': '"macOS"',
          'origin': 'https://hi.kejiwanjia.com',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-mode': 'cors',
          'sec-fetch-dest': 'empty',
          'referer': 'https://hi.kejiwanjia.com/',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
     },
     body: 'id=414&taxonomy=apps&action=load_home_tab&post_id=0'

};
request(options, function (error, response) {
     if (error || response.statusCode != 200) {
          return
     }
     var reg = /href="(.*)"\s+class="text-md overflowClip_1">([^<]+)<span class="text-xs">([^<]+)<[\s\S]*?text-muted text-xs overflowClip_1">([^<]*)/g
     var matches = response.body.match(reg)
     var lines = []
     for(var i in matches){
          reg.lastIndex = 0
          var v = reg.exec(matches[i])
          if(v){
               lines.push(`${+i+1}. ${v[2]}${v[3]}\n${v[4] ? v[4]+"\n":"" }${v[1]}`)
          }
     }
     if(lines.length){
          // console.log(lines.join("\n\n"))
          sendText(lines.join("\n\n"))
     }
});