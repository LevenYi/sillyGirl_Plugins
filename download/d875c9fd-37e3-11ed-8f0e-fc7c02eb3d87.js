/**
 * @author https://t.me/sillyGirl_Plugin
 * @version v1.1.0
 * @create_at 2022-09-22 14:36:01
 * @description qbittorrent远程下载
 * @title qbittorrent
 * @rule raw .*(magnet:\?xt=urn:btih:)[0-9a-fA-F]{40}.*
 * @rule raw .*(bc://bt/)[0-9a-fA-F=]+.*
 * @rule 查看下载
 * @rule 下载 ?
 * @public false
 * @admin true
*/

/***********配置命令************* */
// 对接qbittorrent面板
//设置qbittorrent ip及端口，set qbittorent host http://127.0.0.1:8080
//设置qbittorrent登陆用户名:set qbittorent username admin
//设置qbittorrent登陆密码:set qbittorent password adminadmin

// 使用方式：
// 发送磁链直接下载，或者使用"下载 ?"命令搜索资源下载
// 使用"查看下载"命令管理下载任务

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
        tip+="请使用命令'set qbittorent password 账号'设置qb面板登录密码\n"
        s.reply(tip)
        return
    }
    let ck=qb.get("cookie")
    let data=[]
    if(ck){
        data=torrInfo(host,ck,"all")
        if(!data){
            ck=Login(host,uname,pwd)
            qb.set("cookie",ck)
        }
    }
    else{
        ck=Login(host,uname,pwd)
        data=torrInfo(host,ck,"all")
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
        if(!data)
            data=torrInfo(host,ck,"all")
        //console.log(JSON.stringify(data))
        data.forEach((session,index)=>{
            if(display_state.indexOf(session.state) == -1)
                return
            let name=session.name
            let size=(session.size/1024/1024/1024).toString().substring(0,4)
            let progress=(session.progress*100).toString().substring(0,3)
            let speed=(session.dlspeed/1024).toString().substring(0,4)
            const status={
                "downloading":"下载中",
                "pausedDL":"暂停",
                "queuedDL":"排队",
                "stalledDL":"下载种子",
                "metaDL":"获取元数据",
                "error":"错误"
            }
            notify+=fmt.sprintf("【%2v】 %v\n%5vGB %5v%% %5vKB/s %s\n\n",index+1,name,size,progress,speed,status[session.state])
        })
        notify+="----------------------------------\n[-删除] [!暂停] [#开始]"
        s.reply(notify)
        let inp=s.listen(20*1000)
        if(inp==null)
            return
        if(Number(inp.getContent()) < 0){
            let session=data[Math.abs(Number(inp.getContent()))-1].hash
            if(torrDel(host,ck,session,true))
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
            if(torrRes(host,ck,hash))
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
            if(torrPau(host,ck,hash))
                s.reply("停止成功")
            else
                s.reply("停止失败")
        }
        else{
            s.setContent(inp.getContent())
            s.continue()
        }
    }
    else if(s.getContent().match(/^下载 /)){
        // let status=searchStatus(host,ck)
        // if(status)
        //     console.log(JSON.stringify(status))
        // status.forEach(statu=>{
        //     if(searchDel(host,ck,statu.id))
        //         console.log("删除成功"+statu.id)
        //     else
        //         console.log("删除失败"+statu.id)
        // })
        // return
        let searchjob=searchStart(host,ck,s.param(1))
        let msg=""
        if(!searchjob){
            s.reply("搜索启动失败")
            return
        }
        else
            s.reply("正在搜索，请稍候...")
        console.log("id:"+searchjob)
        let limit=10,maxnum=20  //轮询次数限制与输出资源数量限制
        let results=[]
        while(limit-->0){
            sleep(3000)
            let temp=searchResult(host,ck,searchjob,20,results.length)
            if(temp.length){
                console.log("搜索引擎"+temp[0].descrLink.match(/https?:\/\/[^\/]+/))
                console.log(results.length+"+"+temp.length)
                //console.log(JSON.stringify(temp))
            }
            results=results.concat(temp)
            if(results.length>maxnum)
                break
        } 
        //删除搜索任务   
        let searchjobs=searchStatus(host,ck)
        // if(searchjobs)
        //     console.log(JSON.stringify(searchjobs))
        searchjobs.forEach(job=>{
            if(searchDel(host,ck,job.id))
                console.log("删除成功:"+job.id)
            else
                console.log("删除失败:"+job.id)
        })

        if(!results.length){
            s.reply("未搜索到资源")
            return
        }  
        if(results.length>maxnum)   //搜索到的资源过多时仅输出前20项，防止输出失败
            results=results.slice(0,maxnum)  
        results.forEach((result,i)=>msg+="【"+(i+1)+"】 "+result.fileName+" "+TranSize(result.fileSize)+"\n")
        s.reply(msg)
        //console.log(msg)
        let inp=s.listen(60000)
        if(!inp || isNaN(Number(inp.getContent())) || Math.abs(inp.getContent())>maxnum){
            s.reply("未选择或者输入有误")
            return
        }
        if(torrAdd(host,ck,results[inp.getContent()-1].fileUrl))    
            s.reply("任务添加成功")
        else
            s.reply("任务添加失败")
    }
    else{
        if(torrAdd(host,ck,s.getContent()))
            s.reply("任务添加成功")
        else
            s.reply("任务添加失败")
    } 
}

