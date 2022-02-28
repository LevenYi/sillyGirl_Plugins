//[rule: raw ±img=(.*)±\[(.*)\]]
//[rule: 买家秀]

if (GetContent() == "买家秀") {
     breakIn(request({
          url: "http://jiuli.xiaoapi.cn/i/mjx.php",
     }))
} else {
     sendText(image(param(1)) + "\n" + param(2))
}
