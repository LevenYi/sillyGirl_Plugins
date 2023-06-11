/*
 * @author https://t.me/sillyGirl_Plugin
 * @module true
 * @create_at 2021-09-09 16:30:33
 * @description 青龙模块(可能仅支持部分版本青龙)
 * @version v1.0.4
 * @public false
 * @title qinglong
*/


module.exports = {
	//认证
	Get_QL_Token,
	//订阅
	Get_QL_Subs,
	Start_QL_Subs,
	//环境变量
	Get_QL_Envs,
	Get_QL_Env,
	Add_QL_Envs,
	Update_QL_Env,
	Delete_QL_Envs,
	Move_QL_Env,
	Disable_QL_Envs,
	Enable_QL_Envs,
	//配置文件
	Get_QL_Config,
	Get_QL_Configs,
	Update_QL_Config,
	//日志
	Get_QL_Logs,
	Get_QL_Log,
	//定时任务
	Get_QL_Crons,
	Add_QL_Cron,
	Update_QL_Cron,
	Delete_QL_Crons,
	Disable_QL_Crons,
	Enable_QL_Crons,
	Get_QL_CronLog,
	Pin_QL_Crons,
	Unpin_QL_Crons,
	Start_QL_Crons,
	Stop_QL_Crons,
	//脚本
	Get_QL_Scripts,
	Get_QL_Script,
	Add_QL_Script,
	Update_QL_Script,
	Delete_QL_Script,
	Task_QL_Script,
	//自定义
	QLS,
	Sync_QL_Envs,  
	Modify_QL_Config
}


//使用样例,仅供参考，可能修改
function Sample(){
	let data=null
	let QL=QLS()[0]
	let host=QL.host
	let client_id=QL.client_id
	let client_secret=QLS.client_secret
	let token=QL.token


	// let token=Get_QL_Token(host,client_id,client_secret)
	// data=Get_QL_Version(host,token)
	// let login=QL_Login(host,"username","passsword")
	
	// data=Get_QL_SeqLogClear(host,token)
	

	// data=Get_QL_Scripts(host,token)[2].children[0]
	// data=Get_QL_Script(host,token,"KingRan_KR","root.json")
	// data=Add_QL_Script(host,token,"测试.js","","hello word","")
	// data=Update_QL_Script(host,token,"测试.js","","你好")
	// data=Delete_QL_Script(host,token,"测试.js","")
	// data=Task_QL_Script(host,token,"jd_CheckCK.js","KingRan_KR")
	// data=Stop_QL_Script(host,token,"jd_CheckCK.js","KingRan_KR")
	
	// let envs=Get_QL_Envs(host,token)
	// data=envs[0]	
	// data=Add_QL_Envs(host,token,[{"name":"Test","value":"值","remarks":"备注1"}])
	// data=Update_QL_Env(host,token,"9gDpadTPLRM1rBoK","Test2","value2","remark2")
	// data=Move_QL_Env(host,token,"9gDpadTPLRM1rBoK",65,60)
	// data=Get_QL_Env(host,token,"9gDpadTPLRM1rBoK")
	// data=Delete_QL_Envs(host,token,["9gDpadTPLRM1rBoK"])
	// data=Disable_QL_Envs(host,token,["NVgvoIAzhPhPwU8n"])
	// data=Enable_QL_Envs(host,token,["NVgvoIAzhPhPwU8n"])

	// data=Get_QL_Configs(host,token)
	// data=Get_QL_Config(host,token,"extra.sh")
	// data=Update_QL_Config(host,token,"extra.sh","Hello")

	// let logs=Get_QL_Logs(host,token)
	// data=logs[1].files
	// data=Get_QL_Log(host,token,logs[1].name,logs[1].files[0])
		
	// data=Get_QL_Crons(host,token)[30]
	// data=Add_QL_Cron(host,token,"测试任务","task hello.py","1 2 1 1 1")
	// data=Update_QL_Cron(host,token,"iBKdVkntztpWOJmZ","测试任务","task hello.py2","1 4 1 1 1")

	// data=Disable_QL_Crons(host,token,["DBPOktsB6d4S6RUn"])
	// data=Enable_QL_Crons(host,token,["DBPOktsB6d4S6RUn"])
	// data=Pin_QL_Crons(host,token,["DBPOktsB6d4S6RUn"])
	// data=Unpin_QL_Crons(host,token,["DBPOktsB6d4S6RUn"])
	// data=Get_QL_CronImport(host.token)
	// data=Start_QL_Crons(host,token,["aZTfc0tRFD2jvPR5"])
	// data=Stop_QL_Crons(host,token,["aZTfc0tRFD2jvPR5"])
	// data=Delete_QL_Crons(host,token,["tAEzGQX9Vtgk262O"])
	// data=Get_QL_CronLog(host,token,"h08xz5tLf34v6Sgl")
	
	console.log(data)
	console.log(JSON.stringify(data))
}

