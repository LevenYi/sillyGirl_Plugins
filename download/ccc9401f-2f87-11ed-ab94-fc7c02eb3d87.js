/**
* @author https://t.me/sillyGirl_Plugin
* @create_at 2022-09-10 12:49:37
* @description 默认过期资产价值超过3元即通知
* @version v1.0.1
* @title 京东资产过期提醒
* @platform qq wx tg pgm web cron
* @rule 提醒资产过期
* @cron 20 14 * * *
 * @public false
* @admin true
*/

//最小过期提醒金额（最近两天内过期红包与最近7天内过期京豆价值总和）提醒，可修改，默认过期超过3米即提醒 
const NUM=3

 


const ql=require("qinglong")
const st=require("something")

const s = sender
const sillyGirl=new SillyGirl()

function main(){
	let notify=""
	let data=(new Bucket("qinglong")).get("QLS")
	if(data==""){
		s.reply("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return
	}
	let QLS=JSON.parse(data)
	let record=[]//记录已通知pin，防止多容器存在同一账号时重复通知
	let tipid=s.reply("正在为您提醒，请稍候...")
	for(let i=0;i<QLS.length;i++){
		notify+="★"+QLS[i].name+"\n"
		if(QLS[i].disable){
			notify+="已禁用，跳过\n"
			continue
		}
		let ql_host=QLS[i].host
		let ql_client_id=QLS[i].client_id
		let ql_client_secret=QLS[i].client_secret
		let ql_token=ql.Get_QL_Token(ql_host,ql_client_id,ql_client_secret)
		if(ql_token==null){
			notify+="token获取失败,跳过\n"
			continue
		}
		var envs=ql.Get_QL_Envs(ql_host,ql_token)	
		if(envs==null){
			notify+="青龙变量获取失败，跳过"
			continue
		}
		for(j=0;j<envs.length;j++){
			if(envs[j].name=="JD_COOKIE"){
				let redpackets_data=st.JD_RedPacket(envs[j].value)
				let expirebean=st.JD_ExpireBean(envs[j].value)
				if(redpackets_data!=null&&expirebean!=null){
/*					let redpackets=redpackets_data.redList;console.log(redpackets_data)
					let overdue=0//过期红包金额统计
					for(k=0;k<redpackets.length;k++){
						let day=(new Date(redpackets[k].endTime)).getDate()
						if(day==today)
							overdue+=redpackets[k].balance
					}console.log(overdue)*/
					
					let exbeans=0//过期京豆统计
					expirebean.forEach(value=>exbeans+=value.expireamount)
					if(redpackets_data.expiredBalance=="")
						redpackets_data.expiredBalance=0
					//console.log(envs[j].value+"\n"+redpackets_data.expiredBalance+"\n"+exbeans)
					if(exbeans/100+Number(redpackets_data.expiredBalance)>=NUM){
						let pin=envs[j].value.match(/(?<=pin=)[^;]+/)[0]
						let tip="温馨提醒，您的账号【"+GetName(envs[j].value)+"】有"
						tip+=redpackets_data.expiredBalance+"元红包与"+exbeans+"京豆将于近期过期"
						//console.log(pin+tip)
						if(record.indexOf(pin)==-1){//console.log(pin+tip)
							st.NotifyCK(pin,tip)
							notify+="【"+pin+"】:"+redpackets_data.expiredBalance+"\n"
							record.push(pin)
							sleep(Math.random()*10000+10000)
						}
					}
				}
				else
					console.log(envs[j].value+"数据获取失败")
				sleep(500)
			}
		}
	}
	s.recallMessage(tipid)
	if(record.length==0)
		s.reply("无账号近期过期红包与京豆合计超过"+NUM+"元")
	else
		s.reply(notify)
}

//获取ck对应账号通知时使用的称呼
function GetName(ck){
	let pin=ck.match(/(?<=pin=)[^;]+(?=;)/g)[0]
	let userInfo=st.JD_UserInfo(ck)
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



main()