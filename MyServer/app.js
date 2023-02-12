/*
作者:https://t.me/sillyGirl_Plugin
本服务提供两个接口：ip:port/qr-code
post:{image:base64编码数据}：生成qr.jpg
get:返回qr.jpg
*/
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;	//服务端口

app.use(express.json());

app.post('/qr-code', (req, res) => {
  let temp=req.body.image.split(",")
  const base64Data = temp.length==2?temp[1]:temp[0];
  console.log(base64Data)
  fs.writeFile("qr.jpg", base64Data, 'base64', function (err) {
    if (err) {
      res.status(500).send({ message: "Error saving image" });
    }
    res.status(200).send({ message: "Image saved successfully" });
  });
});

app.get('/qr-code', (req, res) => {
  res.sendFile(__dirname + "/qr.jpg");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