//青龙变量name同步
//function Sync_QL_Envs(from_host,from_token,to_host,to_token,name,value_keyword){
function Sync_QL_Envs(ql1,ql2,name,value_keyword){
	let from_envs=Get_QL_Envs(from_host,from_token)
	let to_envs=Get_QL_Envs(to_host,to_token)
	if(!from_envs || !to_envs)
		return false
	if(name){
		from_envs=from_envs.filter(env=>env.name==name)
		to_envs=to_envs.filter(env=>env.name==name)
	}
	for(let i=0;i<from_envs.length;i++){
		let keyword=""
		let index=0
		if(value_keyword){
			keyword=from_envs[i].value.match(value_keyword)
			if(!keyword)
				return false
			else
				keyword=keyword[0]
			index=to_envs.findIndex(env=>{
				let kt=env.match(keyword)
				if(kt && kt[0]==keyword)
					return true
				else
					return false
			})
		}
		else
			index=to_envs.findIndex(env=>env.name==from_envs[i].name)
		if(index!=-1){
			let id=to_envs[index]._id?to_envs[index]._id:to_envs[index].id
			to_envs[index].value=from_envs[i].value
			if(!Update_QL_Env(to_host,to_token,id,from_envs[i].name,from_envs[i].value,from_envs[i].remarks))
				console.log(from_envs[i].name+"\n"+from_envs[i].value+"sync update failed")
		}
		else{
			if(!Add_QL_Envs(to_host,to_token,from_envs[i].name,[from_envs[i]]))
				console.log(from_envs[i].name+"\n"+from_envs[i].value+"sync add failed")
		}
	}
}


//修改青龙配置文件变量
function Modify_QL_Config(host, token, envs) {
	//s.reply(JSON.stringify(envs))
	let Config = Get_QL_Config(host, token, "config.sh")
	if (Config != null) {
		for (let i = 0; i < envs.length; i++) {
			let reg = new RegExp("(?<=export[ ]+" + envs[i].name + "[ ]*=[ ]*(\"|\'))[^\"\']*")
			if (Config.search(reg) == -1)
				Config += "\nexport " + envs[i].name + "=\"" + envs[i].value + "\""
			else
				Config =Config.replace(reg, envs[i].value)
		}
		return Update_QL_Config(host, token, "config.sh", Config)
	}
	else return false
}


//修改配置文件变量envs:[{name:变量名,value:变量值}]并执行含关键词keywords:[]的任务
function Spy_QL_Task (host,token, envs, keywords) {
	if (!Modify_QL_Config(host, token, envs)) {
		return false
	}
	let crons = Search_QL_Crons(host, token, keywords)
	if(!crons)
		return false
	else
		return Start_QL_Crons(host, token, crons[0].id?[crons[0].id]:crons[0]._id)
}


//获取容器信息
function QLS(mainKey,key){
	let updated=false
	let db=new Bucket(mainKey?mainKey:"qinglong")
	let data=db.get(key?key:"QLS")
	if(!data)
		return null
	else
		QLS=JSON.parse(data)
	QLS.forEach((ql,i)=>{
		if(ql.token){
			let envs=Get_QL_Envs(ql.host,ql.token)	//检测token是否失效
			if(!envs){
				console.log(ql.name+"token疑似失效,重新获取")
				QLS[i]["token"]=Get_QL_Token(ql.host,ql.client_id,ql.client_secret)
				updated=true
			}
		}
		else{
			console.log("获取"+ql.name+"token")
			QLS[i]["token"]=Get_QL_Token(ql.host,ql.client_id,ql.client_secret)
			updated=true
		}
		if(!QLS[i].token){
			console.log(ql.name+"token获取失败,青龙管理容器配置错误或者青龙已挂掉\n")
		}
	})
	if(updated)
		db.set("QLS",JSON.stringify(QLS))
	return QLS
}


function ReqQL(url,method,body,token){
	let option={
		url,
		method,
		headers:{
			"accept": "application/json"
		}
	}
	if(body)
		option.body=body
	if(token){
		if(token.token)
			token=token.token
		option.headers["Authorization"]="Bearer "+token
	}
	
	let resp=request(option)
	if(resp.status==200){
		//console.log(resp.body)
		let data=JSON.parse(resp.body)
		if(data.code==200){
			if(data.data){
				if(data.data.data)
					return data.data.data
				else
					return data.data
			}
			else if(data.dirs)
				return data.dirs
			else
				return true
		}
	}
	console.log(JSON.stringify(option)+"\n\n"+JSON.stringify(resp))
	return null
}

