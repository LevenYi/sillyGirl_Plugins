/**
 * @author https://t.me/sillyGirl_Plugin
 * @version v1.0.1
 * @create_at 2022-09-08 15:06:22
 * @description 自用打卡
 * @title 自动任务
 * @rule ^session_id=
 * @rule 执行定时
 * @rule ip
 * @cron 34 10 * * *
 * @public false
 * @admin true
 * @disable false
*/
//触发命令可在上面rule项修改，定时规则可在上面cron项修改

//填入多任务命令
const Mission=["移动 1 7","移动 7 1"]
//多任务之间的执行时间间隔，单位：分钟
const Delay=1

//可在""中间填入自动执行定时任务时的推送渠道
const NotifyTo={
		platform:"qq",//推送平台,选填qq/tg/wx
        userId:"3176829386",//推送到的账号的id
	}

const ql=require("qinglong")
//const st=require("something")
const s = sender
const sillyGirl=new SillyGirl()
let message=''


function main(){
	// let notify=""
    // let tipid=s.reply("正在执行多任务...\n共"+Mission.length+"个任务待执行，任务执行间隔为"+Delay+"分钟")
	// for(let i=0;i<Mission.length;i++){
	// 	notify+="执行["+Mission[i]+"]:\n"+sillyGirl.session(Mission[i])().message+"\n\n"
	// 	sleep(Delay*60*1000)
	// }
	// if(s.getPlatform()!="cron"){
	// 	s.recallMessage(tipid)
	// 	s.reply("=========执行多任务=========\n"+notify)
	// }
	// else{
    //     NotifyTo["content"]="=========启动定时多任务=========\n"+notify
	// 	sillyGirl.push(NotifyTo)
    // }
	if(s.getContent()=="执行定时"||s.getPlatform()=="cron"){
 //       cdd()
        qlcron_auto_chang("JX抽现金")
        qlcron_auto_chang("JD转赚红包")
        //head_auto_change()
        if(s.getPlatform()=="cron"){
            NotifyTo["content"]=message
            sillyGirl.push(NotifyTo)
        }
        else
            s.reply(message)
    }
    else if(s.getContent().match(/^session_id=/)){
        let db=new Bucket("otto")
        let data=db.get("cdd_wx_token")
        let users=data?JSON.parse(data):[]
        let tip="选择更新的账号或者输入0添加新账号:\n"
        users.forEach((user,i)=>tip+=(i+1)+"、"+user.name+"\n")
        s.reply(tip)
        let inp=s.listen(30000)
        if(!inp){
            s.reply("超时")
            return
        }
        let choose=inp.getContent()
        if(choose=="0"){
            let user={
                session_id:s.getContent(),
                name:""
            }
            s.reply("输入账号备注:")
            inp=s.listen(30000)
            if(!inp){
                s.reply("超时")
                return
            }
            user.name=inp.getContent()
            users.push(user)
            db.set("cdd_wx_token",JSON.stringify(users))
            s.reply("添加成功")
        }
        else if(choose=="q"){
            s.reply("退出")
            return
        }
        else{
            try{
                users[Number(choose)-1].session_id=s.getContent()
                db.set("cdd_wx_token",JSON.stringify(users))
                s.reply("更新成功")
            }
            catch(err){
                s.reply(err)
            }
        }
    }
    else if(s.getContent()=="ip"){
        const otto=new Bucket("otto")
        let data=request("https://myip.ipip.net/")
        s.reply(data.body)
        let ip=data.body.match(/[\d\.]+/)
        let url="http://v2.api.juliangip.com/dynamic/replaceWhiteIp?"
        let params="new_ip="+ip+"&reset=1&trade_no=1376777816253377"
        let temp=params+"&key="+otto.get("jlkey")
        let sign=request({
            url:"http://127.0.0.1:3000/md5",
            method:"post",
            body:{
                text:temp
            }
        }).body
        url+=params+"&sign="+sign
        // console.log(temp+"\n\n"+sign)
        // console.log(url)
        // console.log(request(url).body)
        data=JSON.parse(request(url).body)
        if(data.code==200)
            s.reply("ok")
        else
            s.reply("faild:"+JSON.stringify(data))
    }
    else if(s.getContent()=="提现"){

    }
}


