/*
* @author https://t.me/sillyGirl_Plugin
* @module true
* @create_at 2022-09-09 16:30:33
* @description 一些通用函数和网络接口以及数据
* @version v1.0.0
* @title something
 * @public false
*/

module.exports={
	NotifyPinInGroup:NotifyPinInGroup,
	NotifyPin:NotifyPin,
	NotifyMainKey:NotifyMainKey,
	NotifyMasters,NotifyMasters,
	GetBind:GetBind,
	ToHyperLink:ToHyperLink,
	ToEasyCopy:ToEasyCopy,
	formatStringLen:formatStringLen,

	JD_UserInfo:JD_UserInfo,
	JD_BeanInfo:JD_BeanInfo,
	JD_ExpireBean:JD_ExpireBean,
	JD_RedPacket:JD_RedPacket,

	WallDecode:WallDecode,
	WindfggDecode:WindfggDecode,
	NolanDecode:NolanDecode,

	SendToTG:SendToTG
}


function formatStringLen(strVal, len,padChar){
	if (!strVal) {
  	  return null
 	} 
	let pad=padChar||" "
  	let count=0
	for(let i=0;i<strVal.length;i++){
		if(strVal.charCodeAt(i)>255)
			count=count+2
		else
			count=count+1
	}
  //console.log(count)
	for(i=0;i<len-count;i++)
    strVal+=padChar
	return strVal
}

//将
function ToEasyCopy(imtype,title,msg){
	if(imtype=="pgm")
		return "**"+title+"**\n`"+msg+"`"
	else if(imtype=="tg")
		return "*"+title+"*\n`"+msg+"`"
	else
		return  "【" + title + "】\n"+msg
}

//获取imtype平台用户uid所绑定的京东账号pin
function GetBind(imtype,uid){
	let db=new Bucket("pin"+imtype.toUpperCase())
	let allpins=db.keys();
	let pin=[]
	for(let i=0;i<allpins.length;i++)
		if(db.get(allpins[i])==uid)
			pin.push(allpins[i])
	return pin
}

//管理员通知
function NotifyMasters(msg){
    let qqm=(new Bucket("qq")).get("masters")
    let ids=qqm.split("&")
    for(let i=0;i<ids.length;i++){
        sillyGirl.push({
             platform: "qq",
             userId: ids[i],
             content: msg
        })
    }
    
    let tgm=(new Bucket("tg")).get("masters")
    ids=tgm.split("&")
    for(let i=0;i<ids.length;i++){
        sillyGirl.push({
             platform: "tg",
             userId: ids[i],
             content: msg
        })
    }
    
    let wxm=(new Bucket("wx")).get("masters")
    ids=wxm.split("&")
    for(let i=0;i<ids.length;i++){
        sillyGirl.push({
             platform: "wx",
             userId: ids[i],
             content: msg
        })
    }
}

//在totype平台的群cid中向绑定京东账号pin的用户通知msg
function NotifyPinInGroup(totype,cid,pin,msg){
	let uid=(new Bucket("pin"+totype.toUpperCase())).get(pin)
	if(uid!=""){
		sillyGirl.push({
			platform:totype,
			userID:uid,
			groupCode:cid,
			content:msg
		})
		return true	
	}
	else
		return false
}

//向绑定pin的用户全平台推送msg
function NotifyPin(pin,msg){
	let to=[]
	
	let uid=(new Bucket("pinQQ")).get(pin)
	if(uid!="")
		to.push({imType:"qq",uid:uid})
	
	uid=(new Bucket("pinTG")).get(pin)
	if(uid!="")
		to.push({imType:"tg",uid:uid})
		
//	uid=bucketGet("pinPGM",pin)
//	if(uid!="")
//		to.push({imType:"pgm",uid:uid})
		
	uid=(new Bucket("pinWX")).get(pin)
	if(uid!="")
		to.push({imType:"wx",uid:uid})
		
	uid=(new Bucket("pinWXMP")).get(pin)
	if(uid!="")
		to.push({imType:"wxmp",uid:uid})
		
	uid=(new Bucket("pinSXG")).get(pin)
	if(uid!="")
		to.push({imType:"sxg",uid:uid})
		
	for(let i=0;i<to.length;i++)
	sillyGirl.push({
			platform:to[i].imType,
			userID:to[i].uid,
			content:msg,
		})
	return to
}


