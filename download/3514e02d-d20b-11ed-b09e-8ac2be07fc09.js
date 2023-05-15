/**
 * @author https://t.me/sillyGirl_Plugin
 * @origin Leven_Yi
 * @create_at 2023-05-01 07:35:00
 * @description 青龙推送实现一对一通知，需安装something模块
 * @version v1.0.1
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
const jdNotify=new Bucket("jdNotify") //用户通知设置(芝士)
const jddb=new Bucket("jd_cookie")

//获取通知所使用的名称所对应的pin
function getPin(account){
  let userdata=jdNotify.get(encodeURI(account))
  if(userdata)  //通知所使用的名称即为pin
    return encodeURI(account)
  else{  //没有用户设置数据，可能为昵称，通过芝士plus保存的昵称数据获取pin
    temp=jddb.get("pinName")
    if(temp){
      let pinName=JSON.parse(temp).find(obj=>obj.name==account)
      if(pinName)
        return pinName.pin
    }
  }
  console.log(account+"可能未使用傻妞登陆进行绑定")
  return null //没有用户数据，可能该账号未绑定 
}

function Notify(message){
  console.log(message)
  //过滤含关键词黑名单的消息
  if(kwb.split("&").find(kw=>message.indexOf(kw)!=-1))
    return
  //过滤不含关键词白名单的消息
  if(kwm.split("&").every(kw=>message.indexOf(kw)==-1))
    return
  //非工作时间不通知
  let now=new Date()
  let workhour=worktime.split("-")
  if(now.getHours()<Number(workhour[0]) || now.getHours()>Number(workhour[1]))
    return

  let title=message.split("\n")[0]
  let accounts=message.match(/(?<=京东账号\d*(】|\s+))\S+/g) //消息中通知的账号，可能为解码后的pin或者京东昵称
  if(!accounts)
    return
  //console.log(JSON.stringify(accounts))
  accounts.forEach(account=>{
    let pin=getPin(account)  //所通知的账号
    if(!pin)
      return
    let text=message.replace().replace(/京东账号\d*/g,"京东账号").replace(/本通知.*/,"") //通知的消息，删除其中包含的账号位置及消息推送源信息
    if(text.indexOf("东东农场日常任务")!=-1){
      let userdata=jdNotify.get(pin)
      if(!userdata){
        console.log(pin+"可能未绑定")
        return
      }
      else if(JSON.parse(userdata).Fruit){  //检查该账号所绑定的客户是否已在芝士"账号管理"设置不通知农场信息
        console.log(pin+"该用户已设置不推送农场")
        return
      }
      st.NotifyPin(pin,text)
    }
    else if(text.indexOf("失效")!=-1){  //ck可能失效
      text=text.replace(title,"")
      st.NotifyPin(pin,text)
    }
    else if(text.indexOf("保价")!=-1){
      //text=text.replace(title,"") //删除标题
      let temp=text.split(/\s(?=【?京东账号)/g)
      //console.log(pin+"\n\n"+temp.find(msg=>msg.indexOf(account)!=-1))
      st.NotifyPin(pin,temp.find(msg=>msg.indexOf(account)!=-1))
      sleep(2000)
    }
  })
}

app.post("/notify", function (req, res) {
  //console.log(req.body())
  //console.log(req.headers())
  //let message=""
  try{
    let tk=req.originalUrl().match(/(?<=token=)[^&]+/)
    if(tk && tk[0]==token){  
      let body=decodeURIComponent(req.body().split("payload=")[1]).replace(/\r/g,"").replace(/\n/g,"\\n")
      message=JSON.parse(body).text.trim()
      Notify(message)
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
