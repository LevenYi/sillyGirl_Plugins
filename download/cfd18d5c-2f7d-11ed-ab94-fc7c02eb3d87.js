/*
* @author https://t.me/sillyGirl_Plugin
* @module true
* @create_at 2022-09-09 16:30:33
* @description 青龙模块
* @version v1.0.0
* @title qinglong
* @public false
*/



module.exports = {
	Get_QL_Token:Get_QL_Token,

	Get_QL_Envs:Get_QL_Envs,
	Get_QL_Env:Get_QL_Env,
	Add_QL_Env:Add_QL_Env,
	Update_QL_Env:Update_QL_Env,
	Delete_QL_Envs:Delete_QL_Envs,
	Move_QL_Env:Move_QL_Env,
	Disable_QL_Envs:Disable_QL_Envs,
	Enable_QL_Envs:Enable_QL_Envs,

	Get_QL_Config:Get_QL_Config,
	Get_QL_Configs:Get_QL_Configs,
	Update_QL_Config:Update_QL_Config,

	Get_QL_Logs:Get_QL_Logs,
	Get_QL_Log:Get_QL_Log,

	Get_QL_Crons:Get_QL_Crons,
	Add_QL_Cron:Add_QL_Cron,
	Update_QL_Cron:Update_QL_Cron,
	Delete_QL_Crons:Delete_QL_Crons,
	Disable_QL_Crons:Disable_QL_Crons,
	Enable_QL_Crons:Enable_QL_Crons,
	Get_QL_CronLog:Get_QL_CronLog,
	Pin_QL_Crons:Pin_QL_Crons,
	Unpin_QL_Crons:Unpin_QL_Crons,
	Start_QL_Crons:Start_QL_Crons,
	Stop_QL_Crons:Stop_QL_Crons,

	Get_QL_Scripts:Get_QL_Scripts,
	Get_QL_Script:Get_QL_Script,
	Add_QL_Script:Add_QL_Script,
	Update_QL_Script:Update_QL_Script,
	Delete_QL_Script:Delete_QL_Script,
	Task_QL_Script:Task_QL_Script,

	Modify_QL_Config:Modify_QL_Config
}





