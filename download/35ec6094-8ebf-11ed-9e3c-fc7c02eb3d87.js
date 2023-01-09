/*
* @author https://t.me/sillyGirl_Plugin
* @create_at 2022-09-07 18:24:50
* @description 芝士功能补全，须安装something与qinglong模块
* @title 芝士plus
* @platform qq wx tg pgm sxg
* @rule raw 交换\s\d+\s\d+
* @rule raw \S+,JD_COOKIE已失效。
* @rule raw 移动\s\S+\s\d+
* @rule 备份青龙变量
* @rule 恢复青龙变量
* @rule 通知失效
* @rule 删除失效
* @rule raw 豆\d+
* @rule raw 豆\s[\d]+\s[\d]+
* @rule 保存昵称
* @rule ck去重
* @rule raw 查询\S+
* @rule 查找 ?
* @rule 查绑 ?
 * @public false
* @admin true
* @version v1.8.3
*/

/***********青龙管理******************

交换两个变量位置
例：交换 2 13

	
移动环境变量位置，支持使用变量名、序号、备注，如是JD_COOKIE变量也可使用pt_pin值
例：移动 3 1
例：移动 小号 1
例：移动 jd_zds13dfsaf 1	

备份青龙变量
数据保存位置为qinglong backup

恢复青龙变量
自动跳过与备份数据变量名变量值相同(若为JD_COOKIE变量会比较pin值)的变量

*************客户管理***************
通知特定客户ck失效
使用方式-将傻妞通知“xxx,JD_COOKIE已失效。"重新复制粘贴发回给傻妞

一键通知所有CK失效账户,默认一对一通知
如需在群组通知(降低封号风险),可使用命令"set GroupNotify ? ?“设置通知群组，例set GroupNotify qq 12345678，设置后将仅在群组通知，取消命令将设置命令中的set改为delete即可

一键删除所有处于禁用状态的CK，需具备失效ck自动禁用

************信息获取*************
获取指定账号最近一日收入详情
例：豆1，查看账号1的今日收入详情，单容器使用，若含多容器默认显示容器1
例：豆 2 1，多容器使用，查看容器2账号1的京豆今日收入详情

获取指定pin对应的昵称
例：查询jd_sdaf234dsf

查找京东昵称对应账号pin值及其所在容器位置
例：查找 张三

*/



//2022-6-9 v1.3 修复多容器重复失效账号重复通知的问题
//2022-6-9 v1.4 添加对新版青龙支持，交互优化与代码优化，并为群发失效通知添加随机延时
//2022-6-10 v1.4.1 修复'xxx,JD_COOKIE已失效。'命令无反馈的问题
//2022-6-11 v.1.4.2 修复'xxx,JD_COOKIE已失效。'部分账号匹配失败的问题,并优化交互
//2022-6-12 v1.4.3 玄学优化,可能减少了一些bug，也可能增加了一些bug
//2022-6-20 v1.5 添加青龙环境变量备份与恢复、客户Q绑导出与导入功能
//2022-6-20 v1.5.1 添加监控配置导出与导入功能，残废
//2022-6-20 v1.5.2 恢复备份自动清除备份信息，防止不良插件窃取ck
//2022-6-21 v1.5.3 修改移动ck为移动环境变量，修复青龙存在其他变量时移动京东ck时的序号问题，可用于移动其他环境变量
//2022-6-26 v1.5.4 延长通知所有客户的随机延时，以降低冻结风险
//2022-6-30 v1.5.5 修复傻妞部分规则未录入的问题
//2022-7-2 v1.6.0 添加群组通知功能
//2022-7-22 v1.7.0 添加京豆详情查看
//2022-7-25 v1.7.1 玄学优化，部分代码优化与交互优化，修改客户通知为账号昵称
//2022-7-25 v1.7.2 修复未保存客户昵称导致通知报错的问题
//2022-8-12 v1.7.3 去除导出Q绑功能，完善导出监控，可互相分享，京豆详情隐藏10豆以下收入,并修复其他一些小bug
//2022-8-14 v1.7.4 修复多容器删除失效失败问题
//2022-8-14 v1.7.5 适配最新傻妞，不再调用其他插件命令
//2022-8-15 v1.7.6 恢复青龙变量时跳过pin值相同的JD_COOKIE变量
//2022-8-30 v1.7.7 移除监控相关功能，添加根据pin获取昵称和根据昵称获取账号pin及所在容器位置的命令
//2022-9-5 v1.8.0 适配最新傻妞
//2022-9-12 v1.8.1 模块化
//2022-9-12 v1.8.2 修复部分命令多容器选择的bug
//2022-12-25 v1.8.3 更新qinglong模块token缓存机制


