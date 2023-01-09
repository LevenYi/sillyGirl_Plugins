/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.0
* @create_at 2022-09-08 15:06:22
* @description 查询本人绑定京东账户最近x天的收入详情，须安装something与qinglong模块，例:最近30天收入
* @title 京豆详情
* @platform qq wx tg pgm sxg
* @rule 最近\d+天收入
 * @public false
*/

const s = sender
const ql=require("qinglong")
const st=require("something")

function main(){
    let days=Number(s.getContent().match(/\d+/g)[0]);
	let QLS=ql.QLS()
	if(!QLS){
		s.reply("查询失败，请联系管理员")//未对接青龙
		return
	}
	let bind=st.GetBind(s.getPlatform(),s.getUserId())//获取该用户所绑定的pin
	if(bind.length==0){
		s.reply("获取绑定信息失败或您未绑定本平台")
		return
	}
	let notify=[]
	let notify2=[]
	let tipid=s.reply("正在查询,请稍等...");
	for(let i=0;i<QLS.length&& bind.length;i++){
		let ql_host=QLS[i].host
		let ql_token=QLS[i].token
		if(!ql_token){
			s.reply("容器"+QLS[i].name+"token获取失败,跳过\n")
			continue 
		}
		let envs=ql.Get_QL_Envs(ql_host,ql_token)
        if(envs==null)
            continue
		for(let j=0;j<envs.length && bind.length;j++){
			if(envs[j].name!="JD_COOKIE")
				continue
			for(let k=0;k<bind.length;k++){
				let pin=envs[j].value.match(/(?<=pt_pin=)[^;]+/g)
				if(pin==bind[k]){
					bind.splice(k,1)//将已通知的pin从bind删除，以免重复通知	
					if(envs[j].status==1){
						s.reply("账号【"+GetName(envs[j].value)+"】可能已失效")
						break
					}
					let info=st.JD_BeanInfo(envs[j].value,days)
					if(!info){
						s.reply("账号【"+GetName(envs[j].value+"】京豆数据获取失败"))
						break
					}
					//console.log(JSON.stringify(info))
					let infosum=[]	//各项收入统计
					let infoday=[]	//每天收入统计
					let sum=0,expire=0	//净收入与过期
					info.forEach(value=>{
						value.amount=Number(value.amount)
						sum+=value.amount	//净收入统计
						if(value.amount<0)	//过期与使用统计
							expire+=value.amount
						//各项收入项目收入统计
						let find=infosum.findIndex(ele=>{	//找到当前收入项在收入统计infosum中的位置
							if(value.eventMassage!=ele.eventMassage )
								return false
							else
								return 	 (value.amount>0 &&ele.amount>0)  || (value.amount<0&&ele.amount<0) 
						})
						//console.log(find)
						if(find==-1)
							infosum.push({eventMassage:value.eventMassage,amount:value.amount})
						else
							infosum[find].amount+=value.amount
						//每天收入统计
						let day=value.date.split(" ")[0]
						if(infoday.length){
							if(infoday[infoday.length-1].date!=day)
								infoday.push({date:day,amount:value.amount})
							else
								infoday[infoday.length-1].amount+=value.amount
						}
						else
							infoday.push({date:day,amount:value.amount})
					})
					
					let msg=""	//收入统计(活动)通知
					let msg2="" //收入统计(天)通知
					let temp="账号："+GetName(envs[j].value)+"\n"
					temp+="★净收入:"+sum+"\n☆支出:"+expire+"\n"
					temp+="---------------------------\n"
					infosum.sort((a,b)=>b.amount-a.amount)
					infosum.forEach(value=>{
						if(Math.abs(value.amount)>50)	//只输出收入超过50的项目
							msg+=value.amount+" "+value.eventMassage+"\n"
					})	
					notify.push(temp+"收入项目名\t\t收入数量\n---------------------------\n"+msg+"...")
					
					infoday.forEach(value=>{
						msg2+=value.date+ " "+value.amount+"\n"
					})
					notify2.push(temp+"日期\t\t收入数量\n---------------------------\n"+msg2)
					sleep(2000)
					break
				}
			}
		}		
	}
	notify.forEach(msg=>s.reply(msg))
	let inp=s.listen(20000)
	if(inp){
		notify2.forEach(msg=>s.reply(msg))
	}
}


//获取ck对应账号通知时使用的称呼
function GetName(ck){
	let pin=ck.match(/(?<=pin=)[^;]+(?=;)/g)
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
