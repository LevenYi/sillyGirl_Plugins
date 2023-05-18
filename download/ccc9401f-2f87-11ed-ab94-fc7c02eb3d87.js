/**
 * @author https://t.me/sillyGirl_Plugin
 * @create_at 2022-09-10 12:49:37
 * @description 各种京东自动通知，具体查看备注，须安装qinglong与something模块
 * @version v1.0.4
 * @title 京东提醒
 * @platform qq wx tg pgm web cron
 * @rule 京东提醒
 * @cron 36 10 * * *
 * @public false
 * @disable false
 * @admin true
*/

/*************有概率导致QQ冻结，自行配置通知项目**************/
//为降低京东限流与企鹅冻结概率，整个通知过程将花费较长时间，每个账号将花费15-25秒不等

//使用群通知，不使用群通知则设置为空""
const NotifyGroup=""

//【过期资产】
//过期京豆接口已失效，仅通知过期红包
//通知开关
const NotifyAssets=true

//过期资产最小提醒金额
const NUM=3

//【农场领取】
//通知开关
const NotifyFarm=false

 
/********************************************************/

const ql=require("qinglong")
const st=require("something")
const NotifySetting=new Bucket("jdNotify")
const s = sender
const sillyGirl=new SillyGirl()

function main(){
	let notify=""	//管理员通知内容
	let now=new Date().getTime()
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
			if(envs[j].name!="JD_COOKIE")
				continue
			//if(j==2)break
			let pin=envs[j].value.match(/(?<=pin=)[^;]+/)[0]
			if(envs[j].status==1){
				console.log("【"+pin+"】:已禁用，跳过")
				continue
			}
			let tip=""	//通知内容
			let temp=NotifySetting.get(pin)
			let setting=temp?JSON.parse(temp):null	//用户通知设置
			if(NotifyAssets){	//临期资产提醒
				let redpackets_data=JD_RedPacket(envs[j].value)
				let exredpacket=0,amount=0	//临期红包与红包总额
				if(redpackets_data && redpackets_data.length){
					redpackets_data.forEach(info=>{
						amount+=info.balance
						if(info.endTime-now<2*24*60*60*1000){	//统计两天内的过期红包金额
							exredpacket+=info.balance
						}
					})
					console.log(pin+"红包:"+amount+"-"+exredpacket)
					notify+=pin+"红包:"+formatfloat(amount,2)+"-"+formatfloat(exredpacket,2)+"\n"
					if(exredpacket>=NUM)
						tip+="温馨提醒，您的账号【"+GetName(envs[j].value)+"】\n红包余额为"+formatfloat(amount,2)+"，其中"+formatfloat(exredpacket,2)+"元红包将于近期过期\n"
				}
				else{
					console.log(pin+"红包数据获取失败或者无红包")
					notify+=pin+":红包数据获取失败或者无红包\n"
				}
			}
			if(NotifyFarm&&(!setting||!setting.Fruit)){	//东东农场提醒
				let farm_data=Farm(envs[j].value)
				if(!farm_data ||!farm_data.farmUserPro){
					notify+="【"+pin+"】:农场数据获取失败\n"
					console.log("【"+pin+"】农场数据出错\n"+JSON.stringify(farm_data))
				}
				//console.log(JSON.stringify(farm_data.farmUserPro))
				else if(farm_data.farmUserPro.treeEnergy){
					if(farm_data.farmUserPro.treeState==2 || farm_data.farmUserPro.treeState==3){
						tip+="东东农场水果已可兑换(可在'账号管理'关闭通知)\n"
					}
				}
				else{
					if(farm_data.farmUserPro.treeState==0){
						tip+="东东农场水果领取后未种植(可在'账号管理'关闭通知)\n"
					}
					else if(farm_data.farmUserPro.treeState==1){
						//种植中
					}
					else	
						console.log("【"+pin+"】:农场异常\n")
				}
			}

			if(tip && record.indexOf(pin)==-1){	//通知
				console.log(tip)
				if(NotifyGroup){	//群通知
					let to=NotifyGroup.split("@")
					let users=st.GetBind2(pin)	//获取pin所绑定的平台及用户id
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
				else{	//一对一通知
					st.NotifyPin(pin,tip)
				}
				record.push(pin)
			}
			sleep(Math.random() * 10000+15000)
		}
	}
	//通知管理员
	if(s.getPlatform()!="cron"){
		//s.recallMessage(tipid)
		s.reply(notify)
	}
	else sillyGirl.notifyMasters(notify+"\n--京东提醒")
}

//将浮点数num格式化至小数点后2位，不进行四舍五入
function formatfloat(num,decimal){
	if(!decimal)
	return num
	else
	return Math.floor(num*Math.pow(10,decimal))/Math.pow(10,decimal)
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

function JD_RedPacket(ck){
    let body={"appId":"appHongBao","appToken":"apphongbao_token","platformId":"appHongBao","platformToken":"apphongbao_token","platform":"1","orgType":"2","country":"cn","childActivityId":"-1","childActiveName":"-1","childActivityTime":"-1","childActivityUrl":"-1","openId":"-1","activityArea":"-1","applicantErp":"-1","eid":"-1","fp":"-1","shshshfp":"-1","shshshfpa":"-1","shshshfpb":"-1","jda":"-1","activityType":"1","isRvc":"-1","pageClickKey":"-1","extend":"-1","organization":"JD"}
	let resp=request({
		url:"https://api.m.jd.com//client.action?functionId=myhongbao_getUsableHongBaoList&appid=JDReactMyRedEnvelope&client=apple&clientVersion=7.0.0&jsonp=jsonp_1683977396399_26814&body="+encodeURI(JSON.stringify(body)),
        headers:{
				"Cookie": ck,
				"Referer":"https://h5.m.jd.com/",
		}
	})
	try{
		let data=JSON.parse(resp.body.match(/(?<=jsonp_\d+_\d+\().+(?=\))/)[0])
		if(data.success&&data.resultCode==200)
			return data.hongBaoList
		else{
			console.log(resp.body)
			return null
		}
	}
	catch(e){
		console.log(e)
		return null
	}
}

main()