//获取傻妞数据库mainkey下设置的通知渠道发送msg消息
function NotifyMainKey(mainKey, isGroup, msg) {
	let record = []//记录已通知[{imType:qq/tg/wx,id:ID}]
	let NotifyTo = {
		platform: "",
		userID: "",
		groupCode: "",
		content: msg
	}
	let dbn = new Bucket(mainKey)
	let toType = dbn.keys()
	for (let i = 0; i < toType.length; i++) {
		let ids = dbn.get(toType[i]).split("&")
		NotifyTo.platform = toType[i]
		for (let j = 0; j < ids.length; j++) {
			if (isGroup)
				NotifyTo.groupCode = ids[j]
			else
				NotifyTo.userID = ids[j]
			sillyGirl.push(NotifyTo)
			record.push({ imType: toType[i], id: ids[j] })
		}
	}
	return record
}

function ToHyperLink(type,url,title){
	if(type=="tg"||type=="pgm")
		return "["+title+"]("+url+")"
	else if(type=="qq")
		return "[CQ:share,url="+url+",title="+title+"]"
	else
		return "【"+title+"】\n"+url
}

//***************京东api********************/
//获取ck对应账号的信息
function JD_UserInfo(ck){
	let resp=request({
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
	  method:"get",
//	  dataType:"json",
      headers: {
		"User-Agent": "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Cookie": ck
      }
	})
	try{
		return JSON.parse(resp.body).data
	}
	catch(err){
		return null
	}
}

//获取ck对应账号最近days天的每一项收入
//各项收入详情[{eventMassage:活动名,amount:获得京豆数量,date:获得时间,...}]
function JD_BeanInfo(ck,days){
	//console.log("获取最近"+days+"天收入")
	let stop=false
	let page=1
	let info=[]//各项活动详情统计
	let limit=50//死循环保险
	let day=""
	while(!stop){
		if(--limit<0){
//			s.reply("死循环了")
			break	
		}
		let body=escape(JSON.stringify({
			"pageSize": "200", 
			"page": page.toString()
			}
		))
		let options = {
			url: "https://api.m.jd.com/client.action?functionId=getJingBeanBalanceDetail",
			method:"post",
			dataType:"json",
			body: "body="+body+"&appid=ld",
			headers: {
				"User-Agent": "jdltapp;iPad;3.7.0;14.4;network/wifi;hasUPPay/0sillyGirl.pushNoticeIsOpen/0;lang/zh_CN;model/iPad7,5;addressid/;hasOCPay/0;appBuild/1017;supportBestPay/0;pv/4.14;apprpd/MyJD_Main;ref/MyJdMTAManager;psq/3;ads/;psn/956c074c769cd2eeab2e36fca24ad4c9e469751a|8;jdv/0|;adk/;app_device/IOS;pap/JA2020_3112531|3.7.0|IOS 14.4;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
				"Host": "api.m.jd.com",
				"Content-Type": "application/x-www-form-urlencoded",
				"Cookie": ck
			}
		}
		let data=request(options);//console.log("还剩"+limit+"次循环终止"+JSON.stringify(data.body.detailList))
		if(data.status==200&&data.body.code==0){
			let beaninfo=data.body.detailList
			for(let i=0;i< beaninfo.length;i++){
                let evenday=beaninfo[i].date.match(/\d+(?= )/)[0]
                if(evenday!=day){
					//console.log("详情：倒数第"+days+"天："+evenday+"，收入项数："+info.length)
                    day=evenday
                    if(days--<=0){
                        stop=true
                        break
                    }
                }
				info.push(beaninfo[i])
			}
		}
		else
			return null
		sleep(500)
		page++
	}
	return info	
}