function qlcron_auto_chang(name){
    let QLS=ql.QLS()
    message+="\n\n自动修改任务定时:\n"
    QLS.forEach(QL=>{
        let crons=ql.Get_QL_Crons(QL.host,QL.token)
        if(!crons){ //获取青龙任务失败
            return
        }
        let cron=crons.find(cron=>cron.name==name)
        if(!cron)   //未找到目标任务
            return
        //console.log(JSON.stringify(cron))
        let temp=cron.schedule.split(" ")
        let second=Number(temp[0])
        let minute=Number(temp[1])
        if(second==59){
            second=0
            minute++
        }
        else
            second+=1
        
        temp[0]=second
        temp[1]=minute
        let schedule=temp.join(" ")
        if(ql.Update_QL_Cron(QL.host,QL.token,cron.id ? cron.id :cron._id,cron.name,cron.command,schedule
        )){
            message+=QL.name+"容器:"+name+"定时修改为"+schedule+"\n"
        }
        else
            message+=QL.name+"容器:"+name+"定时修改为"+schedule+"失败\n"
    })
}

function head_auto_change(){
    let nochange=[]  //维持不动的车头账号
    let autonum=16  //自动更换的车头账号数量
    let envname="SYJ_HELP_PIN"  //修改的变量
    let envvalue=[]
    let sep="&"
    let QLS=ql.QLS()
    QLS.forEach(QL=>{
        let envs=ql.Get_QL_Envs(QL.host,QL.token) 
        for(let i=0;i<envs.length && autonum>0;i++){
            if(envs[i].name!="JD_COOKIE")
                continue
            let pin=envs[i].value.match(/(?<=pin=)[^;]+/)[0]
            envvalue.push(pin)
            if(nochange.indexOf(i+1)==-1)
                autonum--
        }
        if(ql.Modify_QL_Config(QL.host,QL.token,[{name:envname,value:envvalue.join(sep)}]))
            message+= "【"+ QL.name+"】自动修改车头变量【"+envname+"】为\""+envvalue.join(sep)+"\"\n"
        else
            message+="【"+ QL.name+"】自动修改车头变量【"+envname+"】失败\n"
    })
    return message
}


function cdd(){
    const otto=new Bucket("otto")

    //微信签到
    // let data=otto.get("cdd_wx_token")
    // if(!data)
    //     return "无账号数据"
    // let users=JSON.parse(data)
    // users.forEach(user=>wx_signtask(user))
    // return

    //APP任务
    data=otto.get("cdd_app_token")
    if(!data)
        return "无账号数据"
    users=JSON.parse(data)
    users.forEach(user=>app(user))
}

function app(user){
    let headers={
        'authorization':'Bearer '+user.token
    }
    message+="【"+user.name+"】\n"
    //签到
    // app_signtask(headers)
    // //执行任务
    // for(let i=0;i<2;i++)
    //     app_task(headers)
    draw(headers)
}


//提现
function draw(headers){ 
    let option={
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/distribution",
        headers,
        method:"get"
    }   
    try{
        //获取账号余额
        let rewards=JSON.parse(request(option).body).data
        message+="账号余额："+rewards.totalAmount+"+"+rewards.surplusAmount+"("+rewards.waitAmount+")\n"
        //if(rewards.surplusAmount==0)    //可提现金额为0
            return
        //获取账号信息
        option.url="https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/user/loginUserInfo"
        let userInfo=JSON.parse(request(option).body).data
        //提现
        option.url="https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/distributionWithdrawal"
        option.method="post"
        option.body={
            name:userInfo.userName,
            account:userInfo.payAccount,
            amount:rewards.surplusAmount
        }
        if(JSON.parse(request(option).body).code==1){
            message+="★成功提现："+rewards.surplusAmount+"\n"
        }
        else
            message+="☆提现:"+rewards.surplusAmount+"失败\n"
    }
    catch(err){
        message+=e+"提现失败\n"
    }
}

