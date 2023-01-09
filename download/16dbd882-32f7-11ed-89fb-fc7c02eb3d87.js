/**
* @author https://t.me/sillyGirl_Plugin
* @version v1.1.2
* @create_at 2022-09-19 15:06:22
* @description nark对接，默认禁用，可修改默认上车容器,本插件需对接过芝士，需安装qinglong与something模块
* @title nark登陆
* @rule raw ^(登陆|登录)$
* @rule raw [\S ]*pin=[^;]+; ?wskey=[^;]+;[\S ]*
* @rule raw [\S ]*pt_key=[^;]+; ?pt_pin=[^;]+;[\S ]*
* @priority 99999999999999999999
 * @public false
* @disable false
*/

/***************配置****************** */
//默认上车青龙容器序号
const DefaultQL=1

//允许上车的群聊白名单id,非白名单群禁止上车,例:[1232321,-1002312313,12312312]
const GroupWhiteList=[758657899]

//客户黑名单，黑名单客户禁止上车，例:["123213","1434234"]
const BlackList=[]
/************************************** */ 


const ql=require("qinglong")
const st=require("something")
const jddb=new Bucket("jd_cookie")
const s = sender
const sillyGirl=new SillyGirl()
const WAIT=60*1000
const VerifyTimes=3

const handle=function(s){
	if(s.getChatId())
		s.recallMessage(s.getMessageId())
		sleep(400)
}

function main(){
	if(BlackList.indexOf(s.getUserId())!=-1){
		s.reply("禁止上车，请联系管理员")//不需要通知请注释本行 
		return
	}
	else if(s.getChatId() && GroupWhiteList.indexOf(s.getChatId())==-1){
		if(s.isAdmin())
			s.reply("本群禁止上车")//不需要通知请注释本行
		return
	}

	var env={
		name:"",
		value:"",
		remarks:""
	}
	if(s.getContent()=="登陆"||s.getContent()=="登录"){
		const nark=jddb.get("nolan_addr")
		if(nark==""){
			if(s.isAmdin())
				s.reply("请使用命令set jd_cookie nolan_addr http://xx.xx.xx.xx 对接nark")
			else
				s.reply("未对接登陆，请联系管理员")
			return
		}
		let Tel=SendSMS(nark)
		if(Tel){
			if(Tel=="q"){
				return
			}
			let result=VerifyCode(nark,Tel)
			if(result=="q"){
				return
			}
			else if(result){
				env.value=result
				env.name="JD_COOKIE"
			}
			else{
				s.reply("您可以发送'呆瓜'获取其他登录方式")
				return
			}
		}
		else{
			s.reply("登陆暂时不可用,已自动催促管理员修复,您可以发送'呆瓜'获取其他登录方式")
			return
		}
	}
	else if(s.getContent().indexOf("wskey")!=-1){
		s.recallMessage(s.getMessageId())
		sleep(400)
		env.name="JD_WSCK"
		env.value=s.getContent().match(/pin=[^;]+; ?wskey=[^;]+;/)[0]
	}
	else{
		let ck=s.getContent().match(/pt_key=[^;]+; ?pt_pin=[^;]+;/)[0]
		if(st.JD_UserInfo(ck) || JD_isLogin(ck)){//检查ck有效性
			s.recallMessage(s.getMessageId())
			sleep(400)
			env.name="JD_COOKIE"
			env.value=ck
		}
		else{
			s.reply("cookie无效")
			return
		}
	}
	console.log(JSON.stringify(env))

	let QLS=ql.QLS()
	let ql_token=QLS[DefaultQL-1].token
	if(!ql_token){
		s.reply("token获取失败，请联系管理员")
		s.reply(env.value)
		return
	}
	
	result=Submit_QL(QLS[DefaultQL-1].host,ql_token,env)
	if(result){
		let pin=env.value.match(/(?<=pin=)[^;]+/)[0]
		let bind=new Bucket("pin"+s.getPlatform().toUpperCase())
		bind.set(pin,s.getUserId())//用户绑定
		UpdateLoginDate(pin)//更新账号更新时间
		if(result==1)
			sillyGirl.notifyMasters("报告老板！新客户[ "+pin+" ]成功添加账号\n--来自["+s.getPlatform()+":"+s.getUserId()+"]")
		else if(result==2)
			sillyGirl.notifyMasters("报告老板！老客户[ "+pin+" ]成功更新账号\n--来自["+s.getPlatform()+":"+s.getUserId()+"]")
		s.reply("上车成功")
	}
	else{
		s.reply("提交失败，请联系管理员")
		if(s.getContent()=="登陆"||s.getContent()=="登录" && env.value){
			sillyGirl.push({
    			platform: s.getPlatform(),
    			userId: s.getUserId(),
    			content: env.value,
			})
			s.reply("获取的ck已私聊推送给您，或者您可以稍后将ck发给机器人尝试再次提交")
		}
		return
	}
}

