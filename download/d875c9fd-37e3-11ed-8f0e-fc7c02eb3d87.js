/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.0
 * @create_at 2022-09-22 14:36:01
* @description qbittorent远程下载,例:下载 magnet:?xt=urn:btih:1AFACF07B8ZXCVCXZV
* @title qbittorent
* @rule 下载 ?
 * @public false
* @admin true
*/

/***********配置填写************* */
//qbittorent所在设备ip及端口，例:http://192.168.31.1:8090
const host="http://127.0.0.1:8080"
//qbittorent登陆用户名
const uname="admin"
//qbittorent登陆密码
const pwd="adminadmin"
/******************************* */



function main(){
    const s = sender
    console.log(s.param(1))
    let ck=Get_QB_CK(host,uname,pwd)
    console.log(ck)
    if(ck!=null){
        if(Add_QB_Torr(host,ck,s.param(1))){
            s.reply("任务添加成功")
            return
        }
    }
    s.reply("任务添加失败")
}

function Get_QB_CK(host,name,password){
    let resp=request({
   		url:host+"/api/v2/auth/login",
    	method:"post",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded"
		},
		body:"username="+name+"&password="+password 
	})
    try{
         return resp.headers["Set-Cookie"].toString().split(";").find(ele=>ele.indexOf("SID")!=-1)
    }
    catch(err){
        return null
    }
}

function Add_QB_Torr(host,ck,urls){
    let resp=request({
   		url:host+"/api/v2/torrents/add",
    	method:"post",
		headers:{
			"Content-Type":"application/x-www-form-urlencoded",
            "Cookie":ck

		},
		body:"urls="+urls 
	})
    console.log(resp)
    try{
         if(resp.body=="Ok.")
            return true
        else
            return false
    }
    catch(err){
        return false
    }    
}

main()