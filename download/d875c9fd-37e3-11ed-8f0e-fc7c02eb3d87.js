/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.1
 * @create_at 2022-09-22 14:36:01
* @description qbittorent远程下载,需填写qb地址及账户密码，使用命令:直接发送磁链
* @title qbittorent
* @rule raw .*(magnet:\?xt=urn:btih:)[0-9a-fA-F]{40}.*
* @rule raw .*(bc://bt/)[0-9a-fA-F=]+.*
* @rule 查看下载
 * @public false
* @admin true
*/

/***********配置************* */
//qbittorent ip及端口，set qbittorent host http://127.0.0.1:8080

//qbittorent登陆用户名:set qbittorent username admin

//qbittorent登陆密码:set qbittorent password adminadmin

/******************************* */



const s = sender

function main(){
    const qb=new Bucket("qbittorent")
    const host=qb.get("host")
    const uname=qb.get("username")
    const pwd=qb.get("password")
    if(!host || !uname || !pwd){
        let tip="请使用命令'set qbittorent host ip:端口'设置qb面板地址\n"
        tip+="请使用命令'set qbittorent username 账号'设置qb面板登录账号\n"
        tip+="请使用命令'set qbittorent password 账号'设置qb面板登录账号\n"
        s.reply(tip)
        return
    }
    let ck=qb.get("cookie")
    let data=[]
    if(ck){
        data=Get_AllTorr(host,ck)
        if(!data){
            ck=Login(host,uname,pwd)
            qb.set("cookie",ck)
        }
    }
    else{
        ck=Login(host,uname,pwd)
        data=Get_AllTorr(host,ck)
        qb.set("cookie",ck)
    }
    if(!ck){
        s.reply("登陆失败,请检查账号与密码是否设置正确")
        return
    }
    //console.log(ck)
    if(s.getContent()=="查看下载"){
        let notify="序号 任务名 资源大小 下载进度 速率 状态\n----------------------------------\n"
        let display_state=["downloading","pausedDL","queuedDL","stalledDL","metaDL","error"]
        //console.log(JSON.stringify(data))
        data.forEach((session,index)=>{
            if(display_state.indexOf(session.state) == -1)
                return
            let name=session.name
            let size=(session.size/1024/1024/1024).toString().substring(0,4)
            let progress=(session.progress*100).toString().substring(0,3)
            let speed=(session.dlspeed/1024).toString().substring(0,4)
            notify+=fmt.sprintf("%2v、【%v】\n%5vGB %5v%% %5vKB/s ",index+1,name,size,progress,speed)
            if(session.state=="pausedDL")
                notify+=" 暂停\n\n"
            else if(session.state=="queuedDL")
                notify+="排队\n\n"
            else if(session.state=="stalledDL")
                notify+="未连接\n\n"
            else if(session.state=="metaDL")
                notify+="获取种子\n\n"
            else if(session.state=="error")
                notify+=" 错误\n\n"
             else
                notify+="\n\n"
            //     notify+=session.name+ "其他状态\n"
        })
        notify+="----------------------------------\n[-删除] [!暂停] [#开始]"
        s.reply(notify)
        let inp=s.listen(20*1000)
        if(inp==null)
            return
        if(Number(inp.getContent())){
            let session=data[Math.abs(Number(inp.getContent()))-1].hash
            if(Del_Torr(host,ck,session,true))
                s.reply("删除成功")
            else
                s.reply("删除失败")
        }
        else if(inp.getContent().match(/^#\d+$/)!=null){
            let n=inp.getContent().match(/\d+/)[0]
            if(n==0)
                hash="all"
            else
                hash=data[n-1].hash
            if(Resume_Torr(host,ck,hash))
                s.reply("启动成功")
            else
                s.reply("启动失败")
        }
        else if(inp.getContent().match(/^[！!]\d+$/)!=null){
            let n=inp.getContent().match(/\d+/)[0]
            if(n==0)
                hash="all"
            else
                hash=data[n-1].hash
            if(Pause_Torr(host,ck,hash))
                s.reply("停止成功")
            else
                s.reply("停止失败")
        }
        else{
            s.setContent(inp.getContent())
            s.continue()
        }
    }
    else{
        if(Add_Torr(host,ck,s.getContent())){
            s.reply("任务添加成功")
            return
        }
        else
            s.reply("任务添加失败")
    } 
}

function TranSize(size){
    let units=1024
    let count=0
    while(size/units>units){
        size=size/units
        count++
    }
    size=size.toString().substring(0,4)
    if(count==0)
        return size+"B"
    else if(count==1)
        return size+"KB"
    else if(count==2)
        return size+"MB"
    else if(count==3)
        return size+"GB"
    else if(count==4)
        return size+"TB"
    else if(count==5)
        return size+"PB"
    else
        return "too big or error"
}

function Login(host,name,password){
    let resp=request({
   		url:host+"/api/v2/auth/login",
    	method:"post",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded"
		},
		body:"username="+name+"&password="+password 
	})
    try{
         return resp.headers["Set-Cookie"][0].split(";").find(ele=>ele.indexOf("SID")!=-1)
    }
    catch(err){
        return null
    }
}

function Resume_Torr(host,ck,hashes){
    let resp=request({
   		url:host+"/api/v2/torrents/resume?hashes="+hashes,
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    //console.log(SON.stringify(resp))
    if(resp.status==200)
        return true
    else
        return false
}

function Pause_Torr(host,ck,hashes){console.log(hashes)
    let resp=request({
   		url:host+"/api/v2/torrents/pause?hashes="+hashes,
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    //console.log(SON.stringify(resp))
    if(resp.status==200)
        return true
    else
        return false
}

function Del_Torr(host,ck,hashes,deleteFiles){
    let resp=request({
   		url:host+"/api/v2/torrents/delete?hashes="+hashes+"&deleteFiles="+deleteFiles,
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    //console.log(hashes+"\n"+deleteFiles+"\n"+JSON.stringify(resp))
    if(resp.status==200)
        return true
    else
        return false
}

function Get_DownloadngTorr(host,ck){
    let resp=request({
   		url:host+"/api/v2/torrents/info?filter=downloading",
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    if(resp.status==200)
        return JSON.parse(resp.body)
    else
        return null
}

function Get_AllTorr(host,ck){
    let resp=request({
   		url:host+"/api/v2/torrents/info?filter=all",
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    if(resp.status==200)
        return JSON.parse(resp.body)
    else
        return null
}

function Add_Torr(host,ck,urls){
    let resp=request({
   		url:host+"/api/v2/torrents/add",
    	method:"post",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		},
		body:"urls="+urls 
	})
    if(resp.body=="Ok.")
        return true
    else
        return false
}

main()