function UpdateLoginDate(pin){
	let config={
		"ID":pin,
		"Pet":false,
		"Fruit":false,
		"DreamFactory":false,
		"Note":"",
		"LoginedAt":"",
		"ClientID":""
	}
	let jdNotify=new Bucket("jdNotify")
	let data=jdNotify.get(pin)
	if(data)
		config=JSON.parse(data)
	config.LoginedAt=(new Date()).toISOString()
	jdNotify.set(pin,JSON.stringify(config))
}

function JD_isLogin(ck){
	try{
		return Number(JSON.parse(request({
				url:"https://plogin.m.jd.com/cgi-bin/ml/islogin",
				headers:{
					"Cookie": ck,
                	"User-Agent": "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"   
				}
			}).body).islogin)
	}
	catch(err){
		return null
	}
}

function VerifyCard(nark,Tel){
	s.reply("您的账号需验证身份,请输入你的身份证前2位与后4位:")
	for(j=0;j<VerifyTimes;j++){
		inp=s.listen(handle,WAIT)
		if(inp == null){
			if(j == VerifyTimes-1)
				s.reply("您已超时，请重新登录")
			continue
		}
		else if(inp.getContent()=="q"){
			s.reply("已退出")
			return "q"
		}
		let resp=request({
   			url:nark+"/api/VerifyCardCode",
    		method:"post",
			body:{
  				"Phone": Tel,
  				"QQ": "",
  				"qlkey": 0,
  				"Code": inp.getContent()
			}
		})
		let data3=JSON.parse(resp.body)
		if(data3.success){
			return data3.data.ck
		}
		else if(data3.message){
			if(j < VerifyTimes-1)
				s.reply(data3.message+"，请重新输入")
			else{
				s.reply("错误次数过多，请重新登陆！")
				return false
			}
		}
		else{
			s.reply("未知情况，请联系管理员\n"+JSON.stringify(resp.body))
			return false
		}
	}
}

function VerifyDevice(nark,Tel){
	s.reply("您的账号需验证设备，请在三分钟内前往京东APP>设置>账户安全 新设备登录>确认登录\n\n请在完成如上操作后,回复“已确认”")
	let inp=s.listen(handle,3*60*1000)
	if(inp && inp.getContent()=="q"){
		s.reply("已退出")
		return "q"
	}
	else{
		let resp=request({
   				url:nark+"/api/VerifyCardCode",
    			method:"post",
				body:{
  					"Phone": Tel,
  					"QQ": "",
					"qlkey": 0,
					"Code": "1"
				}
		})
		let data3=JSON.parse(resp.body)
		if(data3.success)
			return data3.data.ck
		else{
			s.reply("登录失败")
			//s.notifyMasters("客户登录失败"+JSON.stringify(resp))
			return false
		}
	}
}

function VerifySendSMS(nark,Tel,message){
	let tip="您的账号需进行短信验证，请在三分钟内使用手机"+message.phone+"向"+message.uplink_tophone+"发送"+message.uplink_tocontent
	tip+="\n请在完成如上操作后,回复“已确认”"
	s.reply(tip)
	let inp=s.listen(handle,3*60*1000)
	if(inp && inp.getContent()=="q"){
		s.reply("已退出")
		return "q"
	}
	else{
		let resp=request({
   				url:nark+"/api/VerifyCardCode",
    			method:"post",
				body:{
  					"Phone": Tel,
  					"QQ": "",
					"qlkey": 0,
					"Code": "1"
				}
		})
		let data3=JSON.parse(resp.body)
		if(data3.success)
			return data3.data.ck
		else{
			s.reply("登录失败"+data3.message)
			//s.notifyMasters("客户登录失败"+JSON.stringify(resp))
			return false
		}
	}
}