function Sample(){
	let host=""
	let token=""

/*	let QLS=JSON.parse((new Bucket("qinglong").get("QLS")))
	let host=QLS[0].host
	let client_id=QLS[0].client_id
	let client_secret=QLS[0].client_secret
//	s.reply(host)*/
//	s.reply(JSON.stringify(Get_QL_Token(host,client_id,client_secret)))
//	s.reply(Get_QL_Version(host,token))
//	let login=QL_Login(host,"Leven_Yi","QL@Leven315")
//	s.reply("login:"+login)
	
//	s.reply(JSON.stringify(Get_QL_SeqLogClear(host,token)))
	
//
//	s.reply(JSON.stringify(Get_QL_Scripts(host,token)[2].children[0]))
//	s.reply(Get_QL_Script(host,token,"KingRan_KR","root.json"))
//	s.reply(Add_QL_Script(host,token,"测试.js","","hello word",""))
//	s.reply(Update_QL_Script(host,token,"测试.js","","你好"))
//	s.reply(Delete_QL_Script(host,token,"测试.js",""))
//	s.reply(Task_QL_Script(host,token,"jd_CheckCK.js","KingRan_KR"))
//	sleep(15*1000)
//	s.reply(Stop_QL_Script(host,token,"jd_CheckCK.js","KingRan_KR"))
	


//	let envs=Get_QL_Envs(host,token)
//	s.reply(JSON.stringify(envs[65]))	
//	s.reply(JSON.stringify(Add_QL_Env(host,token,[{"name":"Test","value":"值","remarks":"备注1"}])))
//	s.reply(JSON.stringify(Update_QL_Env(host,token,"9gDpadTPLRM1rBoK","Test2","value2","remark2")))
//	s.reply(JSON.stringify(Move_QL_Env(host,token,"9gDpadTPLRM1rBoK",65,60)))
//	s.reply(JSON.stringify(Get_QL_Env(host,token,"9gDpadTPLRM1rBoK")))
//	s.reply(Delete_QL_Envs(host,token,["9gDpadTPLRM1rBoK"]))
//	s.reply(Disable_QL_Envs(host,token,["NVgvoIAzhPhPwU8n"]))
//	s.reply(Enable_QL_Envs(host,token,["NVgvoIAzhPhPwU8n"]))

//	s.reply(JSON.stringify(Get_QL_Configs(host,token)))
//	s.reply(Get_QL_Config(host,token,"extra.sh"))
//	s.reply(Update_QL_Config(host,token,"extra.sh","Hello"))

/*	let logs=Get_QL_Logs(host,token)
	s.reply(JSON.stringify(logs[1].files))
	s.reply(Get_QL_Log(host,token,logs[1].name,logs[1].files[0]))*/
		
//	s.reply(JSON.stringify(Get_QL_Crons(host,token)[30]))
//	s.reply(JSON.stringify(Add_QL_Cron(host,token,"测试任务","task hello.py","1 2 1 1 1")))
//	s.reply("改:\n"+JSON.stringify(Update_QL_Cron(host,token,"iBKdVkntztpWOJmZ","测试任务","task hello.py2","1 4 1 1 1")))

//	s.reply(Disable_QL_Crons(host,token,["DBPOktsB6d4S6RUn"]))
//	s.reply(Enable_QL_Crons(host,token,["DBPOktsB6d4S6RUn"]))
//	s.reply(Pin_QL_Crons(host,token,["DBPOktsB6d4S6RUn"]))
//	s.reply(Unpin_QL_Crons(host,token,["DBPOktsB6d4S6RUn"]))
//	s.reply(Get_QL_CronImport(host.token))
//	s.reply(Start_QL_Crons(host,token,["aZTfc0tRFD2jvPR5"]))//特务z环境保护库
//	s.reply(Stop_QL_Crons(host,token,["aZTfc0tRFD2jvPR5"]))
//	s.reply(Delete_QL_Crons(host,token,["tAEzGQX9Vtgk262O"]))
//	s.reply(Get_QL_CronLog(host,token,"h08xz5tLf34v6Sgl"))
	return
}



//修改青龙配置文件变量
function Modify_QL_Config(host, token, envs) {
	//s.reply(JSON.stringify(envs))
	let Config = ql.Get_QL_Config(host, token, "config.sh")
	if (Config != null) {
		for (let i = 0; i < envs.length; i++) {
			let reg = new RegExp("(?<=export[ ]+" + envs[i].name + "[ ]*=[ ]*\")[^\"]*")
			if (Config.search(reg) == -1)
				Config += "\nexport " + envs[i].name + "=\"" + envs[i].value + "\""
			else
				Config =Config.replace(reg, envs[i].value)
		}
		return ql.Update_QL_Config(host, token, "config.sh", Config)
	}
	else return false
}


//修改配置文件变量envs:[{name:变量名,value:变量值}]并执行含关键词keywords:[]的任务
function Spy_QL_Task (host,token, envs, keywords) {
	if (token == null)
		return false
	if (!Modify_QL_Config(host, token, envs)) {
		return false
	}
	let crons = Get_QL_Crons(host, token)
	if(crons==null)
		return false
	let ids=[]
	for (let i = 0; i < crons.length; i++) {
		if(keywords.some((value,index,array)=>
			crons[i].command.indexOf(value) != -1 || crons[i].name.indexOf(value) != -1
		)){
			if(crons[i]["id"]!=undefined)
				ids.push(crons[i].id)
			else
				ids.push(crons[i]._id)
		}
	}
	if(ids.length!=0)
		return Start_QL_Crons(host, token, ids)
	else
		return false
}






