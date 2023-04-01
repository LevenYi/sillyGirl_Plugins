/**
 * @author https://t.me/sillyGirl_Plugin
 * @version v1.2.2
 * @create_at 2022-09-19 15:06:22
 * @description 京东登陆插件，已对接nark、NolanPro及qrabbit，需傻妞对接芝士，并安装qinglong与something模块
 * @title 京东登陆
 * @rule raw ^(登陆|登录)$
 * @rule raw ^扫码登(陆|录)$
 * @rule raw ^(打开|关闭)扫码$
 * @priority 9
 * @public false
 * @disable false
*/

/***************配置****************** */
/* @rule raw [\S ]*pin=[^;]+; ?wskey=[^;]+;[\S ]*
* @rule raw [\S ]*pt_key=[^;]+; ?pt_pin=[^;]+;[\S ]*/

//允许上车的群聊白名单id,非白名单群禁止上车,例:[1232321,-1002312313,12312312]
const GroupWhiteList=[758657899,152312983]

//客户黑名单，黑名单客户禁止上车，例:["123213","1434234"]
const BlackList=[]

//聚合容器序号，用于检查绑定账号有效性
const DefaultQL=1

//【Nolan】
//对接nark
//set jd_cookie nolan_addr ?
//例：set jd_cookie nolan_addr http://127.0.0.1:5710

//对接nolan Pro
//设置nolan Pro地址
//set jd_cookie nolanPro_addr ?

//设置nolan Pro对接机器人的token
//set jd_cookie nolanPro_token ?


//【rabbit】
//对接qrabbit扫码
//set jd_cookie rabbit_qr_addr ?

//设置rabbit扫码上车容器
//set jd_cookie rabbit_qr_ql ?

//【提交ck】
//短信登陆后上传ck的容器(对应“青龙管理”的容器序号，若将ck交由芝士处理，本项设置为0)
//注1：若将ck交由芝士处理，便于ck分发以及可以即时查询账号信息，若由本插件上传ck，将无法即时更新账号状态，即虽然ck有效但查询仍旧提示无效，需过几分钟才能正常查询
//注2：本项设置与扫码无关,nolan Pro扫码ck分发由Pro负责，rabbit扫码ck分发见上文【rabbit】设置
const qlc=1

//【短信登陆方式优先级】
//是否优先使用nolanPro
const SmsProFirst=true

//【扫码登陆优先级】
//是否优先使用nolanPro
const QRProFirst=true

/************************************** */ 


const ql=require("qinglong")
const st=require("something")
const jddb=new Bucket("jd_cookie")
const s = sender
const pins=st.GetBind(s.getPlatform(),s.getUserId())	//获取用户已绑定的pin
const QLS=ql.QLS()
const sillyGirl=new SillyGirl()
const WAIT=60*1000
const VerifyTimes=3	//验证次数

const handle=function(s){
	if(s.getChatId())
		s.recallMessage(Number(s.getMessageId()).toString())
	sleep(400)
}