function VerifyCode(nark,Tel){
	let inp=1
	for(let i=0;i<VerifyTimes;i++){
		if(inp)
			s.reply("请输入验证码：")
		inp=s.listen(handle,WAIT)
		if(inp==null){
			if(i == VerifyTimes-1)
				s.reply("您已超时，请重新登录")
				continue
			}
		else if(inp.getContent()=="q"){
			s.reply("已退出")
			return "q"
		}
		if(inp.getContent().length!=6){
			s.reply("验证码错误，请重新输入")
			continue
		}
		resp=request({
   				url:nark+"/api/VerifyCode",
    			method:"post",
				body:{
 					"Phone": Tel,
 					"QQ": "",
 					"qlkey": 0,
  					"Code": inp.getContent()
				}
		})
		let data=JSON.parse(resp.body)
		if(data.success)
			return data.data.ck
		else if(data.data.status==555 && data.data.mode=="USER_ID"){
			return VerifyCard(nark,Tel)
			//s.reply("您的账号需验证身份,请输入你的身份证前2位与后4位:")

		}
		else if(data.data.status==555 && data.data.mode=="HISTORY_DEVICE"){
			return VerifyDevice(nark,Tel)
			//s.reply("您的账号需验证设备，请在三分钟内前往京东APP>设置>账户安全 新设备登录>确认登录\n\n请在完成如上操作后,回复“已确认”")
		}
		else if(data.data.status==555 && data.data.mode=="DANGEROUS_UP"){
			return VerifySendSMS(nark,Tel,message)
		}
		else if(data.message){
			s.reply(data.message)
			if(data.message.indexOf('Object reference')!=-1){
				s.reply('您的账号暂不支持短信登录，请手动抓取cookie')
				return false
			}
		}
		else{
			s.reply("未知验证，请联系管理员:\n"+JSON.stringify(data))
			return false
		}
	}
	return false
}

function SendSMS(nark){
	s.reply("请输入京东登陆手机号码(回复q退出)：")
	let inp=s.listen(handle,WAIT)
	if(inp==null){
		s.reply("输入超时，请重新登陆")
		return false
	}
	else if(inp.getContent()=="q"){
		s.reply("已退出")
		return "q"
	}
	else if(inp.getContent().length!=11){
		s.reply("手机号码错误，请重新登陆")
		return false
	}
	let tipid=s.reply("请稍候...")
	let Tel=inp.getContent()
	let resp=request({
   		url:nark+"/api/SendSMS",
    	method:"post",
		body:{"Phone": Tel,"qlkey": 0}
	})
	s.recallMessage(tipid)
	sleep(400)
	try{
		let data=JSON.parse(resp.body)
		if(data.success)
			return Tel
		else{
			if(data.message)
				s.reply(data.message)
			return null
		}
	}
	catch(err){
		sillyGirl.notifyMasters("报告管理员，客户登陆失败，nark疑似寄了\n"+JSON.stringify(resp))
		return null
	}
}

function Submit_QL(host,token,env){
	let pin=env.value.match(/(?<=pin=)[^;]+/)
	if(pin==null)
		return false
	else
		pin=pin[0]
	let envs=ql.Get_QL_Envs(host,token)
	if(envs==null)
		return false
	
	let index=envs.findIndex(Ele => Ele.name == env.name && Ele.value.match(/(?<=pin=)[^;]+/)[0] == pin)
	if(index==-1){
		env.remarks=s.getPlatform()+":"+s.getUserId()
		if(ql.Add_QL_Envs(host,token,[env]))
			return 1
		else
			return 0
	}
	else{
		if(envs[index].id)
			id=envs[index].id
		else
			id=envs[index]._id
		if(envs[index].remarks)
			remarks=envs[index].remarks
		else
			remarks=s.getPlatform()+":"+s.getUserId()
		if(ql.Update_QL_Env(host,token,id,env.name,env.value,remarks)){
			ql.Enable_QL_Envs(host,token,[id])
			return 2
		}
		else
			return 0
	}
}

main()