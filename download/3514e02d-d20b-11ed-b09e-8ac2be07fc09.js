/**
 * @author https://t.me/sillyGirl_Plugin
 * @origin Leven_Yi
 * @create_at 2023-05-01 07:35:00
 * @description 青龙推送实现一对一通知，需安装something模块
 * @version v1.0.0
 * @title 青龙一对一通知
 * @on_start true
 * @icon https://www.expressjs.com.cn/images/favicon.png
 * @public false
 * @disable false
 */

//填写你的token
const token="leven"

//通知的消息关键词，&隔开
const kwm="农场&保价&失效"

//不通知的消息关键词，&隔开
const kwb="异常"

//通知时间(时)，非工作时间内收到青龙推送不进行通知
const worktime="8-23"

//在青龙配置文件中填写
//export CHAT_URL="http://傻妞ip及端口/notify?token="
//export CHAT_TOKEN="你设置的token"

const app = require("express")
const st=require("something")

function Notify(message){
  console.log(message)
  //过滤不通知的消息
  if(kwb.split("&").find(kw=>message.indexOf(kw)!=-1))
    return
  //非工作时间不通知
  let now=new Date()
  let workhour=worktime.split("-")
  if(now.getHours()<Number(workhour[0]) || now.getHours()>Number(workhour[1]))
    return
  let title=message.split("\n")[0]
  let account=message.match(/(?<=京东账号\d+(】|\s))\S+/) 
  //console.log(JSON.stringify(account))
  if(!account)
    return
  let pin=account[0]  //所通知的账号
  let text=message.replace().replace(/京东账号\d+/,"京东账号").replace(/本通知.*/,"") //通知的消息
  let jdNotify=new Bucket("jdNotify") //用户通知设置(芝士)
  let userdata=jdNotify.get(encodeURI(pin))
  if(!userdata){  //没有用户设置数据，可能为昵称，通过芝士plus保存的昵称数据获取pin
    temp=new Bucket("jd_cookie").get("pinName")
    if(temp){
      let pinName=JSON.parse(temp).find(obj=>obj.name==account)
      if(pinName){
        userdata=jdNotify.get(pinName.pin)
        pin=pinName.pin
      }
    }
  }
  //console.log("["+pin+"]:"+userdata)
  kwm.split("&").forEach(value=>{
    if(text.indexOf(value)==-1 || !pin)
      return
    if(text.indexOf("东东农场日常任务")!=-1){
      if(!userdata){
        console.log(pin+"可能未绑定")
        return
      }
      else if(JSON.parse(userdata).Fruit){
        console.log(pin+"该用户已设置不推送农场")
        return
      }
    }
    else if(text.indexOf("失效")){  //ck失效
      text=text.replace(title,"")
    }
    //console.log(pin)
    st.NotifyPin(pin,text)
  })
}

app.post("/notify", function (req, res) {
  //console.log(req.body())
  //console.log(req.headers())
  try{
    let body=decodeURIComponent(req.body().split("payload=")[1]).replace(/\r/g,"").replace(/\n/g,"\\n")
    let tk=req.originalUrl().match(/(?<=token=)[^&]+/)
    if(tk && tk[0]==token){
      Notify(JSON.parse(body).text.trim())
      res.json({
        success:true
      })
    }
    else
      return res.status(401).json({ error: 'Invalid token' })
   }
   catch(e){
       console.log(e)
       return res.status(401).json({ error: 'Invalid body' })
   }
})
