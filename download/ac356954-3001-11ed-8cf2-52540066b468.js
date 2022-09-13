/*
* @author https://t.me/sillyGirl_Plugin
* @module true
* @create_at 2022-09-09 16:30:33
* @description 通用工具与网络接口
* @version v1.0.0
* @title something
* @public false
*/

/******************工具函数************************* */
//获取用户uid在imtype平台所绑定的所有京东账户的pin
module.exports.GetBind=function (imtype,uid){
	let allpins=[]//傻妞中绑定该平台的所有pin
	let pin=[]//该用户所绑定pin
	let pindata=new Bucket("pin"+imtype.toUpperCase())
		allpins=pindata.keys()
		for(let i=0;i<allpins.length;i++)
			if(pindata.get(allpins[i])==uid)
				pin.push(allpins[i])
	return pin
}


//获取傻妞数据库mainkey下设置的通知渠道发送msg消息
module.exports.NotifyMainKey=function(mainKey, isGroup, msg) {
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
	//	s.reply(JSON.stringify(record))
	return record
}


//在totype群cid中通知绑定pin的客户消息msg
module.exports.NotifyCKInGroup=function (totype,cid,pin,msg){
	let find=0
	if(totype=="qq"){
		let uid=(new Bucket("pinQQ")).get(pin)
		if(uid!=""){
			find=1
		sillyGirl.push({
				platform:totype,
				userID:uid,
				groupCode:cid,
				content:msg
			})	
		}
	}
	else if(totype=="tg"){
		let uid=(new Bucket("pinTG")).get(pin)
		if(uid!=""){
			find=1
		sillyGirl.push({
				platform:totype,
				userID:uid,
				groupCode:cid,
				content:msg
			})	
		}
	}
	else if(totype=="wx"){
		let uid=(new Bucket("pinWX")).get(pin)
		if(uid!=""){
			find=1
		sillyGirl.push({
				platform:totype,
				userID:uid,
				groupCode:cid,
				content:msg
			})	
		}
	}
	return find
}

//将msg中的url转为超链接
module.exports.ToHyperLink=function(url,title,type){
/*	if(msg.search(/https?:\/\//)!=-1){
		let urls=msg.match(/https:\/\/[0-9a-zA-Z-&?=\/\.\+]+/g)
		if(urls==null)
			return msg
		else{
			for(i=0;i<urls.length;i++)
		}
	}*/
	if(type=="tg"||type=="pgm")
		return "["+title+"]("+url+")"
	else if(type=="qq")
		return "[CQ:share,url="+url+",title="+title+"]"
	else
		return "【"+title+"】\n"+url+"\n"
}



//向绑定pin的客户私聊发送msg
module.exports.NotifyCK=function(pin,msg){
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


module.exports.NotifyMasters=function(msg){
    let sillyGirl=new SillyGirl()
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

/******************京东接口************************* */
//获取ck对应账号最近days天的每一项收入
//各项收入详情[{eventMassage:活动名,amount:获得京豆数量,date:获得时间,...}]
module.exports.JD_BeanInfo=function (ck,days){
	let stop=false
	let page=1
	let info=[]//各项活动详情统计
	let limit=20
	let day=""//当前收入活动项目的日期：日
	while(!stop){
		if(--limit<0){
			console.log("资产查询疑似死循环了")
			break	
		}
		let body=escape(JSON.stringify({
			"pageSize": "100", 
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
		let data=request(options)
		if(data.status==200&&data.body.code==0){
			let beaninfo=data.body.detailList
			for(let i=0;i< beaninfo.length;i++){
				let infoday=Number(beaninfo[i].date.match(/\d+(?= )/)[0])
				if(day!=infoday){
					if(--days<0){
						stop=1
						break
					}
					day=infoday
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
module.exports.JD_ExpireBean=function (ck){
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
module.exports.JD_RedPacket=function(ck){
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

//获取ck对应账号的用户信息数据
module.exports.JD_UserInfo=function (ck){
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


/******************第三方私人接口************************* */
//京东口令解析-nolan
module.exports.NolanDecode=function (code) {
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
}


//京东口令解析-wall
module.exports.WallDecode=function (code) {
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
}

//京东口令解析-Windfgg
module.exports.WindfggDecode=function (code) {
	let data = request({
		url: "http://api.windfgg.cf/jd/code",
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Linux; U; Android 11; zh-cn; KB2000 Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 HeyTapBrowser/40.7.19.3 uuid/cddaa248eaf1933ddbe92e9bf4d72cb3",
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": "Bearer " + get("WindfggToken")
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
}



/******************tg Bot************************* */
module.exports.SendToTG=function(id,msg){
	let resp=request({
		url:"https://api.telegram.org/bot"+(new Bucket("tg")).get("token")+"/sendMessage",
		method:"post",
		body:{
			"chat_id":id,
			"parse_mode":"markdown",
			"text":msg
		}
	})
	try{		
		return JSON.parse(resp.body).ok
	}
	catch(err){
		return false
	}
}