function main(){
	if(BlackList.indexOf(s.getUserId())!=-1){
		// s.reply("禁止上车，请联系管理员")//不需要通知请注释本行 
		return
	}
	else if(s.getChatId() && GroupWhiteList.indexOf(s.getChatId())==-1){
		// s.reply("本群禁止上车")//不需要通知请注释本行
		return
	}
	// if(!s.isAdmin()){
	// 	s.reply("维护中...")
	// 	return
	// }
	if(s.getContent()=="登陆"||s.getContent()=="登录"){
		const nark=jddb.get("nolan_addr")
		const nolanPro=jddb.get("nolanPro_addr")
		const token=jddb.get("nolanPro_token")
		let ck=""
		if(!nark && !nolanPro){
			s.reply("未对接短信登陆")
			return
		}
		else if(nolanPro && !token){
			s.reply("未设置nolanPro机器人token")
			return 
		}
		//检查绑定账号是否失效
		// if(!NeedLogin(pins,QLS[DefaultQL-1])){
		// 	s.reply("您的账号尚未失效，无需重新登陆")
		// 	return
		// }
		s.reply("请输入京东登陆手机号码\n(小提示：晚上8点后登陆成功概率更高哦~可回复q退出)：")
		let inp=s.listen(handle,WAIT)
		if(inp==null){
			s.reply("输入超时，请重新登陆")
			return
		}
		else if(inp.getContent()=="q"){
			s.reply("已退出")
			return 
		}
		else if(inp.getContent().length!=11){
			s.reply("手机号码错误，请重新登陆")
			return 
		}
		else
			Tel=inp.getContent()

		let tipid=s.reply("请稍候...")
		if(SmsProFirst){	//优先使用Pro短信
			let result=NolanProSms(nolanPro,token,Tel)
			if(!result)
				result=NarkSms(nark,Tel)
			if(!result){
				s.reply("短信登陆暂时不可用，您可以尝试'扫码登陆'登陆或者手动抓取ck")
				return
			}
		}
		else{	//优先使用nark短信
			let result=NarkSms(nark,Tel)
			if(!result)
				result=NolanProSms(nolanPro,token,Tel)
			if(!result){
				s.reply("短信登陆暂时不可用，您可以尝试'扫码登陆'登陆或者手动抓取ck")
				return
			}
		}
	}
	else if(s.isAdmin() && s.getContent()=="打开扫码"){
		jddb.set("qr_switch",1)
		s.reply("ok")
		return
	}
	else if(s.isAdmin() && s.getContent()=="关闭扫码"){
		jddb.set("qr_switch",0)
		s.reply("ok")
		return
	}
	else if(s.getContent()=="扫码登陆"||s.getContent()=="扫码登录"){
		if(!s.isAdmin() && jddb.get("qr_switch")==0){
    		s.reply('维护中...')
			return
		}
		//检查绑定账号是否失效，本部分代码将导致已登陆用户账号未失效前无法添加新账号，可联系管理员触发扫码或者注释本部分代码
		if(!s.isAdmin() && pins.length && !NeedLogin(pins,QLS[DefaultQL-1])){
			s.reply("您的账号尚未失效，无需重新登陆\n若需添加新账号，请联系管理员或者使用短信登陆")
			return
		}

		let pin=""
		let result=false
		if(QRProFirst){	//优先使用Pro扫码
			result=NolanProQR()
			if(!result)
				result=RabbitQR()
		}
		else{	//优先使用rabbit扫码
			result=RabbitQR()
			if(!result)
				result=NolanProQR()
		}	
		if(!result){
			s.reply("扫码暂时不可用,您可以发送“呆瓜”获取其他登陆方式")
			return
		}		
	
		//更新变量
		//Update_JDCOOKIE(QLS[DefaultQL-1])
		return
	}
	else if(s.getContent().indexOf("wskey")!=-1){	//提交wskey
		s.recallMessage(Number(s.getMessageId()).toString())
		sleep(400)
		env.name="JD_WSCK"
		env.value=s.getContent().match(/pin=[^;]+; ?wskey=[^;]+;/)[0]
	}
	else{	//提交ck
		let ck=s.getContent().match(/pt_key=[^;]+; ?pt_pin=[^;]+;/)[0]
		if(st.JD_UserInfo(ck) || JD_isLogin(ck)){	//检查ck有效性
			s.recallMessage(Number(s.getMessageId()).toString())
			sleep(400)
			env.name="JD_COOKIE"
			env.value=ck
		}
		else{
			s.reply("cookie无效")
			return
		}
	}
}