/****************用户*******************/
//获取青龙token
function Get_QL_Token(host,client_id,client_secret){
	try{
		let data=request({url:host+"/open/auth/token?client_id="+client_id+"&client_secret="+client_secret})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

//获取青龙登陆信息,未知错误
function QL_Login(host,name,password){
	try{
		let data=request({
			url:host+"/open/user/login",
			method:"post",
			headers:{
				accept: "application/json",
				contentType:"application/json"
			},
			body:{"name": name,"password": password},
			dataType: "application/json"
		})
		s.reply("login---"+data)
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}


/****************青龙变量*******************/
/*环境变量对象
[{
    "value": "",	//值
    "_id": "",		//青龙2.11版本开始为id，自测
    "created": ,
    "status": 0,	//状态，是否禁用
    "timestamp": "Wed Jun 22 2022 17:55:12 GMT+0800 (中国标准时间)",
    "position": ,
    "name": "",			//变量名
    "remarks": ""		//变量备注
}]*/

//获取所有青龙环境变量,成功返回环境变量对象数组
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

//根据id获取青龙环境变量详细信息，成功返回环境变量对象
function Get_QL_Env(host,token,id){
	try{
		let data=request({
			url:host+"/open/envs/"+id,
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

//添加青龙变量envs:[{name:变量名,value:变量值,remark:变量备注}]数组
//成功返回环境变量对象
function Add_QL_Env(host,token,envs){
	try{
		let data=request({
			url:host+"/open/envs",
			method:"post",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:envs,
			dataType: "application/json"
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

//修改青龙变量id:变量id,修改为name:变量名,value:变量值,remark:变量备注
//成功返回修改后的环境变量对象
function Update_QL_Env(host,token,id,name,value,remark){
	let body
	if(id.search(/[^\d]/g)!=-1)
		body={"value": value,"name": name,"remarks": remark,"_id":id}
	else
		body={"value": value,"name": name,"remarks": remark,"id":id}
	try{
		let data=request({
			url:host+"/open/envs",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:body,
			dataType: "application/json"
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

//删除青龙变量id,id为数组,提交成功即成功，	
function Delete_QL_Envs(host,token,id){
	try{
		let data=request({
			url:host+"/open/envs",
			method:"delete",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}

//移动青龙变量_id从位置from至位置to,from与to为数组下标
function Move_QL_Env(host,token,id,from,to){	
	try{
		let data=request({
			url:host+"/open/envs/"+id+"/move",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:{"fromIndex": from,"toIndex": to},
			dataType: "application/json"
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

//禁用青龙变量id,id为数组	
function Disable_QL_Envs(host,token,id){
	try{
		let data=request({
			url:host+"/open/envs/disable",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}

//启用青龙变量id,id为数组	
function Enable_QL_Envs(host,token,id){
	try{
		let data=request({
			url:host+"/open/envs/enable",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}



/****************青龙配置文件*******************/

//获取青龙配置文件列表,成功返回[{title:filename,value:filename}]对象
function Get_QL_Configs(host,token){
	try{
		let data=request({
			url:host+"/open/configs/files",
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

//获取青龙配置文件内容
function Get_QL_Config(host,token,filename){
	try{
		let data=request({
			url:host+"/open/configs/"+filename,
			method:"get",
			headers:{
				Authorization:token.token_type+" "+token.token
			}
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}


//修改配置文件
function Update_QL_Config(host,token,filename,content){
	try{
		let data=request({
			url:host+"/open/configs/save",
			method:"post",
			headers:{
				Authorization:token.token_type+" "+token.token,
				"content-Type":"application/json"
			},
			body:{"name":filename,"content":content}
		})
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}


/****************青龙日志*******************/
//获取青龙日志件列表,成功返回[{ "name": "","isDir": true, "files": []}]对象数组
function Get_QL_Logs(host,token){
	try{
		let data=request({
			url:host+"/open/logs",
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			}
		})
		return JSON.parse(data.body).dirs	
	}
	catch(err){
		return null
	}
}

//获取青龙日志内容,成功返回string内容
function Get_QL_Log(host,token,name,logfile){
	try{
		let data=request({
			url:host+"/open/logs/"+name+"/"+logfile,
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


/****************青龙任务*******************/
//获取所有任务，返回所有任务对象数组
function Get_QL_Crons(host,token){
	try{
		let data=request({
			url:host+"/open/crons",
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			},
			dataType: "application/json"
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

//添加任务
function Add_QL_Cron(host,token,name,task,cron){
	try{
		let data=request({
			url:host+"/open/crons",
			method:"post",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:{
				"command": task,
				"schedule": cron,
				"name": name
			},
			dataType: "application/json"
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}	
}

//修改任务
function Update_QL_Cron(host,token,id,name,task,cron){
	let body
	if(id.search(/[^\d]/g)!=-1)
		body={"command": task,"name": name,"schedule": cron,"_id":id}
	else
		body={"command": task,"name": name,"schedule": cron,"id":id}
	try{
		let data=request({
			url:host+"/open/crons",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:body,
			dataType: "application/json"
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

//删除任务数组
function Delete_QL_Crons(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons",
			method:"delete",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}

//禁用任务id,id为数组	
function Disable_QL_Crons(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons/disable",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}

//启用任务id,id为数组	
function Enable_QL_Crons(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons/enable",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}

//获取任务日志
function Get_QL_CronLog(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons/"+id+"/log",
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

//置顶任务id,id为数组	
function Pin_QL_Crons(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons/pin",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}

//取消置顶任务id,id为数组	
function Unpin_QL_Crons(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons/unpin",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}

//立即执行任务id,id为数组
function Start_QL_Crons(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons/run",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}	
}

//停止任务id,id为数组
function Stop_QL_Crons(host,token,id){
	try{
		let data=request({
			url:host+"/open/crons/stop",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:id,
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}	
}

//未知
function Get_QL_CronImport(host,token){
	try{
		let data=request({
			url:host+"/open/crons/import",
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			}
		})
		s.reply(data.slice(0,100))
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}	
}


/****************青龙脚本*******************/
//本部分所有路径均指/ql/scripts/的相对路径

//获取所有脚本,成功返回脚本信息对象
function Get_QL_Scripts(host,token){
	try{
		let data=request({
			url:host+"/open/scripts/files",
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			},
			dataType: "application/json"
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

//获取脚本内容,parent为路径
function Get_QL_Script(host,token,filename,parent){
	try{
		let data=request({
			url:host+"/open/scripts/"+filename+"?path="+parent,
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			},
			dataType: "application/json"
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}	
}

//添加脚本,文件名，路径，脚本内容，原始文件名(?)
function Add_QL_Script(host,token,filename,path,content,originFilename){
	try{
		let data=request({
			url:host+"/open/scripts",
			method:"post",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:{
				"filename": filename,
				"path": path,
				"content": content,
				"originFilename": originFilename
			},
			dataType: "application/json"
		})
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}		
}

//修改脚本文件
function Update_QL_Script(host,token,filename,path,content){
	try{
		let data=request({
			url:host+"/open/scripts",
			method:"post",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:{
				"path":path,
				"filename":filename,
				"content":content
			},
			dataType: "application/json"
		})
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}

//删除脚本
function Delete_QL_Script(host,token,filename,path){
	try{
		let data=request({
			url:host+"/open/scripts",
			method:"delete",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:{
				"filename": filename,
				"path": path
			}
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}	
}

//执行脚本
function Task_QL_Script(host,token,filename,path){
	try{
		let data=request({
			url:host+"/open/scripts/run",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:{
				"filename": filename,
				"path": path
			},
			dataType: "application/json"
		})	
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}	
}

//停止执行脚本,未知错误
function Stop_QL_Script(host,token,filename,path){
	try{
		let data=request({
			url:host+"/open/scripts/stop",
			method:"put",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token,
				contentType:"application/json"
			},
			body:{
				"filename": filename,
				"path": path
			},
			dataType: "application/json"
		})	
//		s.reply(data)
		if(JSON.parse(data.body).code==200)
			return true
		else
			return false
	}
	catch(err){
		return false
	}
}


/****************系统管理*******************/
//获取青龙版本，未知错误，获取失败
function Get_QL_Version(host,token){
	try{
		let data=request({
			url:host+"/open/system",
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			},
		})
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}
}

//获取青龙日志删除频率,未知错误，获取失败
function Get_QL_SeqLogClear(host,token){
	try{
		let data=request({
			url:host+"/open/system/log/remove",
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:token.token_type+" "+token.token
			},
		})
		s.reply(data)
		return JSON.parse(data.body).data	
	}
	catch(err){
		return null
	}	
}

