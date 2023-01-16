/*
* @author https://t.me/sillyGirl_Plugin
* @create_at 2022-09-07 18:30:34
* @description 每天自动调整变量顺序需填写相关配置,须安装somethong与qinglong模块
* @title 雨露均沾
* @platform qq wx tg pgm sxg
* @rule 动一动
* @cron 20 12 * * *
* @admin true
 * @public false
* @version v2.1.3
*/ 

//上面触发命令与定时规则可自行修改


/******************************配置区域*****************************/
//每次调整顺序时的移动数量
const MoveNum=4


//调整模式，1为欧气模式，2为雨露均沾模式
//欧气模式：随机挑选MoveNum个变量至前排
//雨露均沾模式：从最后移动MoveNum个变量至前排
const SelectMode=2


//填写位置不动的变量序号，-1表示该容器不调整顺序
//例：单容器[[1,2,3,4,5]]
//例：多容器[[1,2,3],[-1],[]]，容器1环境变量1-3不动，容器2所有变量位置不动，容器3无车头,填写容器数量及顺序必须与傻妞中的容器数量及顺序保持一致
const NotMove=[[1,2,3,4,5,6]]


//通知模式，0表示不通知，1表示通知管理员默认内容，2表示除通知管理员外再另外在客户群组通知
const NotifyMode=2	
//当上面通知模式设置为2时，在下方""中间填入自己期望的通知目标与内容
const ToCustomer={
			platform:"qq",//qq,tg
		//	groupCode:"152312983",//群id
			groupCode:"758657899",
		}
/*******************************************************************/

//2022-7-7 v1.0
//2022-7-8 v1.1 添加自定义通知渠道，减少通知内容以避免通知失败
//2022-7-8 v1.1.1 防呆加强，减少乱填配置导致错误
//2022-7-25 v1.2.0 修复黑名单变量位置恢复错误的bug，添加群组通知前移客户
//2022-7-26 v2.0.0 修改移动机制后移改前移，简化欧皇模式
//2022-7-27 v2.0.1 修复多容器报错
//2022-8-11 v2.0.2 修复非管理可使用的问题，以及一些小bug
//2022-8-12 v2.0.3 代码统一
//2022-9-5 v2.1.0 适配最新版傻妞
//2022-9-12 v2.1.3 模块化


const ql=require("qinglong")
const st=require("something")

