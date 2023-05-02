/**
 * @author 猫咪
 * @origin 傻妞官方
 * @create_at 2022-09-10 07:35:00
 * @description 🐮网络开发demo，基础操作演示，能懂多少看悟性。
 * @version v1.0.1
 * @title 自用接口
 * @on_start true
 * @icon https://www.expressjs.com.cn/images/favicon.png
 * @public false
 * @disable false
 */

const app = require("express")
const st=require("something")

//客户查询ip地址
app.get("/myip", (req, res) => {
    res.json({
        data: {
            ip: req.ip(),
        },
        success: true,
    })
});

function Notify(title,text){
  temp=text.match(/京东账号[^\n]*/)
  let pin=temp?temp[0].split(/】| /)[1]:""
  if(pin && title.indexOf("东东农场日常任务")!=-1 && (text.indexOf("已可领取")!=-1||text.indexOf("忘了种植")!=-1)){
    let jdNotify=new Bucket("jdNotify")
    let userdata=jdNotify.get(encodeURI(pin))
    if(!userdata){
          //console.log("昵称："+pin)
          let pinName=JSON.parse(new Bucket("jd_cookie").get("pinName"))
          let temp=pinName.find(obj=>obj.name==account)
          if(temp){
            userdata=jdNotify.get(temp.pin)
            pin=temp.pin
          }
    }
    let msg=text.replace(/京东账号\d+/,"京东账号")
    if(userdata && !JSON.parse(userdata).Fruit){
      //console.log(pin+"\n\n"+msg)
      st.NotifyPin(pin,msg)
    }
  }
  else if(title.indexOf("京东保价")!=-1){
    let msg=text.replace(/【京东账号\d+】/,"【京东账号】")
    st.NotifyPin(pin,msg)
  }
}

app.post("/notify", function (req, res) {
  //console.log(req.body())
  let body=decodeURIComponent(req.body().split("payload=")[1]).replace(/\r/g,"")
  let message=JSON.parse(body.replace(/\n/g,"\\n")).text.trim()  //原始消息，含标题、消息主体、尾戳
  let temp=message.split("\n")  
  let title=temp[0] 
  let author=temp[temp.length-1]
  //temp.splice(0,1)  //删除标题
  temp.splice(temp.length-1,1)  //删除尾戳
  let text=temp.join("\n").trim()  //消息主体
  console.log(message)
  Notify(title,text)
  res.json({
    success:true
  })
})

// 定义message接口
app.post('/msg', (req, res) => {
    const params = req.json()
    console.log(JSON.stringify(params)+"\n\n"+req.body())
    console.log(req.headers())
    console.log(req.originalUrl())
  // 获取token参数

    const temp=req.originalUrl().split("?")
    if(temp.length!=2)
        return res.status(401).json({ error: 'Invalid token' });
    let tokenStr=temp[1].split("&").find(param=>param.match(/token=/))
    if(!tokenStr)
        return res.status(401).json({ error: 'Invalid token' });
    const token=tokenStr.split("=")[1]
    console.log(token)

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
