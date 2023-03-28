/**
* @author https://t.me/sillyGirl_Plugin
* @create_at 2022-09-10 12:49:37
* @description 各种京东自动通知，具体查看备注，须安装qinglong与something模块
* @version v1.0.3
* @title 京东提醒
* @platform qq wx tg pgm web cron
* @rule 京东提醒
* @cron 36 10 * * *
 * @public false
* @admin true
*/

/*************有概率导致QQ冻结，自行配置通知项目**************/
//为降低京东限流与企鹅冻结概率，整个通知过程将花费较长时间，每个账号将花费15-25秒不等

//使用群通知，不使用群通知则设置为空""
const NotifyGroup="qq@152312983"

//【过期资产】
//通知开关
const NotifyAssets=true

//过期资产最小提醒金额
const NUM=3

//【农场领取】
//通知开关
const NotifyFarm=true

 
/********************************************************/

const ql=require("qinglong")
const st=require("something")
const NotifySetting=new Bucket("jdNotify")
const s = sender
const sillyGirl=new SillyGirl()

function main(){
	let notify=""	//管理员通知内容
	let QLS=ql.QLS()
	if(!QLS){
		s.reply("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return
	}
	let record=[]	//记录已通知pin，防止多容器存在同一账号时重复通知
	let tipid=s.reply("正在为您提醒，将花费较长时间，请耐心稍候...")
	for(let i=0;i<QLS.length;i++){
		notify+="★"+QLS[i].name+"\n"
		if(QLS[i].disable){
			notify+="已禁用，跳过\n"
			continue
		}
		let ql_host=QLS[i].host
		let ql_token=QLS[i].token
		if(!ql_token){
			notify+="token获取失败,跳过\n"
			continue
		}
		var envs=ql.Get_QL_Envs(ql_host,ql_token)	
		if(!envs){
			notify+="变量获取失败，跳过"
			continue
		}
		for(j=0;j<envs.length;j++){
			if(envs[j].name=="JD_COOKIE"){
				let pin=envs[j].value.match(/(?<=pin=)[^;]+/)[0]
				if(envs[j].status==1){
					console.log("【"+pin+"】:已禁用，可能失效")
					continue
				}
				let flag=false 	//是否需要通知
				let tip="温馨提醒，您的账号【"+GetName(envs[j].value)+"】\n"	//通知内容
				let temp=NotifySetting.get(pin)
				let setting=temp?JSON.parse(temp):null	//用户通知设置
				if(NotifyAssets){
					let redpackets_data=st.JD_RedPacket(envs[j].value)
					let expirebean=st.JD_ExpireBean(envs[j].value)
//				if(redpackets_data!=null&&expirebean!=null){
/*					let redpackets=redpackets_data.redList;console.log(redpackets_data)
					let overdue=0//过期红包金额统计
					for(k=0;k<redpackets.length;k++){
						let day=(new Date(redpackets[k].endTime)).getDate()
						if(day==today)
							overdue+=redpackets[k].balance
					}console.log(overdue)*/
					
					let exbeans=0	//临期京豆统计
					let exredpacket=0	//临期红包
					if(expirebean){
						expirebean.forEach(value=>exbeans+=Number(value.expireamount))
						console.log("【"+pin+"】临期京豆:"+exbeans)
					}
					else{
						notify+="【"+pin+"】:临期京豆数据获取失败\n"
					}
					if(redpackets_data){
						if(redpackets_data.expiredBalance)
							exredpacket=Number(redpackets_data.expiredBalance)
						else
							exredpacket=0
						console.log("【"+pin+"】临期红包:"+exredpacket)
					}
					else{
						notify+="【"+pin+"】:临期红包数据获取失败\n"
					}
				//console.log(envs[j].value+"\n"+redpackets_data.expiredBalance+"\n"+exbeans)
					if(exbeans/100+exredpacket>=NUM){
						flag=true
						tip+=exredpacket+"元红包与"+exbeans+"京豆将于近期过期\n"
						notify+="【"+pin+"】临期资产:\n红包:"+exredpacket+"\t京豆:"+exbeans+"\n"
					}
				}

				if(NotifyFarm&&(!setting||!setting.Fruit)){
					let farm_data=Farm(envs[j].value)
					if(!farm_data ||!farm_data.farmUserPro){
						notify+="【"+pin+"】:农场数据获取失败\n"
						console.log("【"+pin+"】农场数据出错\n"+JSON.stringify(farm_data))
					}
					//console.log(JSON.stringify(farm_data.farmUserPro))
					else if(farm_data.farmUserPro.treeEnergy){
						if(farm_data.farmUserPro.treeState==2 || farm_data.farmUserPro.treeState==3){
							flag=true
							tip+="东东农场水果已可兑换(可在'账号管理'关闭通知)\n"
							console.log("【"+pin+"】东东农场水果已可兑换")
						}
					}
					else{
						if(farm_data.farmUserPro.treeState==0){
							flag=true
							tip+="东东农场水果领取后未种植(可在'账号管理'关闭通知)\n"
							console.log("【"+pin+"】东东农场水果领取后未种植")	
						}
						else if(farm_data.farmUserPro.treeState==1){
							//种植中
						}
						else	
							console.log("【"+pin+"】:农场异常\n")
					}
				}

				if(flag && record.indexOf(pin)==-1){	//通知
					console.log(tip)
					if(NotifyGroup){
						let to=NotifyGroup.split("@")
						let users=st.GetBind2(pin)
						users.forEach(user=>{
							if(user.type!=to[0])
								return
							sillyGirl.push({
								platform:user.type,
								userID:user.id,
								groupCode:to[1],
								content:tip
							})
						})
					}
					else{
						st.NotifyPin(pin,tip)
					}
					record.push(pin)
				}
				sleep(Math.random() * 10000+15000)
			}
		}
	}
	//通知管理员
	if(s.getPlatform()!="cron"){
		//s.recallMessage(tipid)
		s.reply(notify)
	}
	else sillyGirl.notifyMasters(notify+"\n--京东提醒")
}


function Farm(ck){
    const JD_API_HOST = 'https://api.m.jd.com/client.action';
    option = {
	    url: `${JD_API_HOST}?functionId=initForFarm`,
        method:"post",
		headers: {
		    "accept": "*/*",
			"cookie": ck,
			"origin": "https://home.m.jd.com",
			"referer": "https://home.m.jd.com/myJd/newhome.action",
			"User-Agent": st.USER_AGENT(),
			"Content-Type": "application/x-www-form-urlencoded"
		},
        body: `body=${encodeURIComponent(JSON.stringify({
            "version": 14,
            "channel": 1,
            "babelChannel": "120"
        }))}&appid=wh5&clientVersion=9.1.0`
	};
    let resp=request(option)
    try{
        return JSON.parse(resp.body)
    }
    catch(err){
        console.log(JSON.stringify(resp))
        return null
    }
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