const sillyGirl=new SillyGirl()
const s = sender
function main(){ 
	let Notify="",notify=""//管理员通知与客户通知
	
	let QLS=JSON.parse((new Bucket("qinglong")).get("QLS"))
	if(QLS.length!=NotMove.length){
		SendNotify("傻妞配置青龙容器数量与插件配置容器数量不一致","")
		return
	}
	
	for(let i=0;i<NotMove.length;i++)//将notmove排序便于后续处理
		NotMove[i].sort(function(a,b){return a-b})	
	Notify+="您配置的不动变量为：\n"	
	for(let i=0;i<NotMove.length;i++){
		Notify+="容器1："
		for(let j=0;j<NotMove[i].length;j++)
			Notify+=NotMove[i][j]+" "
		Notify+="\n"
	}
	
//	Notify+="开始调整青龙变量顺序\n"
	for(let i=0;i<QLS.length;i++){
		let move=[]//将要移动的变量
		let fp=0//前移目标位置
		Notify+="\n--------【"+QLS[i].name+"】--------\n"
		if(NotMove[i].length==1&&NotMove[i][0]==-1){
			Notify+="\n容器移动配置为-1，跳过\n"
			continue
		}
		let ql_token=ql.Get_QL_Token(QLS[i].host,QLS[i].client_id,QLS[i].client_secret)
		if(ql_token==null){
			Notify+="\n容器获取token失败，跳过\n"
			continue
		}
//		s.reply(JSON.stringify(ql_token))
		let envs=ql.Get_QL_Envs(QLS[i].host,ql_token)
		if(envs==null){
			Notify+="\n容器获取变量失败，跳过\n"
			continue
		}
		
		let flag=0
		for(let j=0;j<NotMove[i].length;j++)
			if(NotMove[i][j]>envs.length){
				Notify+="\n容器配置错误，不动序号中"+NotMove[i][j]+"大于容器变量数量，跳过本容器，请修改插件配置\n"
				flag=1
				break
			}
		if(flag)
			continue
				
		for (let j=0;j<envs.length;j++)//前排找到第一个非不动变量,即前移目标位置
			if(NotMove[i][j]-1!=j){
				fp=j
				break
			}
		//记录将要移动的变量（非禁用状态）并从大到小排序	
		if(SelectMode==1){	//欧气模式
			let stop=false;limit=100
			while(move.length<MoveNum&&!stop){
				if(limit--<0)
					stop=true
				let index=RandomExcept(0,envs.length,NotMove[i])
				if(index==null)//始终找不到符合条件的数值，可能配置填写有误
					stop=true
				else
					if(move.indexOf(index)==-1&&envs[index].status!=1)//防止随机到同一个变量
						move.push(index)				
			}
			if(stop){
				SendNotify("在"+envs.length+"个变量中找不到"+MoveNum+"个符合移动条件的变量，请检查是否不动变量和移动变量填写太多")
			}
			move.sort((a,b)=>{return b-a})
			Notify+="欧皇们原位置为 "+move.toString()+"\n"
		}
		else if(SelectMode==2){//雨露均沾模式
			for(let j=envs.length-1;j>=0;j--){
				if(NotMove[i].indexOf(j+1)==-1 && envs[j].status!=1 &&envs[j].name=="JD_COOKIE")
					move.push(j)
				if(move.length==MoveNum)
					break
			}
		}
		
		//移动
		Notify+="以下变量移动至前排\n"
		notify+="以下账号移动至前排\n"	
//		let backup=Backup_NotMoveEnvOrder(NotMove[i],envs)//备份移动之前不动变量及其位置[{order:位置,name:变量名,value:变量值}]	
		for(let j=move.length-1;j>=0;j--){//从前往后将移动变量移至前排，以免导致未移动变量位置改变
//		console.log(envs[move[j]].value.match(/(?<=pt_pin=)[^;]+/g)+":"+envs[move[j]]._id+":"+move[j]+"-->"+fp+"\n")
			if(envs[move[j]].id){
				if(ql.Move_QL_Env(QLS[i].host,ql_token,envs[move[j]].id,move[j],fp)!=null){
					if(envs[move[j]].name=="JD_COOKIE"){
						Notify+="京东账号【"+envs[move[j]].value.match(/(?<=pt_pin=)[^;]+/g)+"】\n"//管理员通知，使用pin
						notify+="京东账号【"+GetName(envs[move[j]].value)+"】\n"//客户通知，使用昵称
					}
					else
						Notify+="青龙变量【"+envs[move[j]].name+"】\n"	
				}
				else
					Notify+="变量"+envs[move[j]].name+":"+envs[move[j]].value+"移动失败"
			}										
			else{
				if(ql.Move_QL_Env(QLS[i].host,ql_token,envs[move[j]]._id,move[j],fp)!=null){
					if(envs[move[j]].name=="JD_COOKIE"){
						Notify+="京东账号【"+envs[move[j]].value.match(/(?<=pt_pin=)[^;]+/g)+"】\n"//管理员通知，使用pin
						notify+="京东账号【"+GetName(envs[move[j]].value)+"】\n"//客户通知，使用昵称
					}
					else
						Notify+="青龙变量【"+envs[move[j]].name+"】\n"	
				}
				else
					Notify+="变量"+envs[move[j]].name+":"+envs[move[j]].value+"移动失败"				
			}
			sleep(500)
		}
		//复原调整顺序后导致的不动变量位置变化
		Notify+=Recovery_NotMoveEnvOrder(NotMove[i],envs,QLS[i].host,ql_token)
	}
	//通知
	SendNotify(Notify,notify)
	return
}


function Recovery_NotMoveEnvOrder(notmove,backup,ql_host,ql_token){
	let notify=""
	let envs=ql.Get_QL_Envs(ql_host,ql_token)//获取容器当前变量信息
	for(let i=0;i<notmove.length;i++){
		for(let j=notmove[i]-1;j<envs.length;j++){
			if(envs[j].name==backup[notmove[i]-1].name&&envs[j].value==backup[notmove[i]-1].value&&j!=notmove[i]-1){
				//console.log(`恢复位置${envs[j].value}:${j}-->${notmove[i]-1}`)
				if(envs[j].id){
					if(ql.Move_QL_Env(ql_host,ql_token,envs[j].id,j,notmove[i]-1)==null)
						notify+="变量"+backup[notmove[i]].name+":"+backup[notmove[i]].value+"恢复失败\n"					
				}
				else {
					if(ql.Move_QL_Env(ql_host,ql_token,envs[j]._id,j,notmove[i]-1)==null)
						notify+="变量"+backup[notmove[i]].name+":"+backup[notmove[i]].value+"恢复失败\n"					
				}
				sleep(500)
				break
			}
		}
	}
	return notify
}



function SendNotify(Notify,notify){
	if(s.getPlatform()!="cron")
		s.reply(Notify)
	else 
		st.NotifyMasters(Notify)
	if(NotifyMode==2){
		ToCustomer["content"]=notify
		sillyGirl.push(ToCustomer)
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



//获取min~max(不含max)之间但不存在于数组exception中的随机数
function RandomExcept(min,max,exception){
	let limit=60
	while(true){
		if(limit--<0)
			return null
		let num=Math.floor(Math.random()*(max-min)+min)
		if(exception.indexOf(num)==-1)
			return num
	}
}



main()