function NolanProSms(nolanPro,token,Tel){
	if(!nolanPro)
		return false
	if(SendSMS(nolanPro+"/sms",token,Tel)){	
		console.log("nolanPro在线")
		result=VerifyCode(nolanPro+"/sms",token,Tel)
		if(result && result!==true){	//登陆成功
			console.log(result)
			let pin=result.match(/(?<=pin=)[^;]+/)[0]
			if(!qlc){	//交由其他插件（芝士）处理ck
				s.setContent(result)
				s.continue()	
			}
			else{	//由本插件提交ck		
				UpdateUserData(pin)	//更新账号数据
				if(Submit_QL(QLS[qlc-1].host,QLS[qlc-1].token,{
					name:"JD_COOKIE",
					value:result,
					remarks:s.getPlatform()+":"+s.getUserId()
				}))
        			s.reply("登陆成功，账号更新中...\n请等待几分钟后再查询账号信息")
				else
					s.reply("提交失败，请尝试手动提交或者联系管理员\n"+result)
				if(pins.indexOf(pin)!=-1)
					sillyGirl.notifyMasters("报告老板，[ "+pin+" ]更新账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：NolanPro短信")
				else
					sillyGirl.notifyMasters("报告老板，[ "+pin+" ]添加账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：NolanPr短信")
			}
		}		
		return result	
	}
	else{
		sillyGirl.notifyMasters("报告老板，nolanPro疑似挂了！")
		return false
	}
}

function NarkSms(nark,Tel){
	if(!nark)
		return false
	if(SendSMS(nark+"/api",null,Tel)){	
		console.log("nark在线")	
		result=VerifyCode(nark+"/api",null,Tel)
		if(result && result!==true){	//登陆成功
			console.log(result)
			let pin=result.match(/(?<=pin=)[^;]+/)[0]
			if(!qlc){	//交由其他插件（芝士）处理ck
				s.setContent(result)
				s.continue()	
			}
			else{	//由本插件提交ck		
				UpdateUserData(pin)	//更新账号数据
				if(Submit_QL(QLS[qlc-1].host,QLS[qlc-1].token,{
					name:"JD_COOKIE",
					value:result,
					remarks:s.getPlatform()+":"+s.getUserId()
				}))
        			s.reply("登陆成功，账号更新中...\n请等待几分钟后再查询账号信息")
				else
					s.reply("提交失败，请尝试手动提交或者联系管理员\n"+result)
				if(pins.indexOf(pin)!=-1)
					sillyGirl.notifyMasters("报告老板，[ "+pin+" ]更新账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：Nark短信")
				else
					sillyGirl.notifyMasters("报告老板，[ "+pin+" ]添加账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：Nark短信")
			}
		}		
		return result	
	}
	else{
		sillyGirl.notifyMasters("报告老板，nark疑似挂了！")
		return false
	}
}

function NolanProQR(){
	const addr=jddb.get("nolanPro_addr")
	const token=jddb.get("nolanPro_token")
	if(!addr){
		console.log("未设置nolan扫码地址")
		return false
	}
	else if(!token){
		s.reply("未设置nolan扫码token")
		return false
	}
	let data=getQR(addr+"/qr/GetQRKey")
    if(!data || !data.success){
		let tip="报告老板,NolanPro面板疑似挂了\n"
		tip+=data ? JSON.stringify(data) : ""
		sillyGirl.notifyMasters(tip)
        return false
    }
	else if(!data.data.key){
		console.log("未知错误\n"+JSON.stringify(data))
		return false
	}
	//console.log(data.data.key)
	console.log("NolanPro在线")
	let loginurl="https://qr.m.jd.com/p?k="+data.data.key
	let qr=st.CQ_Image("https://api.pwmqr.com/qrcode/create/?url="+loginurl)
	s.reply("请使用京东app扫码（支持截图扫码）\n"+qr+"或者浏览器打开以下链接后唤醒京东APP确认登陆\n"+loginurl)
    let limit=100
    while(limit-->0){
		sleep(1500)
        let option={
    		url:addr+"/qr/CheckQRKey",
        	method:"post",
			headers:{"Authorization":"Bearer "+token},
			body:{"qrkey":data.data.key}
    	} 
		let resp=request(option)
        try{
            let data=JSON.parse(resp.body)
			console.log(resp.body)
            if(data.success){	//登陆成功
				let pin=decodeURI(data.data.username)==data.data.username ? encodeURI(data.data.username) : data.data.username
				if(pins.indexOf(pin)!=-1)
					sillyGirl.notifyMasters("报告老板，[ "+pin+" ]更新账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：nolanPro扫码")
				else
					sillyGirl.notifyMasters("报告老板，[ "+pin+" ]添加账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：nolanPro扫码")
				UpdateUserData(pin)	//更新账号数据
        		s.reply("登陆成功，账号更新中...\n请等待几分钟后再查询账号信息")
				return pin
            }
			else{
				if(data.message=="请先获取二维码")	//二维码失效
                	break
			} 
        }
        catch(err){
            console.log(JSON.stringify(resp))
            return true
        } 
	}
    s.reply("超时")
	return true
}

