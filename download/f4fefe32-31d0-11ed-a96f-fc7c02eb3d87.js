/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.1
* @create_at 2022-09-08 15:06:22
* @description 自用打卡
* @title 定时任务
* @rule ^session_id=
* @rule 执行定时
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
		platform:"tg",//推送平台,选填qq/tg/wx
        userId:"1748961147",//推送到的账号的id
	}

const ql=require("qinglong")
const st=require("something")
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
        cdd()
        head_auto_change()
        if(s.getPlatform()=="cron"){
            NotifyTo["content"]=message
            sillyGirl.push(NotifyTo)
        }
        else
            s.reply(message)
    }
    else if(s.getContent().match(/^session_id=/)){
        let db=new Bucket("otto")
        let data=db.get("cdd")
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
            db.set("cdd",JSON.stringify(users))
            s.reply("添加成功")
        }
        else if(choose=="q"){
            s.reply("退出")
            return
        }
        else{
            try{
                users[choose-1].session_id=s.getContent()
                db.set("otto",JSON.stringify(users))
                s.reply("更新成功")
            }
            catch(err){
                s.reply(err)
            }
        }
    }
}



function head_auto_change(){
    let nochange=[]  //维持不动的车头账号
    let autonum=15  //自动更换的车头账号数量
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
    let data=(new Bucket("otto")).get("cdd")
    if(!data)
        return "无账号数据"
    let users=JSON.parse(data)
    // let users=[
    //     {
    //         name:"大号",
    //         ck:"session_id=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbnRyeV9sb2dpbiI6MSwiZXhwIjoxNjc1MDc5ODM5LjA0NzUzMiwiY29ycF9pZF9zdHIiOiIxNzQ1NjU5NDk1MjA1MTY5MTUzIiwiY29ycF9pZCI6MTc0NTY1OTQ5NTIwNTE2OTE1MywiZXVfaWFfb3BlbmlkIjoib1VwSnF3YTFTb3FseVU5MGFudl9IVk1lSW8zbyIsImV1X2xvZ2luX3N0YXR1cyI6InMiLCJldV9leHRfaWQiOiJ3bWdpelVEUUFBM3F5OWxBbVVzT1BXLWpsZXUtZWpaUSIsImNoZWNrX2luOnJqemlnM2F4NTp1bmlvbmlkIjoib1VwSnF3YTFTb3FseVU5MGFudl9IVk1lSW8zbyJ9.lSUR-jvm4RWyRemxwxlonBzM1j3ZAhjjqZJY_oSfr_s"
    //     },
    //             {
    //         name:"小号",
    //         ck:"session_id=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbnRyeV9sb2dpbiI6MSwiZXhwIjoxNjc2NDAyMzA1LjIyNDM1OCwiY29ycF9pZF9zdHIiOiIxNzQ1NjU5NDk1MjA1MTY5MTUzIiwiY29ycF9pZCI6MTc0NTY1OTQ5NTIwNTE2OTE1MywiZXVfaWFfb3BlbmlkIjoib1VwSnF3ZkdEXzBxZTFwYzF6aUdwNFhSdlFrQSIsImV1X2xvZ2luX3N0YXR1cyI6InMiLCJldV9leHRfaWQiOiJ3bWdpelVEUUFBSWR1YjVaWWY2eVFXUDFFX0dsd2VWZyIsImNoZWNrX2luOnJqemlnM2F4NTp1bmlvbmlkIjoib1VwSnF3ZkdEXzBxZTFwYzF6aUdwNFhSdlFrQSJ9.X2_VQqvWV4-Kimgu2GoFI4Y7KoeKkWH2PAGMzaukWMM"
    //     }
    // ]
    users.forEach(user=>sign(user))
    return message
}

function sign(user){
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
        console.log(resp.body)
		let result=JSON.parse(resp.body)	
		if(result.success){
            message+=user.name+":打卡成功\n"
        }
        else{
            message+=user.name+":"+result.status_message+"\n"
        }
    }
    catch (e) {
		console.log(e+"\n"+resp)
	}
}

main()