function app_task(headers){
    let tasklist=app_tasklist(headers)  //任务列表
    if(!tasklist){
        message+"app任务列表获取失败"
        return
    }
    tasklist.forEach((task,i)=>{
        let temp=[] //最新任务列表
        let info=JSON.parse(JSON.stringify(task))   //当前任务信息
        if(info.userStatus==0){    //报名
            //console.log(JSON.stringify(task))
            if(!app_tasksign(headers,task.id)){
                console.log(task.name+"报名失败")
                return
            }
            else{
                console.log(task.name+"报名成功")     
                sleep(500)
                //刷新任务状态信息
                temp=app_tasklist(headers)
                info=temp.find(ele=>ele.id==task.id)
            }
        }
        if(info.userStatus==1){ //更新用户参与信息以获取userTaskId
            //console.log(JSON.stringify(info))
            let type=0
            if(info.name=="美团红包天天领")
                type=4
            else if(info.name=="饿了么红包天天领")
                type=5
            if(type){
                //执行任务
                sleep(500)
                app_userinfo(headers,type)
                //刷新任务状态信息
                temp=app_tasklist(headers)
                sleep(500)
                temp=app_tasklist(headers)
                info=temp.find(ele=>ele.id==task.id)
            }
        }
        if(info.userStatus==2){ //领取任务奖励
            //console.log(JSON.stringify(info))
            sleep(500)
            if(task.userTaskId && app_reward(headers,task.userTaskId)){
                message+=task.name+"奖励领取成功\n"
            }
            else
                message+=task.name+"奖励领取失败\n"
        }
    })
}

//更新用户报名信息
function app_userinfo(headers,type){
    let data=JSON.parse(request({
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/userUseInfo",
        headers,
        method:"post",
        body:{"type":type}
  
    }).body)
    return data.code==1?true:false   
}

//任务报名
function app_tasksign(headers,taskid){
    let data=JSON.parse(request({
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/sysTask/signTask/"+taskid,
        headers,
        method:"get"    
    }).body)
    return data.code==1?true:false
}
//领取奖励
function app_reward(headers,userTaskId){
    let data=JSON.parse(request({
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/sysTask/receiveRewards",
        headers,
        method:"post",
        body:{"userTaskId":userTaskId,"phone":"","address":"","userName":""}
  
    }).body)
    return data.code==1?true:false
}
//任务列表
function app_tasklist(headers){
    let data=JSON.parse(request({
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/sysTask/selectAllTask",
        headers,
        method:"get"    
    }).body)
    if(data.code==1)
        return data.data.records
    else
        return null
}
//签到
function app_signtask(headers){
    let data=JSON.parse(request({
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/userSignTask",
        headers,
        method:"post",
        body:{}
    }).body)
    if(data.code==1)
        message+="app签到成功\n"
    else
        message+="app签到:"+data.message+"\n"
}

function formToken(){
    let resp=request("https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/user/getFormToken")
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.code==1)
            return data.data
    }
    return ""
}

//微信签到
function wx_signtask(user){
    let stage=[5,10,20,30,50,80,120,170,230,270]
    let option={
	    url: "https://jptduwapqj.ugc.wb.miemie.la/api/check_in_act/check_in?act_hid=rjzig3ax5",
	    method:"post",
        body: {},
	    headers: {
		    "accept": "*/*",
		    "cookie": user.session_id,
			"origin": "https://jptduwapqj.ugc.wb.miemie.la",
			"referer": "https://jptduwapqj.ugc.wb.miemie.la/H5/check_in_act?act_hid=rjzig3ax5&is_hidden_weiban_logo=0&_c=X1BrVllHSWsLBQABW1ZpWl5HQw",
			"User-Agent":"Mozilla/5.0 (Linux; Android 12; Mi 10 Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4375 MMWEBSDK/20220604 Mobile Safari/537.36 MMWEBID/8190 MicroMessenger/8.0.24.2180(0x28001837) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64" ,
			"Content-Type": "application/json",
            "x-requested-with": "com.tencent.mm"
		}
    };
    let resp=request(option) 
    try {
		let result=JSON.parse(resp.body)	
		if(result.success){
            message+=user.name+":成功打卡("+result.info.total_days+"天)\n"
            if(stage.indexOf(result.info.total_days)!=-1)
                message+="已达成阶段成就，可领取会员！\n"
        }
        else{
            console.log(resp.body)
            message+=user.name+":"+result.status_message+"\n"
        }
    }
    catch (e) {
		console.log(e+"\n\n"+resp)
	}
}

main()