//登陆成功返回pin
function RabbitQR(){
	let addr=jddb.get("rabbit_qr_addr")
	let ql_server=jddb.get("rabbit_qr_ql")
	if(!addr){
		console.log("未设置rabbit扫码地址")
		return false
	}
	else if(!ql_server){
		s.reply("未设置rabbit上车服务器！\nset jd_cookie rabbit_qr_ql ?\n")
		return false
	}
    let data=getQR(addr+"/api/BeanQrCode")
    if(!data || data.code!=0){	
		let tip="报告老板,rabbit扫码面板疑似挂了\n"
		tip+=data ? JSON.stringify(data) : ""
		sillyGirl.notifyMasters(tip)
        return false
    }
	else if(!data.QRCodeKey){
		console.log("未知错误\n"+JSON.stringify(data))
		return false
	}
	console.log("qrabbit在线")
	//console.log(data.QRCodeKey)
	let loginurl="https://qr.m.jd.com/p?k="+data.QRCodeKey
	let qr=st.CQ_Image("https://api.pwmqr.com/qrcode/create/?url="+loginurl)
	s.reply("请使用京东app扫码（支持截图扫码）\n"+qr+"或者浏览器打开以下链接后唤醒京东APP确认登陆\n"+loginurl)
    let limit=100
    while(limit-->0){
        sleep(1500) 
    	let resp=request({
            url:addr+"/api/QrCheck",
            method:"post",
            body:{
                "token": "",
                "qlkey": Number(ql_server),
                "QRCodeKey": data.QRCodeKey
            }
        })
        try{
            let data=JSON.parse(resp.body)
            if(data.code==200){	//登陆成功
				let pin=decodeURI(data.pin)==data.pin ? encodeURI(data.pin):data.pin
				if(pins.indexOf(pin)!=-1)
					sillyGirl.notifyMasters("报告老板，[ "+pin+" ]更新账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：rabbito扫码")
				else
					sillyGirl.notifyMasters("报告老板，[ "+pin+" ]添加账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：rabbit扫码")
				UpdateUserData(pin)	//更新账号数据
        		s.reply("登陆成功，账号更新中...\n请等待几分钟后再查询账号信息")
				return pin
            }
			else{
				console.log(resp.body)
				if(data.code==502)	//二维码失效
                	break
            }
        }
        catch(err){
            console.log(JSON.stringify(resp))
            return true
        } 
    }
    s.reply("超时")
	return true
}

//获取登陆二维码
function getQR(addr,token){
   let option={
    	url:addr,
        method:"post",
		body:{}
    } 
	if(token)
		option.headers={"Authorization":"Bearer "+token}
	let resp=request(option)
	if(resp.status==200)
		return JSON.parse(resp.body)
	else {
		console.log(JSON.stringify(resp))
		return null
	}
}




//wskey更新,自用功能
function Update_JDCOOKIE(QL){
	let msg=""
	sleep(10000)
	let envs=ql.Get_QL_Envs(QL.host,QL.token)
	let ids=[]
	/*for(let i=0;i<envs.length;i++){
		if(envs[i].name=="JD_R_WSCK"){
			let id=envs[i].id?envs[i].id:envs[i]._id
			ids.push(id)
			ql.Update_QL_Env(QL.host,QL.token,id,"JD_WSCK",envs[i].value,envs[i].remarks)
		}
	}*/
	let crons=ql.Get_QL_Crons(QL.host,QL.token,"ws")
	for(let i=0;i<crons.length;i++){
		if(crons[i].command.indexOf("KingRan_KR/jd_wskey.py")!=-1){
			let id=crons[i].id?crons[i].id:crons[i]._id
			if(!ql.Start_QL_Crons(QL.host,QL.token,[id]))
				return "转换执行失败"
		}
	}
	sleep(15000)
	for(let i=0;i<crons.length;i++){
		if(crons[i].command.indexOf("jd_wskey_encode.py")!=-1){
			let id=crons[i].id?crons[i].id:crons[i]._id
			if(!ql.Start_QL_Crons(QL.host,QL.token,[id]))
				return "加密执行失败"
		}
	}
	if(!ql.Delete_QL_Envs(QL.host,QL.token,ids))
		return "JD_WSCK删除失败"
}