const s = sender
const sillyGirl=new SillyGirl()
const db= new Bucket("qinglong")

const ql=require("qinglong")
const st=require("something")
	
var ql_host=""
var ql_token=""

function main(){
	var msg=s.getContent()
	var msg_id=s.getMessageId()
	var QLS=ql.QLS()
	if(!QLS){
		s.reply("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return
	}
	if(msg.match(/^交换\s\d+\s\d+$/)!=null){
		let params=msg.split(" ")
		s.reply(Exchange_JDPin(QLS,params[1]-1,params[2]-1))
	}
	
	else if(msg.match(/^\S+,JD_COOKIE已失效。$/)!=null)
		s.reply(Notify_Again(msg.match(/^\S+(?=,)/g)))
		
	else if(msg.match(/^移动\s\S+\s\d+$/)!=null){
		let params=msg.split(" ")
		s.reply(Move_qlEnv(QLS,params[1],params[2]-1))		
	}
	
	else if(msg=="通知失效")
		s.reply(Notify_JDCK_disabled(QLS))
	
	else if(msg=="删除失效")
		s.reply(Delete_JDCK_disabled(QLS))
	
	else if(msg=="备份青龙变量")
		s.reply(Backup_qlEnv(QLS))
	
	else if(msg=="恢复青龙变量")
		s.reply(Recovery_qlEnv(QLS))
		

		
	else if(msg.match(/^豆\d+$/)!=null||msg.match(/^豆\s[\d]+\s[\d]+$/)!=null){
	//	s.recallMessage(msg_id)
		let params=msg.split(" ")
		if(params.length==3)//多容器
			s.reply(Bean_Info(QLS,params[1],params[2]))
		else{//单容器
			let param=msg.match(/\d+/)
			if(param)
				s.reply(Bean_Info(QLS,1,param[0]))
			else
				s.reply("非数字！")
		}
	}
	
	else if(msg=="保存昵称")
		s.reply(SaveJDUserName(QLS))

	else if(msg.indexOf("查询")!=-1){
		GetJDKickName(QLS,msg.match(/(?<=查询)\S+/)[0])
	}
	
	else if(msg.indexOf("查找")!=-1)
		GetJDCOOKIE(QLS,s.param(1))
	
	else if(msg=="ck去重")
		s.reply(Reduce_JDCK_Repetition(QLS))
	else if(msg.indexOf("查绑")!=-1)
		s.reply(st.GetBind(s.getPlatform(),s.param(1)).join("\n"))

	return
}

function Reduce_JDCK_Repetition(QLS){
	
}

function GetJDCOOKIE(QLS,kickname){
	console.log(kickname)
	let tipid=s.reply("正在查找，请稍等...");
	let notify=""
	let find=false
	let pinNames=(new Bucket("jd_cookie")).get("pinName")	//本地缓存昵称
	let data=[]
	if(pinNames)	//检查缓存昵称
		data=JSON.parse(pinNames)
	let temp=data.find(ele=>decodeURI(ele.pin)==kickname)
	if(temp){
		console.log("缓存昵称中找到"+temp.pin)
		//kickname=temp.pin
	}
	for(let i=0;i<QLS.length;i++){
		if(QLS[i].disable)
			continue
		notify+="容器："+QLS[i].name+"\n"
		ql_host=QLS[i].host
		ql_token=QLS[i].token
		if(!ql_token){
			notify+="容器"+QLS[i].name+"token获取失败,跳过\n"
			continue
		}
		
		let envs=ql.Get_QL_Envs(ql_host,ql_token)
		if(envs==null){
			notify+=QLS[i].name+"青龙变量获取失败，跳过"
			continue
		}
		for(let j=0;j<envs.length;j++){
			if(envs[j].name!="JD_COOKIE")
				continue
			let pt_pin=envs[j].value.match(/(?<=pt_pin=)[^;]+/g)[0]
			if(decodeURI(pt_pin)==kickname){	//直接检查pin
				console.log("pin中找到")
				notify+="序号："+(j+1)+"\npin:"+pt_pin
				find=true
				break
			}
		}
		if(find)
			continue
		
		for(let j=0;j<envs.length;j++){	
			if(envs[j].name!="JD_COOKIE")
				continue
			let pt_pin=envs[j].value.match(/(?<=pt_pin=)[^;]+/g)[0]
			let userInfo=st.JD_UserInfo(envs[j].value)
			if(userInfo){	//直接从京东获取到昵称
				if(userInfo.userInfo.baseInfo.nickname==kickname){
					console.log("京东信息中找到")
					notify+="序号："+(j+1)+"\npin:"+pt_pin
					find=true
					break

				}
			}
			else
				console.log(pt_pin+"用户信息获取失败")
			sleep(Math.random()*10000+3000)
		}
	}
	s.recallMessage(tipid)
	sleep(200)//撤回休眠，再回复，不然tg报错
	if(!find)
		s.reply("未找到使用该昵称的京东账号")	
	else
		s.reply(notify)
}

function GetJDKickName(QLS,pin){
	let pinNames=(new Bucket("jd_cookie")).get("pinName")
	if(pinNames!=""){
		let data=JSON.parse(pinNames)
		for(let i=0;i<data.length;i++)
			if(data[i].pin==pin){
				s.reply(data[i].name) 	
				return
			}		
	}
	for(let i=0;i<QLS.length;i++){
		if(QLS[i].disable)
			continue
		ql_host=QLS[i].host
		ql_token=QLS[i].token
		if(!ql_token){
			s.reply("容器"+QLS[i].name+"token获取失败,跳过\n")
			continue
		}
		
		let envs=ql.Get_QL_Envs(ql_host,ql_token)
		if(envs==null){
			s.reply(QLS[i].name+"青龙变量获取失败，跳过")
			continue
		}
		let kickname=""
		for(let j=0;j<envs.length;j++){
			let pt_pin=envs[j].value.match(/(?<=pt_pin=)[^;]+/g)
			if(pt_pin==null)
				continue
			if(pt_pin[0]==pin){
				kickname=GetName(envs[j].value)
					s.reply(kickname)
				return
			}
		}
	}
	s.reply("未找到该pin")
}

function Notify_Again(pin){
//	s.reply(pin)
	let notify=""
	let name=GetName("pt_pin="+pin+";");//s.reply(name)
	let to=st.NotifyPin(pin,"温馨提示，您的账号【"+name+"】已过期，请重新登陆")
	if(to.length!=0){
		for(let i=0;i<to.length;i++)
			notify+="已通知"+to[i].imType+"-"+to[i].uid+"\n"
	}
	else
		notify="通知"+pin+"失败，该客户未绑定傻妞"
	return notify
}
 
function Bean_Info(QLS,n,m){
	if(n>QLS.length){
		return "不存在目标容器,退出"
	}
	let info=[]//各项收入详情[{eventMassage:活动名,amount:获得京豆数量,date:获得时间,...}]
	let InfoSum=[]//各项收入统计[{eventMassage:活动名,amount:获得京豆数量统计}]	
	let increase=0,decrease=0//总收入支出
	let notify="\n-最近收入\n"
	let latest=3//最近收入项数
	ql_host=QLS[n-1].host
	ql_token=QLS[n-1].token
	if(!ql_token){
		s.reply("容器"+QLS[i].name+"token获取失败")
		return
	}
	let envs=ql.Get_QL_Envs(ql_host,ql_token)
	if(m>envs.length)
		return "查询序号大于容器变量数量，退出"
	else if(envs[m-1].name!="JD_COOKIE")
		return "查询序号变量非京东CK，退出"
	info=st.JD_BeanInfo(envs[m-1].value,1)
	if(info==null)
		return "京东数据获取失败"
	else if(info.length==0)
		return "您今日暂无收入"
		
	else{
		for(let i=0;i<info.length;i++){
			info[i].amount=Number(info[i].amount)
			let index=InfoSum.findIndex(ele=>{	//找到当前收入项在收入统计InfoSum中的位置（区别正负）
				if(ele.eventMassage!=info[i].eventMassage)
					return false
				return (ele.amount>0 && info[i].amount>0)||(ele.amount<0 && info[1].amount<0)
			})
			info[i].amount>0?increase+=info[i].amount:decrease+=info[i].amount
			if(latest-->0){//记录最近latest项收入
				notify+=info[i].amount+" "+info[i].eventMassage+" "+info[i].date.match(/(?<= )\S+/g)+"\n"
			}
			if(index==-1)
				InfoSum.push({eventMassage:info[i].eventMassage,amount:info[i].amount})
			else 
				InfoSum[index].amount+=info[i].amount
		}
	}	
	InfoSum.sort((a,b)=>a.amount-b.amount)
	
	notify="...\n"+notify+"\n"
	for(let i=0;i<InfoSum.length;i++){
		if(Math.abs(InfoSum[i].amount)>=10)
			notify=InfoSum[i].amount+" "+InfoSum[i].eventMassage+"\n"+notify
	}
	let name=""
	// if(envs[m-1].remarks) 
	// 	name=envs[m-1].remarks
	// else
		name=GetName(envs[m-1].value)
	return "-------【"+name+"】-------\n"+"★收入："+increase+"\n"+"☆支出："+Math.abs(decrease)+"\n-----------------------------------\n"+notify
}

function SaveJDUserName(QLS){
	let names=[]
	let notify=""
	let tipid=s.reply("正为您保存，请稍等...")
	for(let i=0;i<QLS.length;i++){
		ql_host=QLS[i].host
		ql_token=QLS[i].token
		if(!ql_token){
			s.reply("容器"+QLS[i].name+"token获取失败,跳过\n")
			continue
		}
		notify+="--------【"+QLS[i].name+"】--------\n"
		let envs=ql.Get_QL_Envs(ql_host,ql_token)	
		for(let j=0;j<envs.length;j++){
			if(envs[j].name=="JD_COOKIE"){
				let pin=envs[j].value.match(/(?<=pin=)[^;]+/g)[0]
				notify+="【"+pin+"】-"
				let userInfo=st.JD_UserInfo(envs[j].value)
				if(userInfo){
					let find=0
					for(let k=0;k<names.length;k++)
						if(names[k].pin==pin)
							find=1
					if(!find)
						names.push({pin:pin,name:userInfo.userInfo.baseInfo.nickname})
					notify+="【"+userInfo.userInfo.baseInfo.nickname+"】\n"
				}
				else
					notify+="京东数据获取失败\n"
			}
		}
	}
	(new Bucket("jd_cookie")).set("pinName",JSON.stringify(names))
	s.recallMessage(tipid)
	sleep(200)//撤回休眠，再回复，不然tg报错
	return "已保存:\n"+notify
}

function Recovery_qlEnv(QLS){
	let notify=""
	let data=db.get("backup")
	if(data=="")
		return "备份不存在耶"
	let backup=JSON.parse(data)
	
	let tip="您的已备份容器如下：\n"
	for(let i=0;i<backup.length;i++)
		tip+=backup[i].name+"："+backup[i].envs.length+"个变量\n"
	tip+="\n您现有容器如下：\n"
	for(let i=0;i<QLS.length;i++)
		tip+=QLS[i].name+"\n"
	s.reply(tip)
	sleep(1500)
	
	for(let i=0;i<backup.length;i++){
		let suss=null//是否成功恢复
		let addenvs=[]//将要恢复的变量
		let temp=""
		if(QLS.length>1)
			s.reply("\n请选择备份容器【"+backup[i].name+"】的恢复容器\n")
		let inp=Get_QL(QLS)
		if(inp==-1)
			return "获取QLS失败，退出"	
		if(!ql_token)
			return "容器"+QLS[i].name+"token获取失败,退出"
			
		let envs=ql.Get_QL_Envs(ql_host,ql_token)
		for(let j=0;j<backup[i].envs.length;j++){
			if(backup[i].envs[j].name=="JD_COOKIE")
				temp+=backup[i].envs[j].value+"\n"
			//if(envs.findIndex(env=>env.name==backup[i].envs[j].name&&(env.valu==backup[i].envs[j].value)))
			if(EnvExist(envs,backup[i].envs[j])){//跳过已存在变量，防止重复
				continue
			}
			else{
				addenvs.push({
					name:backup[i].envs[j].name,
					value:backup[i].envs[j].value,
					remarks:backup[i].envs[j].remark
				})
				if(backup[i].envs[i].name=="JD_COOKIE")
					notify+="恢复京东变量:"+backup[i].envs[j].value.match(/(?<=pin=)[^;]+/g)+"\n"
				else
					notify+="恢复变量:"+backup[i].envs[j].name+"\n"
			}
		}
		console.log(JSON.stringify(backup[i].envs))
//		console.log(JSON.stringify(addenvs))
//		s.reply(JSON.stringify(addenvs))
//		addenvs=JSON.parse(JSON.stringify(addenvs))//????
//		s.reply(JSON.stringify(addenvs))
		if(addenvs.length>0)
			suss=ql.Add_QL_Envs(ql_host,ql_token,addenvs)
		else{
			s.reply("该备份容器所有变量已存在于选择的容器中,已忽略")
			continue
		}
		if(suss)
			s.reply("成功恢复\n备份容器【"+backup[i].name+"】-->【"+QLS[inp].name+"】\n共"+addenvs.length+"个变量\n----------------\n"+notify)
		else
			s.reply("恢复失败") 
		sleep(3000)
	}
//	bucketSet("qinglong","backup","")//删除备份数据
	return 
}

function Backup_qlEnv(QLS){
	var data=[]//变量数据记录
	let count=0//所有变量统计
	let notify=""
	for(let i=0;i<QLS.length;i++){		
		data.push({
			name:QLS[i].name,//容器名
			envs:[]//环境变量
		})
		ql_host=QLS[i].host
		ql_token=QLS[i].token
		if(!ql_token){
			notify+="容器"+QLS[i].name+"token获取失败,跳过\n"
			continue
		}
		
		let envs=ql.Get_QL_Envs(ql_host,ql_token)
		if(envs==null){
			s.reply(QLS[i].name+"青龙变量获取失败，跳过")
			continue
		}
		for(let j=0;j<envs.length;j++){
			data[i].envs.push({
				name:envs[j].name,
				value:envs[j].value,
				remark:envs[j].remarks
				})
		}
		count+=data[i].envs.length
		notify=notify+"\n--------"+QLS[i].name+"--------\n备份"+data[i].envs.length+"个变量\n"
	}
	db.set("backup",JSON.stringify(data))
	return "共备份"+QLS.length+"个容器"+count+"个变量\n"+notify
}

function Delete_JDCK_disabled(QLS){
	let notify=""
	let count=0
	for(let j=0;j<QLS.length;j++){
		if(QLS[j].disable)
			continue
		let envsID=[]//将要删除ck的id
		let pins=[]//将要删除ck的pin
		ql_host=QLS[j].host
		ql_token=QLS[j].token
		if(!ql_token){
			notify+="容器"+QLS[i].name+"token获取失败,跳过\n"
			continue
		}
		var envs=ql.Get_QL_Envs(ql_host,ql_token)	
		if(envs==null){
			s.reply(QLS[j].name+"青龙变量获取失败，跳过")
			continue
		}
		notify=notify+"--------"+QLS[j].name+"--------\n"	

		//记录将要删除变量的id
		for(let i=0;i<envs.length;i++){
			if(envs[i].name=="JD_COOKIE"&&envs[i].status==1){
				if(envs[i]._id)
					envsID.push(envs[i]._id)
				else
					envsID.push(envs[i].id)
					pins.push(envs[i].value.match(/(?<=pt_pin=)[^;]+/g))
			}	
		}
		if(envsID.length==0){
			notify+="本容器无失效账号\n"
		}
		else{
			if(ql.Delete_QL_Envs(ql_host,ql_token,envsID)!=true)
				notify+="删除失败\n"
			else{
				notify+="删除"+(envsID.length)+"个账号\n"
				for(let i=0;i<pins.length;i++)
					notify+=pins[i]+"\n"				
			}
		}
		count+=pins.length
	}
	return "共删除"+count+"个失效账号\n\n"+notify
}

function Notify_JDCK_disabled(QLS){
	let tipid=s.reply("正在为您通知...")
	let notify=""
	let record=[]//记录已通知pin，防止多容器存在同一账号时重复通知
	let toType=(new Bucket("GroupNotify")).keys()
	let sum=0
	for(let j=0;j<QLS.length;j++){
		if(QLS[j].disable)
			continue
		ql_host=QLS[j].host
		ql_token=QLS[j].token
		if(!ql_token){
			notify+="容器"+QLS[j].name+"token获取失败,跳过\n"
			continue
		}
		var envs=ql.Get_QL_Envs(ql_host,ql_token)
		if(envs==null){
			notify+=QLS[j].name+"青龙变量获取失败，跳过"
			continue
		}
		notify=notify+"\n---------------------\n【"+QLS[j].name+"】\n"
		for(let i=0;i<envs.length;i++){
			if(envs[i].name=="JD_COOKIE"&&envs[i].status==1){
				sum++
				//console.log(envs[i].value)
				let pin=envs[i].value.match(/(?<=pt_pin=)[^;]+/)[0]
				let name=GetName(envs[i].value)//获取通知应该使用的称呼					
				if(record.indexOf(pin)==-1){//避免多容器重复通知
					notify=notify+"\n变量"+(i+1)+"【"+pin+"】\n"
					if(toType==""){//一对一通知
						let to=st.NotifyPin(pin,"温馨提示，您的账号【"+name+"】已过期，请重新登陆")
						console.log(envs[i].value+"\n失效,通知:\n"+JSON.stringify(to))
						if(to.length!=0){
							record.push(pin)//记录已通知pin
							for(let k=0;k<to.length;k++)
								notify+="★通知"+to[k].imType+"-"+to[k].uid+"成功\n"							
						}
						else
							notify+="☆通知失败，该客户未绑定傻妞\n"
//						sillyGirl.session("jd send "+pin+" "+"温馨提示，您的账号【"+name+"】已过期，请重新登陆")
						sleep(Math.random()*10000+10000)
					}
					else{//群通知
						let gn=new Bucket("GroupNotify")
						for(let k=0;k<toType.length;k++){
							let gid=gn.get(toType[k]).split("&")
							for(l=0;l<gid.length;l++)
								if(st.NotifyPinInGroup(toType[k],gid[l],pin,"温馨提示，您的账号【"+name+"】已过期，请重新登陆")){
									record.push(pin)//记录已通知pin
									notify=notify+"★通知"+toType[k]+"群"+gid[l]+"成功\n"
									sleep(Math.random()*5000+5000)
								}
								else notify=notify+"☆通知"+toType[k]+"群失败，该客户未绑定"+toType[k]+"\n"
						}
					}
				}
			}
		}
	}
	s.recallMessage(tipid)
	sleep(200)//撤回休眠，再回复，不然tg报错
	if(!record.length)
		return "您的客户全都没有失效耶~"
	else
		return "共"+sum+"个账号失效"+notify	
}

function Move_qlEnv(QLS,from,to_index){
	let notify=""
	let suss=false
	if(Get_QL(QLS)==-1)
		return "获取QLS失败"
	if(!ql_token)
		return "青龙对接失败，请检查青龙管理是否配置有误"
	let envs=ql.Get_QL_Envs(ql_host,ql_token)
	if(envs==null)
		return "青龙变量获取失败"
	if(to_index>=envs.length)
		return "目标位置有误，超出变量总数"
	if(from.match(/^\d+$/g)!=null){//使用序号移动	
		from=from-1
		if(from>=envs.length)
			return "原位置有误，超出变量总数"
		if(envs[from]._id)
			suss=ql.Move_QL_Env(ql_host,ql_token,envs[from]._id,from-1,to_index)
		else
			suss=ql.Move_QL_Env(ql_host,ql_token,envs[from].id,from-1,to_index)
		let pin=envs[from].value.match(/(?<=pin=)\S+(?=;)/g)
		if(pin!=null){
			if(!suss)
				notify="账号"+pin+" 移动失败!"				
			else
				notify="账号"+pin+" 移动成功!"			
		}
		else{
			if(!suss)
				notify="变量"+envs[from_index].name+"移动失败"			
			else
				notify="变量"+envs[from_index].name+"移动成功"				
		}
	}
	else {	//使用变量名或备注或pin(JD_COOKIE变量)移动	
		let from_index=Find_env(envs,from)
		if(from_index==-1)
			return "未找到该变量"
		console.log(`${from_index+1}\n${to_index+1}`)
		if(envs[from_index]._id)
			suss=ql.Move_QL_Env(ql_host,ql_token,envs[from_index]._id,from_index,to_index)
		else
			suss=ql.Move_QL_Env(ql_host,ql_token,envs[from_index].id,from_index,to_index)			
		let pin=envs[from_index].value.match(/(?<=pin=)\S+(?=;)/g)
		if(pin!=null){
			if(!suss)
				notify="账号"+pin+" 移动失败!"				
			else
				notify="账号"+pin+" 移动成功!"			
		}
		else{
			if(!suss)
				notify="变量"+envs[from_index].name+"移动失败"			
			else
				notify="变量"+envs[from_index].name+"移动成功"				
		}
	}
	return 	notify
}

function Exchange_JDPin(QLS,x,y){
	let notify=""
	let suss=null
	if(Get_QL(QLS)==-1)
		return "获取QLS失败"
	if(!ql_token)
		return "token获取失败,退出"
	let envs=ql.Get_QL_Envs(ql_host,ql_token)
	if(envs==null)
		return "青龙变量获取失败，跳过"
	if(envs[x]._id){
		suss=ql.Update_QL_Env(ql_host,ql_token,envs[x]._id,envs[y].name,envs[y].value,envs[y].remarks)
		if(suss!=null)
			suss=ql.Update_QL_Env(ql_host,ql_token,envs[y]._id,envs[x].name,envs[x].value,envs[x].remarks)
	}
	else{
		suss=ql.Update_QL_Env(ql_host,ql_token,envs[x].id,envs[y].name,envs[y].value,envs[y].remarks)
		if(suss!=null)
			suss=ql.Update_QL_Env(ql_host,ql_token,envs[y].id,envs[x].name,envs[x].value,envs[x].remarks)
	}
	if(suss!=null)
		return "成功交换【"+envs[x].value.match(/(?<=pin=)[^;]+/)+"】与【"+envs[y].value.match(/(?<=pin=)[^;]+/)+"】"
	else return "交换失败"
}


/****************工具函数***************/
//获取青龙,多容器选择容器
function Get_QL(QLS){
	if(QLS.length>1){
		let notify="请选择容器(输入q退出)：\n"
		for(let i=0;i<QLS.length;i++){
			notify=notify+(i+1)+"、"+QLS[i].name+"\n"
		}
		s.reply(notify)
		let inp=s.listen(15000)
		//if(inp==""||inp=="q"||inp.match(/^\d+$/g)==null||inp>QLS.length)
		if(inp==null)
			return -1
		let n=inp.getContent()
		if(n=="q"||n>QLS.length)
			return -1
		n=n-1
		try{
			ql_host=QLS[n].host
			ql_token=QLS[n].token
			return n
		}
		catch(err){
			return -1
		}
	}
	else{
		ql_host=QLS[0].host
		ql_token=QLS[0].token
		return 0
	}
}

//判断是否存在已相同环境变量
function EnvExist(envs,env){
	for(let i=0;i<envs.length;i++)
		if(envs[i].name==env.name){
			if(envs[i].value==env.value)
				return true
			else if((env.name=="JD_COOKIE"||env.name=="JD_WSCK")&&envs[i].value.indexOf(env.value.match(/pin=[^;]+/g))!=-1)
				return true
		}
	return false
}


//在环境变量中找到变量名或者备注为string，或者value含string的变量
function Find_env(envs,string){
	for(i=0;i<envs.length;i++){
		if(envs[i].value.match(/(?<=pin=)\S+(?=;)/g)==string|| envs[i].remarks==string||envs[i].name==string)
			return i
	}
	return -1
}



//获取ck对应账号通知时使用的称呼
function GetName(ck){
	let pin=ck.match(/(?<=pin=)[^;]+(?=;)/g)[0]
	//从本地缓存的昵称记录中获取昵称
	let pinNames=(new Bucket("jd_cookie")).get("pinName")
	if(pinNames){
		let data=JSON.parse(pinNames)
		for(let i=0;i<data.length;i++)
			if(data[i].pin==pin)
				return data[i].name			
	}
	else{	//从京东服务器获取昵称
		let userInfo=st.JD_UserInfo(ck)
			if(userInfo)//直接从京东获取到昵称
				return userInfo.userInfo.baseInfo.nickname
			else
				console.log(pin+"用户信息获取失败")
		sleep(time.random()*10000+3000)
	}
	//未获取到昵称，使用pin通知
	return decodeURI(pin) //中文pin
}



main()


