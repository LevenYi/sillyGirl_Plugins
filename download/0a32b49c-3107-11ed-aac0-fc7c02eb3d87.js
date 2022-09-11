/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.0
* @create_at 2022-09-08 15:06:22
* @description jx +口令
* @title 口令解析手动版
* @platform qq wx tg pgm sxg
* @rule jx\S[\s\S]+
* @public false
* @admin true
*/

//请在消息框输入并发送：你好 佩奇
//建议同时打开浏览器控制台

//sender
const s = sender

main()



function main(){
	let uid=s.getUserId(),chatid=s.getChatId(),imType=s.getPlatform()
	let tipid=s.reply("正在解析...")
	let msg=GetContent(),JDCODE=""
	let notify="",DPS="", spy=""
	
	JDCODE=msg.slice(3)
	
	let info=NolanDecode(JDCODE)
	if(info!=null)
		DPS="\n\n--本次解析服务由Nolan提供"
	else{
		info=WallDecode(JDCODE)
		if(info!=null)
			DPS="\n\n--本次解析服务由WALL提供"
		else{
			info=WindfggDecode(JDCODE)
			if(info!=null)
				DPS="\n\n--本次解析服务由Windfgg提供"
			else{
				s.reply("解析失败")
				Continue()
				return		
			}		
		}	
	}
	
	let img=info.img
	let title=info.title
	let sharefrom=info.userName
	let url=info.jumpUrl
	RecallMessage(tipid)
	if(imType=="pgm")
		s.reply("["+title+"]("+url+")")
	else if(imType=="tg"){
		if(chatid==0)
			SendToTG(uid,"["+title+"]("+url+")")
		else
			SendToTG(cid,"["+title+"]("+url+")")			
	}
	else if(imType=="qq")
		s.reply("[CQ:share,url="+url+",title="+title+"]")
	else
		s.reply("【"+title+"】\n"+url)
		
		
	return
}


function SendToTG(id, msg) {
	request({
		url: "https://api.telegram.org/bot" + (new Bucket("tg")).get("token") + "/sendMessage",
		method: "post",
		body: {
			"chat_id": id,
			"parse_mode": "markdown",
			"text": msg
		}
	})
}


//WALL接口解析
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

//Windfgg接口解析
function WindfggDecode(code) {
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
	return null
}

//nolan接口解析
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