/****************用户*******************/
//获取青龙token
function Get_QL_Token(host,client_id,client_secret){
	let url=host+"/open/auth/token?client_id="+client_id+"&client_secret="+client_secret
	return ReqQL(url,"get",null,null)
}

//获取青龙登陆信息,未知错误
function QL_Login(host,name,password){
	return ReqQL(host+"/open/user/login","post",{"name": name,"password": password},null)
}

//****************青龙订阅***************** */
/*{
            "id": 4,
            "name": "KR",
            "url": "https://github.com/KingRan/KR.git",
            "schedule": "2 23 * * *",
            "interval_schedule": null,
            "type": "public-repo",
            "whitelist": "jd_|jx_|jdCookie",
            "blacklist": "activity|backUp|XAY|FLP|MN|AJ|YSLD|qbyq",
            "status": 1,
            "dependences": "^jd[^_]|USER|utils|function|sign|sendNotify|ql|JDJR",
            "extensions": null,
            "sub_before": null,
            "sub_after": null,
            "branch": null,
            "pull_type": null,
            "pull_option": null,
            "pid": 12934,
            "is_disabled": null,
            "log_path": "KingRan_KR/2023-01-18-23-02-00.log",
            "schedule_type": "crontab",
            "alias": "KingRan_KR",
            "proxy": null,
            "createdAt": "2023-01-16T15:52:19.105Z",
            "updatedAt": "2023-01-18T15:02:03.896Z"
}*/
//获取青龙订阅，无searchValue返回所有订阅
function Get_QL_Subs(host,token,searchValue){
	let url=host+"/open/subscriptions"
	if(searchValue)
		url+="?searchValue="+encodeURI(searchValue)
	return ReqQL(url,"get",null,token)
}
//立即执行订阅id,id为数组
function Start_QL_Subs(host,token,id){
	return ReqQL(host+"/open/subscriptions/run","put",id,token)
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

//获取青龙环境变量,无searchValue返回所有环境变量对象
function Get_QL_Envs(host,token,searchValue){
	let url=host+"/open/envs"
	if(searchValue)
		url+="?searchValue="+encodeURI(searchValue)
	return ReqQL(url,"get",null,token)
}

//根据id获取青龙环境变量详细信息，成功返回环境变量对象
function Get_QL_Env(host,token,id){
	return ReqQL(host+"/open/envs/"+id,"get",null,token)
}

//添加青龙变量envs:[{name:变量名,value:变量值,remarks:变量备注}]数组
//成功返回环境变量对象
function Add_QL_Envs(host,token,envs){
	return ReqQL(host+"/open/envs","post",envs,token)
}

//修改青龙变量id:变量id,修改为name:变量名,value:变量值,remark:变量备注
//成功返回修改后的环境变量对象
function Update_QL_Env(host,token,id,name,value,remark){
	let body={"value": value,"name": name,"remarks": remark?remark:""}
	isNaN(Number(id))?body["_id"]=id:body["id"]=id
	return ReqQL(host+"/open/envs","put",body,token)
}

//删除青龙变量id,id为数组,提交成功即成功，	
function Delete_QL_Envs(host,token,id){
	return ReqQL(host+"/open/envs","delete",id,token)
}

//移动青龙变量_id从位置from至位置to,from与to为数组下标
function Move_QL_Env(host,token,id,from,to){
	return ReqQL(host+"/open/envs/"+id+"/move","put",{"fromIndex": from,"toIndex": to},token)
}

//禁用青龙变量id,id为数组	
function Disable_QL_Envs(host,token,id){
	return ReqQL(host+"/open/envs/disable","put",id,token)
}

//启用青龙变量id,id为数组	
function Enable_QL_Envs(host,token,id){
	return ReqQL(host+"/open/envs/enable","put",id,token)
}



/****************青龙配置文件*******************/

//获取青龙配置文件列表,成功返回[{title:filename,value:filename}]对象
function Get_QL_Configs(host,token){
	return ReqQL(host+"/open/configs/files","get",null,token)
}

//获取青龙配置文件内容
function Get_QL_Config(host,token,filename){
	return ReqQL(host+"/open/configs/"+filename,"get",null,token)
}


//修改配置文件
function Update_QL_Config(host,token,filename,content){
	return ReqQL(host+"/open/configs/save","post",{"name":filename,"content":content},token)
}


/****************青龙日志*******************/
//获取青龙日志件列表,成功返回[{ "name": "","isDir": true, "files": []}]对象数组
function Get_QL_Logs(host,token){
	return ReqQL(host+"/open/logs","get",null,token)
}

//获取青龙日志内容,成功返回string内容
function Get_QL_Log(host,token,name,logfile){
	let data=ReqQL(host+"/open/logs/"+name+"/"+logfile,"get",null,token)
	if(!data)
		data=ReqQL(host+"/open/logs/"+logfile+"?path="+name,"get",null,token)	//兼容不同版本青龙
	return data
}


/****************青龙任务*******************/
//获取青龙定时任务，无searchValue返回所有任务
function Get_QL_Crons(host,token,searchValue){
	let url=host+"/open/crons"
	if(searchValue)
		url+="?searchValue="+encodeURI(searchValue)
	return ReqQL(url,"get",null,token)
}


//添加任务
function Add_QL_Cron(host,token,name,command,cron){
	return ReqQL(host+"/open/crons","post",{
			"command": command,
			"schedule": cron,
			"name": name
		},token)	
}

//修改任务
function Update_QL_Cron(host,token,id,name,task,cron){
	let body={"command": task,"name": name,"schedule": cron}
	isNaN(Number(id))?body["_id"]=id:body["id"]=id
	return ReqQL(host+"/open/crons","put",body,token)
}

//删除任务数组
function Delete_QL_Crons(host,token,id){
	return ReqQL(host+"/open/crons","delete",id,token)
}

//禁用任务id,id为数组	
function Disable_QL_Crons(host,token,id){
	return ReqQL(host+"/open/crons/disable","put",id,token)
}

//启用任务id,id为数组	
function Enable_QL_Crons(host,token,id){
	return ReqQL(host+"/open/crons/enable","put",id,token)
}

//获取任务日志
function Get_QL_CronLog(host,token,id){
	return ReqQL(host+"/open/crons/"+id+"/log","get",null,token)
}

//置顶任务id,id为数组	
function Pin_QL_Crons(host,token,id){
	return ReqQL(host+"/open/crons/pin","put",id,token)
}

//取消置顶任务id,id为数组	
function Unpin_QL_Crons(host,token,id){
	return ReqQL(host+"/open/crons/unpin","put",id,token)
}

//立即执行任务id,id为数组
function Start_QL_Crons(host,token,id){
	return ReqQL(host+"/open/crons/run","put",id,token)
}

//停止任务id,id为数组
function Stop_QL_Crons(host,token,id){
	return ReqQL(host+"/open/crons/stop","put",id,token)	
}

//未知
function Get_QL_CronImport(host,token){
	let resp=request({
		url:host+"/open/crons/import",
		method:"get",
		headers:{
			"accept": "application/json",
			"Authorization":token.token_type+" "+token.token
		}
	})
	try{
		return JSON.parse(resp.body).data	
	}
	catch(err){
		return null
	}	
}


/****************青龙脚本*******************/
//本部分所有路径均指/ql/scripts/的相对路径

//获取所有脚本,成功返回脚本信息对象
function Get_QL_Scripts(host,token){
	return ReqQL(host+"/open/scripts/files","get",null,token)
}

//获取脚本内容,parent为路径
function Get_QL_Script(host,token,filename,parent){
	return ReqQL(host+"/open/scripts/"+filename+"?path="+parent,"get",null,token)
}

//添加脚本,文件名，路径，脚本内容，原始文件名(?)
function Add_QL_Script(host,token,filename,path,content,originFilename){
	let body={
			"filename": filename,
			"path": path,
			"content": content,
			"originFilename": originFilename
		}
	return ReqQL(host+"/open/scripts","post",body,token)		
}

//修改脚本文件
function Update_QL_Script(host,token,filename,path,content){
	let body={
			"path":path,
			"filename":filename,
			"content":content
		}
	return ReqQL(host+"/open/scripts","put",body,token)
}

//删除脚本
function Delete_QL_Script(host,token,filename,path){
	let body={
			"filename": filename,
			"path": path
		}
	return ReqQL(host+"/open/scripts","delete",body,token)
}

//执行脚本
function Task_QL_Script(host,token,filename,path){
	let body={
			"filename": filename,
			"path": path
		}
	return ReqQL(host+"/open/scripts/run","put",body,token)
}

//停止执行脚本,未知错误
function Stop_QL_Script(host,token,filename,path){
	let body={
			"filename": filename,
			"path": path
		}
	return ReqQL(host+"/open/scripts/stop","put",body,token)
}


/****************系统管理*******************/
//获取青龙版本，未知错误，获取失败
function Get_QL_Version(host,token){
	return ReqQL(host+"/open/system","get",null,token)
}

//获取青龙日志删除频率,未知错误，获取失败
function Get_QL_SeqLogClear(host,token){
	return ReqQL(host+"/open/system/log/remove","get",null,token)	
}
