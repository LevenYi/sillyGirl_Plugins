/**
* @author https://t.me/sillyGirl_Plugin
* @version v1.2.0
* @create_at 2022-09-19 15:06:22
* @description 京东登陆插件，已对接nark、NolanPro及qrabbit，短信登陆需傻妞对接芝士，并安装qinglong与something模块
* @title 京东登陆
* @rule raw ^(登陆|登录)$
* @rule raw ^扫码登(陆|录)$
* @rule raw (打开|关闭)扫码
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

//聚合容器序号，用于检查账号有效性
const DefaultQL=1

//【Nolan】
//设置nark面板地址
//set jd_cookie nolan_addr ?

//设置nolan Pro面板地址
//set jd_cookie nolanPro_addr ?

//设置nolan Pro对接机器人的token
//set jd_cookie nolanPro_token ?


//【rabbit】
//设置rabbit扫码面板地址命令
//set jd_cookie rabbit_qr_addr ?

//设置rabbit扫码上车容器
//set jd_cookie rabbit_qr_ql ?


/************************************** */ 


const ql=require("qinglong")
const st=require("something")
const jddb=new Bucket("jd_cookie")
const s = sender
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
		//s.reply("禁止上车，请联系管理员")//不需要通知请注释本行 
		return
	}
	else if(s.getChatId() && GroupWhiteList.indexOf(s.getChatId())==-1){
		if(s.isAdmin())
			//s.reply("本群禁止上车")//不需要通知请注释本行
		return
	}
	// if(!s.isAdmin()){
	// 	s.reply("维护中...")
	// 	return
	// }

	let QLS=ql.QLS()
	let ql_token=QLS[DefaultQL-1].token
	if(!ql_token){
		s.reply("token获取失败，请联系管理员")
		return
	}
	if(s.getContent()=="登陆"||s.getContent()=="登录"){
		const nark=jddb.get("nolan_addr")
		const nolanPro=jddb.get("nolanPro_addr")
		const token=jddb.get("nolanPro_token")
		let ck=""
		if(!nark && !nolanPro){
			if(s.isAdmin())
				s.reply("请使用命令set jd_cookie nolan_addr http://xx.xx.xx.xx 对接nark")
			else
				s.reply("未对接登陆，请联系管理员")
			return
		}
		//检查绑定账号是否失效
		// if(!NeedLogin(st.GetBind(s.getPlatform(),s.getUserId()),QLS[DefaultQL-1])){
		// 	s.reply("您的账号尚未失效，无需重新登陆")
		// 	return
		// }
		s.reply("请输入京东登陆手机号码(回复q退出)：")
		let inp=s.listen(handle,WAIT)
		if(inp==null){
			s.reply("输入超时，请重新登陆")
			return false
		}
		else if(inp.getContent()=="q"){
			s.reply("已退出")
			return false
		}
		else if(inp.getContent().length!=11){
			s.reply("手机号码错误，请重新登陆")
			return false
		}
		else
			Tel=inp.getContent()
		let tipid=s.reply("请稍候...")
		if(nolanPro){	//已对接nolanPro
			if(!token){
				s.reply("未设置nolanPro机器人token")
				return
			}
			if(SendSMS(nolanPro+"/sms",token)){	//先尝试使用nolanPro登陆
			//if(true){
				console.log("nolanPro在线")	
				let result=VerifyCode(nolanPro+"/sms",token,Tel)
				if(!result)
					return
				else{
					console.log(result)
					s.setContent(result)
					s.continue()
					// let pin=result
					// let bind=new Bucket("pin"+s.getPlatform().toUpperCase())
					// bind.set(pin,s.getUserId())//用户绑定
					// UpdateLoginDate(pin)//更新账号更新时间
        			// s.reply("登陆成功，账号更新中...请等待几分钟后再查询账号信息")
					// sillyGirl.notifyMasters("报告老板！客户[ "+pin+" ]成功通过nolan短信登陆\n--来自["+s.getPlatform()+":"+s.getUserId()+"]")
				}
			}
			else if(nark && SendSMS(nark+"/api")){	//nolanPro不可用且对接了nark，则尝试使用nark登陆
				console.log("nolanPro不可用，nark在线")	
				let result=VerifyCode(nark+"/api",null,Tel)
				if(!result)
					return
				else{	
					console.log(result)
					s.setContent(result)
					s.continue()				
				}
			}
			else{
				s.reply("短信登陆暂时不可用")
				return
			}
		}
		else{	//仅对接了nark
			if(SendSMS(nark+"/api")){
				console.log("nark在线")	
				let result=VerifyCode(nark+"/api",null,Tel)
				if(!result)
					return
				else{	
					console.log(result)
					s.setContent(result)
					s.continue()				
				}
			}
			else{
				s.reply("短信登陆暂时不可用")
				return
			}
		}
	}
	else if(s.getContent()=="打开扫码"){
		jddb.set("qr_switch",1)
		s.reply("ok")
		return
	}
	else if(s.getContent()=="关闭扫码"){
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
		let pins=st.GetBind(s.getPlatform(),s.getUserId())
		if(!s.isAdmin() && pins.length && !NeedLogin(pins,QLS[DefaultQL-1])){
			s.reply("您的账号尚未失效，无需重新登陆\n若需添加新账号，请联系管理员或者使用短信登陆")
			return
		}

		let pin=""
		let temp=NolanQR()
		if(temp){
			if(temp==true)	//超时退出
				return
			else{
				pin=temp
				sillyGirl.notifyMasters("报告老板！客户[ "+pin+" ]成功通过nolanPro扫码登陆\n--来自["+s.getPlatform()+":"+s.getUserId()+"]")
			}
		}
		else{
			temp=RabbitQR()
			if(temp){
				if(temp==true)	//超时退出
					return
				else{
					pin=temp
					sillyGirl.notifyMasters("报告老板！客户[ "+pin+" ]成功通过rabbit扫码登陆\n--来自["+s.getPlatform()+":"+s.getUserId()+"]")
				}
			}
			else{
				s.reply("扫码暂时不可用,已通知管理员尽快修复,您可以使用发送“呆瓜”获取其他登陆方式")
				return
			}
		}
		let bind=new Bucket("pin"+s.getPlatform().toUpperCase())
		bind.set(pin,s.getUserId())//用户绑定
		UpdateLoginDate(pin)//更新账号更新时间
        s.reply("登陆成功，账号更新中...\n请等待几分钟后再查询账号信息")
	
		//更新变量
		//Update_JDCOOKIE(QLS[DefaultQL-1])
		return
	}
	else if(s.getContent().indexOf("wskey")!=-1){
		s.recallMessage(Number(s.getMessageId()).toString())
		sleep(400)
		env.name="JD_WSCK"
		env.value=s.getContent().match(/pin=[^;]+; ?wskey=[^;]+;/)[0]
	}
	else{
		let ck=s.getContent().match(/pt_key=[^;]+; ?pt_pin=[^;]+;/)[0]
		if(st.JD_UserInfo(ck) || JD_isLogin(ck)){//检查ck有效性
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

	// result=Submit_QL(QLS[DefaultQL-1].host,ql_token,env)
	// if(result){
	// 	let pin=env.value.match(/(?<=pin=)[^;]+/)[0]
	//	pin=pin.indexOf("%")==-1?encodeURI(pin):pin
	// 	let bind=new Bucket("pin"+s.getPlatform().toUpperCase())
	// 	bind.set(pin,s.getUserId())//用户绑定
	// 	UpdateLoginDate(pin)//更新账号更新时间
	// 	if(result==1)
	// 		sillyGirl.notifyMasters("报告老板！新客户[ "+pin+" ]成功添加账号\n--来自["+s.getPlatform()+":"+s.getUserId()+"]")
	// 	else if(result==2)
	// 		sillyGirl.notifyMasters("报告老板！老客户[ "+pin+" ]成功更新账号\n--来自["+s.getPlatform()+":"+s.getUserId()+"]")
	// 	s.reply("上车成功！\n账号更新中...请等待几分钟后查询账号信息")
	// 	//更新变量
	// 	if(env.name=="JD_WSCK")
	// 		Update_JDCOOKIE(QLS[DefaultQL-1])
	// 	return
	// }
	// else{
	// 	s.reply("提交失败，请联系管理员")
	// 	if(s.getContent()=="登陆"||s.getContent()=="登录" && env.value){
	// 		sillyGirl.push({
    // 			platform: s.getPlatform(),
    // 			userId: s.getUserId(),
    // 			content: env.value,
	// 		})
	// 		s.reply("获取的ck已私聊推送给您，或者您可以稍后将ck发给机器人尝试再次提交")
	// 	}
	// 	return
	// }
}

//登陆成功返回pin
function NolanQR(){
	let qr_addr=jddb.get("nolanPro_addr")
	let token=jddb.get("nolanPro_token")
	if(!qr_addr){
		console.log("未设置nolan扫码地址")
		return false
	}
	else if(!token){
		s.reply("未设置nolan扫码token")
		return false
	}
	let data=getQR(qr_addr+"/qr/GetQRKey")
    if(!data){
		sillyGirl.notifyMasters("报告老板,NolanPro面板疑似挂了")
        return false
    }
	else if(!data.data.key){
		console.log("未知错误\n"+JSON.stringify(data))
		return false
	}
	//console.log(data.data.key)
	console.log("NolanQR在线")
	let qr=st.CQ_Image("https://api.pwmqr.com/qrcode/create/?url=https://qr.m.jd.com/p?k="+data.data.key)
	s.reply("请使用 京东app扫码 或 点击下方链接（支持截图扫码）\n"+qr+"\nhttps://qr.m.jd.com/p?k="+data.data.key)
    let limit=100
    while(limit-->0){
		sleep(1000)
        let option={
    		url:qr_addr+"/qr/CheckQRKey",
        	method:"post",
			headers:{"Authorization":"Bearer "+token},
			body:{"qrkey":data.data.key}
    	} 
		let resp=request(option)
        try{
            let data=JSON.parse(resp.body)
            if(data.success){	//登陆成功
				return data.data.username.indexOf("%")==-1 ? encodeURI(data.data.username) : data.data.username
            }
            else if(data.message=="请先获取二维码"){	//二维码失效
                break
            }
            else
                console.log(resp.body)
        }
        catch(err){
            console.log(JSON.stringify(resp))
            break
        } 
	}
    if(limit<=0){
        s.reply("超时")
    }
	return true
}

//登陆成功返回pin
function RabbitQR(){
	let qr_addr=jddb.get("rabbit_qr_addr")
	let ql_server=jddb.get("rabbit_qr_ql")
	if(!qr_addr){
		console.log("未设置rabbit扫码地址")
		return false
	}
	else if(!ql_server){
		s.reply("未设置rabbit上车服务器！\nset jd_cookie rabbit_qr_ql ?\n")
		return false
	}
    let data=getQR(qr_addr+"/api/BeanQrCode")
    if(!data){
		sillyGirl.notifyMasters("报告老板,Rabbit扫码面板疑似挂了")
        return false
    }
	else if(!data.QRCodeKey){
		console.log("未知错误\n"+JSON.stringify(data))
		return false
	}
	console.log("rabbitQR在线")
	//console.log(data.QRCodeKey)
	let qr=st.CQ_Image("https://api.pwmqr.com/qrcode/create/?url=https://qr.m.jd.com/p?k="+data.QRCodeKey)
	s.reply("请使用 京东app扫码 或 点击下方链接（支持截图扫码）\n"+qr+"\nhttps://qr.m.jd.com/p?k="+data.QRCodeKey)
    let limit=100
    while(limit-->0){
        sleep(1000) 
    	let resp=request({
            url:qr_addr+"/api/QrCheck",
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
				return data.pin.indexOf("%")==-1?encodeURI(data.pin):data.pin
            }
            else if(data.code==54){	//二维码失效
                s.reply(data.msg)	
                break
            }
            else
                console.log(resp.body)
        }
        catch(err){
            console.log(JSON.stringify(resp))
            break
        } 
    }
    if(limit<=0){
        s.reply("超时")
    }
	return true
}

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




//wskey更新
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

function NeedLogin(pins,QL){
	let envs=ql.Get_QL_Envs(QL.host,QL.token)
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



//更新账号更新时间
function UpdateLoginDate(pin){
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

function VerifyCard(addr,token,Tel){
	let url=addr.indexOf("sms")==-1 ? addr+"/VerifyCardCode" : addr+"/VerifyCard"
	s.reply("您的账号需验证身份,请输入你的身份证前2位与后4位:")
	for(i=0;i<VerifyTimes;i++){
		inp=s.listen(handle,WAIT)
		if(inp == null){
			if(i == VerifyTimes-1)
				s.reply("您已超时，请重新登录")
			continue
		}
		else if(inp.getContent()=="q"){
			s.reply("已退出")
			return false
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
		else if(data.message){
			if(i < VerifyTimes-1)
				s.reply(data.message+"，请重新输入")
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

function VerifyDevice(addr,token,Tel){
	s.reply("您的账号需验证设备，请在三分钟内前往京东APP>设置>账户安全 新设备登录>确认登录\n\n请在完成如上操作后,回复“已确认”")
	let inp=s.listen(handle,3*60*1000)
	let url=addr.indexOf("sms")==-1 ? addr+"/VerifyCardCode" : addr+"/VerifyCard"
	if(!inp){
		s.reply("超时")
		return false
	}
	else if(inp.getContent()=="q"){
		s.reply("已退出")
		return false
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

function VerifySendSMS(addr,token,Tel,message){
	let url=addr.indexOf("sms")==-1 ? addr+"/VerifyCardCode" : addr+"/VerifyCard"
	let tip="您的账号需进行短信验证，请在三分钟内使用手机"+message.phone+"向"+message.uplink_tophone+"发送"+message.uplink_tocontent
	tip+="\n请在完成如上操作后,回复“已确认”"
	s.reply(tip)
	if(!inp){
		s.reply("超时")
		return false
	}
	else if(inp.getContent()=="q"){
		s.reply("已退出")
		return false
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
		s.reply("登录失败"+data.message)
		console.log(resp.body)
		//s.notifyMasters("客户登录失败"+JSON.stringify(resp))
		return false
	}
}

function VerifyCode(addr,token,Tel){
	let inp=1
	for(let i=0;i<VerifyTimes;i++){
		if(inp)
			s.reply("请输入验证码：")
		inp=s.listen(handle,WAIT)
		if(inp==null){
			if(i == VerifyTimes-1){
				s.reply("您已超时，请重新登录")
				return false
			}
			else
				continue
		}
		else if(inp.getContent()=="q"){
			s.reply("已退出")
			return false
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
			s.reply("登陆失败")
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
			return VerifyDevice(addr,token,Tel)
		}
		else if(data.data.status==555 && data.data.mode=="DANGEROUS_UP"){	//发送短信验证
			return VerifySendSMS(addr,token,Tel,message)
		}
		else if(data.message){
			if(data.message.indexOf('Object reference')!=-1){
				s.reply('您的账号暂不支持短信登录')
				return false
			}
			else if(data.message=="验证码已过期，请重新获取"){
				s.reply("验证码已过期，请重新登陆")
				return false
			}
			else if(data.message.indexOf("错误")){
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

function SendSMS(addr,token){
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