//文件大小转换，size单位比特
function TranSize(size){
    const SIZE=["B","KB","MB","GB","TB","PB"]
    const units=1024
    let count=0
    while(true){
        if(size<1000)
            break
        else{
            size=size/units
            count++
        }
    }
    size=size.toString().substring(0,4)
    if(count<SIZE.length)
        return size+SIZE[count]
    else
        return "too big or error"
}

function ReqQb(url,method,headers,body){
    let option={url}
    if(method)
        option.method=method
    if(headers)
        option.headers=headers
    if(body)
        option.body=body
}

/***************登陆***************** */
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
        console.log("qbittorent login in failed\n"+JSON.stringify(resp))
        return null
    }
}
/***************资源搜索***************** */
//获取搜索任务状态
function searchStatus(host,ck,id){
    let url=host+"/api/v2/search/status"
    if(id)
        url+="?id="+id
    let resp=request({
   		url:url,
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck
		}
	})
    try{
        return JSON.parse(resp.body)
    }catch(err){
        console.log(JSON.stringify(resp))
        return false
    } 
}

//开始搜索searchValue，默认使用所有搜索引擎搜索所有类型资源，返回搜索任务id
function searchStart(host,ck,searchValue,category,plugins){
    let resp=request({
   		url:host+"/api/v2/search/start",
    	method:"post",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		},
		body:"pattern="+encodeURI(searchValue)+ "&category=all&plugins=enabled" 
	})
    try{
        return JSON.parse(resp.body).id
    }catch(err){
        console.log(JSON.stringify(resp))
        return false
    }
}
//获取搜索任务id的搜索结果
function searchResult(host,ck,id,limit,offset){
    let resp=request({
   		url:host+"/api/v2/search/results",
    	method:"post",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		},
		body:"id="+ id + "&limit="+limit+"&offset="+offset
	})
    try{
        let data=JSON.parse(resp.body)
        if(data.status=="Running")
            return data.results
        else{
            console.log(resp.body)
            return false
        }
    }catch(err){
        console.log(JSON.stringify(resp))
        return false
    }
}

//停止搜索任务
function searchStop(host,ck,id){
    let resp=request({
   		url:host+"/api/v2/search/stop?id="+id,
    	method:"post",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    if(resp.status==200)
        return true
    else{
        console.log(JSON.stringify(resp))
        return false
    }
}

//删除搜索任务
function searchDel(host,ck,id){
    let resp=request({
   		url:host+"/api/v2/search/delete?id="+id,
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    if(resp.status==200)
        return true
    else{
        console.log(JSON.stringify(resp))
        return false
    }
}

/***************下载***************** */
//继续下载
function torrRes(host,ck,hashes){
    let resp=request({
   		url:host+"/api/v2/torrents/resume?hashes="+hashes,
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    if(resp.status==200)
        return true
    else{
        console.log("qbittorent Resume failed\n"+JSON.stringify(resp))
        return false
    }
}

//暂停下载
function torrPau(host,ck,hashes){console.log(hashes)
    let resp=request({
   		url:host+"/api/v2/torrents/pause?hashes="+hashes,
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    //console.log(JSON.stringify(resp))
    if(resp.status==200)
        return true
    else{
        console.log("qbittorent Pause failed\n"+JSON.stringify(resp))
        return false
    }
}

//删除下载任务
function torrDel(host,ck,hashes,deleteFiles){
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
    else{
        console.log("qbittorent Delete failed\n"+JSON.stringify(resp))
        return false
    }
}


//获取下载任务
function torrInfo(host,ck,filter){
    let resp=request({
   		url:host+"/api/v2/torrents/info?filter="+(filter?filter:"all"),
    	method:"get",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		}
	})
    if(resp.status==200)
        return JSON.parse(resp.body)
    else{
        console.log("qbittorent GetTorrent failed\n"+JSON.stringify(resp))
        return null
    }
}

//添加下载任务
function torrAdd(host,ck,urls){
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
    else{
        console.log("qbittorent torrAddent failed\n"+JSON.stringify(resp))
        return false
    }
}

main()