//获取ck对应账号7天内过期京豆
function JD_ExpireBean(ck){
	let resp=request({
		url:`https://wq.jd.com/activep3/singjd/queryexpirejingdou?_=${Date.now()}&g_login_type=1&sceneval=2`,
		headers:{
				"Cookie": ck,
				"Referer":"https://wqs.jd.com/promote/201801/bean/mybean.html",
                "User-Agent": "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"      
		}
	})
	try{
		return JSON.parse(resp.body.slice(23, -13)).expirejingdou
	}
	catch(err){
		return null
	}	
}


//获取ck对应账号红包数据
function JD_RedPacket(ck){
	let resp=request({
		url:`https://m.jingxi.com/user/info/QueryUserRedEnvelopesV2?type=1&orgFlag=JD_PinGou_New&page=1&cashRedType=1&redBalanceFlag=1&channel=1&_=${+new Date()}&sceneval=2&g_login_type=1&g_ty=ls`,
		headers:{
				"Cookie": ck,
				"Referer":"https://st.jingxi.com/my/redpacket.shtml?newPg=App&jxsid=16156262265849285961",
                "User-Agent": "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"      
		}
	})
	try{
		let data=JSON.parse(resp.body)
		if(data.msg=="success")
			return data.data
		else
			return null
	}
	catch(err){
		return null
	}
}


/*************第三方私人api******************/
//京东口令解析-wall
function WallDecode(code) {
	let resp = request({
		url: "http://ailoveu.eu.org:19840/jCommand",
		headers: {
			"User-Agent": "Mozilla/5.0 (Linux; U; Android 11; zh-cn; KB2000 Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 HeyTapBrowser/40.7.19.3 uuid/cddaa248eaf1933ddbe92e9bf4d72cb3",
			"Content-Type": "application/json;charset=utf-8",
			"token": (new Bucket("otto")).get("WALL")
		},
		method: "post",
		dataType: "json",
		body: { "code": code }
	})
	try {//console.log(resp)
		let data = resp.body
		if (data.code == 200 && data.data != "无法解析该口令")
			return data.data
		else
			return null
	}
	catch (err) {
		return null
	}
	return null
}

//京东口令解析-Windfgg
function WindfggDecode(code) {
	let data = request({
		url: "http://api.windfgg.cf/jd/code",
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Linux; U; Android 11; zh-cn; KB2000 Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 HeyTapBrowser/40.7.19.3 uuid/cddaa248eaf1933ddbe92e9bf4d72cb3",
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": "Bearer " + (new Bucket("otto")).get("WindfggToken")
		},
		method: "post",
		dataType: "json",
		body: { "code": code }
	})
	try {
		//		s.reply(data)
		if (data.code == 200)
			return data.data
		else
			return null
	}
	catch (err) {
		return null
	}
	return null
}

//京东口令解析-nolan
function NolanDecode(code) {
	let resp = request({
		url: "https://api.nolanstore.top/JComExchange",
		method: "post",
		body: { "code": code },
		json: true
	})
	try {
		//		s.reply(resp)
		let data = JSON.parse(resp.body)
		if (data.code == 0)
			return data.data
		else
			return null
	}
	catch (err) {
		return null
	}
	return null
}


/****************tg bot API*********************/
function SendToTG(id, msg) {
	let resp=request({
		url: "https://api.telegram.org/bot" + (new Bucket("tg")).get("token") + "/sendMessage",
		method: "post",
		body: {
			"chat_id": id,
			"parse_mode": "markdown",
			"text": msg
		}
	})
	try{
		return JSON.parse(resp.body).ok
	}
	catch(err){
		return false
	}
}