//检查pins中是否存在失效账号
function NeedLogin(pins,QL){
	if(!pins.length)	//新用户，尚未未绑定账号
		return false
	let envs=ql.Get_QL_Envs(QL.host,QL.token)
	if(!envs){
		console.log("获取青龙变量失败")
		return false
	}
	for(let i=0;i<pins.length;i++){
		let env=envs.find(env=>env.name=="JD_COOKIE" && pins[i]==env.value.match(/(?<=pin=)[^;]+/)[0])
		if(!env){
			console.log("无"+pins[i])
			return true
		}
		else if(!JD_isLogin(env.value)){
			console.log(pins[i]+"可能已失效")
			return true
		}
	}
	return false
}



//更新用户数据
function UpdateUserData(pin){
	//更新用户更新时间
	let date=(new Date()).toISOString()
	let config={
		"ID":pin,
		"Pet":false,
		"Fruit":false,
		"DreamFactory":false,
		"Note":"",
		"LoginedAt":date,
		"ClientID":""
	}
	let jdNotify=new Bucket("jdNotify")
	let data=jdNotify.get(pin)
	if(data)
		config=JSON.parse(data)
	config.LoginedAt=date
	jdNotify.set(pin,JSON.stringify(config))
	//更新绑定关系
	let bind=new Bucket("pin"+s.getPlatform().toUpperCase())
	bind.set(pin,s.getUserId())//用户绑定
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

//短信二验-身份证号
function VerifyCard(addr,token,Tel){
	let url=addr.indexOf("sms")==-1 ? addr+"/VerifyCardCode" : addr+"/VerifyCard"	//兼容nark与nolanPro
	s.reply("您的账号需验证身份,请输入你的身份证前2位与后4位:")
	for(i=0;i<VerifyTimes;i++){
		inp=s.listen(handle,WAIT)
		if(inp == null){
			if(i == VerifyTimes-1){
				s.reply("您已超时，请重新登录")
				return true
			}
			else
				continue
		}
		else if(inp.getContent()=="q"){
			s.reply("已退出")
			return true
		}
		let option={
   			url:url,
    		method:"post",
			body:{
 				"Phone": Tel,
 				"QQ": s.getUserId(),
 				"qlkey": 0,
  				"Code": inp.getContent(),
				"botApitoken":token
			}
		}
		let resp=request(option)
		if(resp.status!=200){
			console.log(JSON.stringify(option)+"\n\n"+JSON.stringify(resp))
			s.reply("登陆失败")
			return false
		}
		let data=JSON.parse(resp.body)
		if(data.success){
			return data.data.ck?data.data.ck:data.data.username
		}
		else if(data.message.indexOf("错误")!=-1){
			if(i < VerifyTimes-1)
				s.reply(data.message)
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

//短信二验-设备验证与短信发送
function VerifyCheck(addr,token,Tel,tip){
	let url=addr.indexOf("sms")==-1 ? addr+"/VerifyCardCode" : addr+"/VerifyCard"	//兼容nark与nolanPro
	s.reply(tip)
	let inp=s.listen(handle,3*60*1000)
	if(!inp){
		s.reply("超时")
		return true
	}
	else if(inp.getContent()=="q"){
		s.reply("已退出")
		return true
	}
	let resp=request({
   		url:url,
    	method:"post",
		body:{
 			"Phone": Tel,
 			"QQ": s.getUserId(),
 			"qlkey": 0,
  			"Code": "1",
			"botApitoken":token
		}
	})
	let data=JSON.parse(resp.body)
	if(data.success)
		return data.data.ck?data.data.ck:data.data.username
	else{
		s.reply("登录失败")
		console.log(resp.body)
		//s.notifyMasters("客户登录失败"+JSON.stringify(resp))
		return false
	}
}

//短信验证
function VerifyCode(addr,token,Tel){
	let inp=1
	for(let i=0;i<VerifyTimes;i++){
		if(inp)
			s.reply("请输入验证码：")
		inp=s.listen(handle,WAIT)
		if(inp==null){
			if(i == VerifyTimes-1){
				s.reply("您已超时，请重新登录")
				return true
			}
			else
				continue
		}
		else if(inp.getContent()=="q"){
			s.reply("已退出")
			return true
		}
		if(inp.getContent().length!=6){
			s.reply("验证码错误，请重新输入")
			continue
		}
		let option={
   			url:addr+"/VerifyCode",
    		method:"post",
			body:{
 				"Phone": Tel,
 				"QQ": s.getUserId(),
 				"qlkey": 0,
  				"Code": inp.getContent(),
				"botApitoken":token
			}
		}
		resp=request(option)
		if(resp.status!=200){
			s.reply("登陆失败:"+resp.status)
			console.log(JSON.stringify(option)+"\n\n"+JSON.stringify(resp))
			return false
		}
		let data=JSON.parse(resp.body)
		if(data.success)
			return data.data.ck?data.data.ck:data.data.username
		else if(data.data.status==555 && data.data.mode=="USER_ID"){	//验证身份证号
			return VerifyCard(addr,token,Tel)
		}
		else if(data.data.status==555 && data.data.mode=="HISTORY_DEVICE"){	//验证设备
			let tip="您的账号需验证设备，请在三分钟内前往京东APP>设置>账户安全 新设备登录>确认登录\n\n请在完成如上操作后,回复“已确认”"
			return VerifyCheck(addr,token,Tel,tip)
		}
		else if(data.data.status==555 && data.data.mode=="DANGEROUS_UP"){	//发送短信验证
			let message=data.data.message
			let tip="您的账号需进行短信验证，请在三分钟内使用手机"+message.phone+"向"+message.uplink_tophone+"发送"+message.uplink_tocontent
			tip+="\n请在完成如上操作后,回复“已确认”"
			return VerifyCheck(addr,token,Tel,tip)
		}
		else if(data.message){
			// if(data.message.indexOf('Object reference')!=-1){
			// 	s.reply('您的账号暂不支持短信登录')
			// 	return false
			// }
			if(data.message.indexOf("过期")!=-1){
				s.reply("验证码已过期，请重新登陆")
				return true
			}
			else if(data.message.indexOf("错误")!=-1){
				if(i==VerifyTimes-1){
					s.reply("错误次数过多，请重新登陆！")
					return false
				}
				else
					s.reply(data.message)
			}
		}
		else{
			s.reply("未知验证，请联系管理员:\n"+resp.body)
			return false
		}
	}
	return false
}

//获取验证码
function SendSMS(addr,token,Tel){
	if(!addr)
		return false
	let resp=request({
   		url:addr+"/SendSMS",
    	method:"post",
		body:{
			"Phone": Tel,
			"qlkey": 0,
			"botApitoken":token
		}
	})
	if(resp.status==200){
		let data=JSON.parse(resp.body)
		if(data.success)
			return true
		else{
			if(data.message)
				s.reply(data.message)
			console.log(resp.body)
			return false
		}
	}
	else{
		console.log(resp.body)
		return false
	}
}


//获取二维码，基于自建服务
function QR_Gene(host,base64){
        let resp=request({
        url:host,
        method:"post",
        body:{
			image:base64
		}
    })
    if(resp.status==200)
		return true
	else{
		console.log(JSON.stringify(resp))
		return false
	}
}

//上传ck至青龙
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
		return ql.Add_QL_Envs(host,token,[env])
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
		return  ql.Update_QL_Env(host,token,id,env.name,env.value,remarks) && ql.Enable_QL_Envs(host,token,[id])
	}
}

main()