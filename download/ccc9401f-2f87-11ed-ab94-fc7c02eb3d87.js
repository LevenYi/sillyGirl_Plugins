/**
* @author https://t.me/sillyGirl_Plugin
* @create_at 2022-09-10 12:49:37
* @description 默认过期资产价值超过3元即通知
* @version v1.0.1
* @title 京东资产过期提醒
* @platform qq wx tg pgm web cron
* @rule 提醒资产过期
* @cron 0 18 * * *
* @public false
* @admin true
*/

//最小过期提醒金额（最近两天内过期红包与最近7天内过期京豆价值总和）提醒，可修改，默认过期超过3米即提醒 
const NUM=3

 



const s = sender
const sillyGirl=new SillyGirl()

function main(){
	let notify=""
	let data=(new Bucket("qinglong")).get("QLS")
	let today=(new Date).getDate()
	if(data==""){
		s.reply("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return
	}
	let QLS=JSON.parse(data)
	let record=[]//记录已通知pin，防止多容器存在同一账号时重复通知
	for(let i=0;i<QLS.length;i++){
		notify+="★"+QLS[i].name+"\n"
		if(QLS[i].disable){
			notify+="已禁用，跳过\n"
			continue
		}
		let ql_host=QLS[i].host
		let ql_client_id=QLS[i].client_id
		let ql_client_secret=QLS[i].client_secret
		let ql_token=Get_QL_Token(ql_host,ql_client_id,ql_client_secret)
		if(ql_token==null){
			notify+="token获取失败,跳过\n"
			continue
		}
		var envs=Get_QL_Envs(ql_host,ql_token)	
		if(envs==null){
			notify+="青龙变量获取失败，跳过"
			continue
		}
		for(j=0;j<envs.length;j++){
			if(envs[j].name=="JD_COOKIE"){
				let redpackets_data=JD_RedPacket(envs[j].value)
				if(redpackets_data!=null){
/*					let redpackets=redpackets_data.redList;console.log(redpackets_data)
					let overdue=0//过期红包金额统计
					for(k=0;k<redpackets.length;k++){
						let day=(new Date(redpackets[k].endTime)).getDate()
						if(day==today)
							overdue+=redpackets[k].balance
					}console.log(overdue)*/
					let expirebean=JD_ExpireBean(envs[j].value)
					let exbeans=0//过期京豆统计
					if(expirebean!=null)
						expirebean.forEach(value=>exbeans+=value.expireamount)
					//console.log(envs[j].value+"\n"+redpackets_data.expiredBalance+"\n"+exbeans)
					if(exbeans/100+Number(redpackets_data.expiredBalance)>=NUM){
						let pin=envs[j].value.match(/(?<=pin=)[^;]+/)[0]
						let tip="温馨提醒，您的账号【"+GetName(envs[j].value)+"】有"
						tip+=redpackets_data.expiredBalance+"元红包与"+exbeans+"京豆将于近期过期"
						//console.log(pin+tip)
						if(record.indexOf(pin)==-1){
							Notify_CK(pin,tip)
							notify+="【"+pin+"】:"+redpackets_data.expiredBalance+"\n"
							sleep(Math.random()*10000+10000)
						}
						else
							record.push(pin)
					}
				}
				else
					console.log(envs[j].value+"数据获取失败")
				sleep(500)
			}
		}
	}
	if(record.length==0)
		s.reply("无账号近期过期红包与京豆合计超过"+NUM+"元")
	else
		s.reply(notify)
}

//获取ck对应账号通知时使用的称呼
function GetName(ck){
	let pin=ck.match(/(?<=pin=)[^;]+(?=;)/g)[0]
	let userInfo=JD_UserInfo(ck)
	if(userInfo!=null)//直接从京东获取到昵称
		return userInfo.userInfo.baseInfo.nickname
	else{
		//从保存的昵称记录中获取昵称
		let pinNames=(new Bucket("jd_cookie")).get("pinName")
		if(pinNames!=""){
			let data=JSON.parse(pinNames)
			for(let i=0;i<data.length;i++)
				if(data[i].pin==pin)
					return data[i].name			
		}
		//未在记录中找到昵称，使用pin通知
		if(pin.indexOf("%")!=-1)
			return decodeURI(pin) //中文pin
		else
			return pin
	}
}


//向绑定pin的客户私聊发送msg
function Notify_CK(pin,msg){
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

function Get_QL_Token(host,client_id,client_secret){
	try{
		let data=request({url:host+"/open/auth/token?client_id="+client_id+"&client_secret="+client_secret})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

function Get_QL_Envs(host,token){
	try{
		let data=request({
			url:host+"/open/envs",
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			}
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

/*************京东api*************** */

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

//获取ck对应账号的数据
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

main()