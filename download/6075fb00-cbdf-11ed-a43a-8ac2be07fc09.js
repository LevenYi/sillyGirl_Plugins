/**
 * @title 餐大大
 * @rule 霸王餐
 * @rule 取消霸王餐
 * @rule 霸王餐 ?
 * @rule 自动霸王餐
 * @rule 切换霸王餐
 * @rule 捡漏
 * @origin 自用
 * @create_at 2022-09-11 19:14:23
 * @description 自用插件，请勿使用,已废弃
 * @author https://t.me/sillyGirl_Plugin
 * @version v1.0.1
 * @public false
 * @cron 0 9-22 * * *
 * @disable true
 * @admin  true
 * @icon https://hi.kejiwanjia.com/wp-content/uploads/2022/01/%E4%B8%8B%E8%BD%BD-1.jpeg
 */
const now=new Date()
const db=new Bucket("otto")
const accounts=JSON.parse(db.get("cdd_app_token"))
const default_account=accounts.find(account=>account["default"]==true)
const token=default_account?default_account.token:accounts[0].token
let Headers={
    "authorization":"Bearer "+token
}
const s = sender
const silly=new SillyGirl()
const to={
	platform:"qq",  
    userId:"3176829386",    
    content:""
}
function main() {
    if(s.getPlatform()=="cron"){    //自动报名指定霸王餐店铺活动
    //if(s.getContent()=="霸王餐"){ 
        if(db.get("cdd_auto_switch")=="1")
            return
        let acts=getActs()
        let attened=Attended()
        let shops=db.get("cdd_auto").split("&")
        acts.forEach(act=>{
            if(attened.find(activity=>activity.releaseInformationDO.title==act.title)){
                console.log(act.title+"已报名")
                return
            }
            else if(shops.find(shop=>act.title.includes(shop))&& Attend(act,formToken())){
                to.content+="\n已自动报名霸王餐：【"+act.forumNameStr+"】"+act.title
            }
        })
        silly.push(to)
    }
    else if(s.getContent()=="自动霸王餐"){
        if(db.get("cdd_auto_switch")==1){
            s.reply("已开启自动参加霸王餐 "+db.get("cdd_auto"))
            db.set("cdd_auto_switch","0")
        }
        else{
            s.reply("已关闭自动参加霸王餐 "+db.get("cdd_auto"))
            db.set("cdd_auto_switch","1")
        }
    }
    else if(s.getContent().match(/^霸王餐 /)){
        db.set("cdd_auto",s.param(1))
        s.reply("ok")
    }
    else if(s.getContent()=="霸王餐"){ 
        let acts=getActs()
        if(!acts.length){
            s.reply("暂无活动")
            return
        }
        let index=null
        let inp=s.listen(60000)
        if(!inp || inp.getContent()=="q")
            return
        else
            index=inp.getContent()-1
        if(isNaN(index)){
            s.setContent(inp.getContent())
            s.continue()
            return
        }
        Attend(acts[index],formToken())
    }
    else if(s.getContent()=="取消霸王餐"){
        let acts=Attended()
        let record=[]
        let message=""
        for(let i=0;i<acts.length;i++){
            //console.log(acts[i].releaseInformationDO.title)
            if(acts[i].transactionStatus!=1)
                continue
            record.push(acts[i])
            let temp=acts[i].releaseInformationDO
            let rule=temp.rules.find(rule=>rule.ruleType==2)
            if(rule.choiceRule==1)
                rulestr=rule.amountOne+"-"+rule.amountOne
            else
                rulestr=rule.amountOne+"-"+rule.amountTwo
            message+=record.length+"、【"+temp.forumNameStr+"】"+temp.title+":"+rulestr+"\n\n"
        }
        if(!record.length){
            s.reply("无活动可取消")
            return
        }
        else
            s.reply(message) 
        let index=null
        let inp=s.listen(60000)
        if(!inp)
            return
        else
            index=inp.getContent()-1
        if(isNaN(index)){
            s.setContent(inp.getContent())
            s.continue()
            return
        }
        if(Cancel(record[index].id))
            s.reply("ok")
        else
            s.reply("failed")
    }
    else if(s.getContent()=="切换霸王餐"){
        let i=accounts.findIndex(account=>account["default"])
        //console.log(i)
        if(i==-1){
            accounts[0]["default"]=true
            s.reply("切换至"+accounts[0].name)
        }
        else{
            delete accounts[i]["default"]
            next=i==accounts.length-1 ? 0 : i+1
            accounts[next]["default"]=true
            s.reply("切换至"+accounts[next]["name"])
        }
        db.set("cdd_app_token",JSON.stringify(accounts))
    }
    else if(s.getContent()=="捡漏"){
        SecondHandSpy()
    }
}


//捡漏监控
function SecondHandSpy(){
    return
    let option={
        url:"https://api.coolapk.com/v6/page/dataList?url=%2Fpage%3Furl%3D%252Fproduct%252FfeedList%253Ftype%253Dtrade%2526id%253D1654%2526listType%253Ddateline_desc&title=%E4%BA%A4%E6%98%93&subTitle=&page=1",
        headers:{
			"X-Requested-With":"XMLHttpRequest",			
"X-Sdk-Int":"31",			
"X-Sdk-Locale":"zh-CN",			
"X-App-Id":"com.coolapk.market",			
"X-App-Token":"v2JDJ5JDEwJE1UWTVNelUxTVRrNU9BLzVjOGQ3YU9Qd1gybjFXMFowdjJlTWREM2R5bWFTaHJHWFdBMXJ1",			
"X-App-Version":"12.5.2",			
"X-App-Code":"2211031",			
"X-Api-Version":"12",			
"X-App-Device":"QjYjRmZxAjM4UWNmlTOjBDI7MXeltWL0NXZ0BSMwAjL2ADMxEjMuETULNFI7ATMgkWTgsTat9WYphFI7kWbvFWaYByOgsDI7AyOjZWSTN3YHt0TvlVWNlVYPZFc1JWaJlmQh91SCxUcwRDOSVFR",			
"X-Dark-Mode":"0",			
"X-App-Channel":"coolapk",			
"X-App-Mode":"universal",			
"X-App-Supported":"2211031",			
"Host":"api.coolapk.com",			
"Connection":"Keep-Alive",			
"Accept-Encoding":"gzip",			
"Cookie":"uid=2786755; username=Leven_Yi; token=5ece14078CwBXMDAIDwrgTdHPGr7CHuXskaPTAr-y2BTHyCqKNFCN6MBnKuTcLTjMWt0dwRvwM-hcU2ulZzYxoPHm3Gh5lSM_hVu5zBzo6GsTOoSkYKnlTC9YyQez8N1fHpjzfvbERVBnw_-Yqhuv5DVn--raY7T7qSVjZiVASeidhTDtlk-Shm5wpAqFRAm3wSLolb_",	
             //"Cookie": db.get("coolapk_cookie")
        },
        method:"get",
       json:true
    }
    let resp=request(option)
    console.log(JSON.stringify(option)+"\n\n"+JSON.stringify(JSON.parse(resp.body)))
    let data=resp.body
    let lastID=db.get("coolapk_ershouid")
    if(data&& data.data && data.data.length){
        if(lastID!=data.data[0].id)
            db.set("coolapk_ershouid",data.data[0].id)
        for(let i=0;i<data.data.length;i++){
            let info=data.data[i]       
            let temp=info.message_title+"\n"+info.message.replace(/<a.*<\/a>/,"")
            if(info.ershou_info)
                temp+="\n\n【"+info.ershou_info.product_price+"】"+info.ershou_info.link_url
            //else console.log(JSON.stringify(info))
            console.log(temp)
            if(s.getPlatform()=="cron" && info.id==lastID)
                break     
            else if( i<3 &&info.ershou_info.ershou_status>0){
                s.reply(temp)
                sleep(2000)
            }

            to.content+="\n\n"+temp
        }
    }
}

//获取今日已参加活动列表
function Attended(){
    let record=[]   //记录输出的店铺活动
    let resp = request({
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/orderManagement?transactionStatus&current=1&size=10",
        headers:Headers
    }) 
    if(resp.status==200){
        //console.log(resp.body)
        let data=JSON.parse(resp.body)
        if(data.code==1){
            for(info of data.data.records){
                const time=new Date(info.createTime)
                //console.log(info.releaseInformationDO.title+"\n"+time.getDate()+":"+now.getDate())
                if(time.getDate()!=now.getDate()){
                    break
                }
                else
                    record.push(info)
            }
            // let message=""
            // for(let i=0;i< data.data.records.length;i++){
            //     let info=data.data.records[i]
                // if(info.transactionStatus!=1)
                //     break
                // record.push(info)
                // let temp=info.releaseInformationDO
                // let rule=temp.rules.find(rule=>rule.ruleType==2)
                // if(rule.choiceRule==1)
                //     rulestr=rule.amountOne+"-"+rule.amountOne
                // else
                //     rulestr=rule.amountOne+"-"+rule.amountTwo
                // message+=record.length+"、【"+temp.forumNameStr+"】"+temp.title+":"+rulestr+"\n\n"
            //}
            // if(s.getPlatform()!="cron")
            //     s.reply(message)
        }
    }
    return record   
}

//获取未核销店铺数量
function NosubNum(){
    let resp=request({
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/orderManagement/selectNoSubmitJobNumber",
        headers:Headers
    })
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.code==1)
            return data.data
    }
    return 0   
}

//取消店铺活动
function Cancel(id){
    let option={
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/orderManagement?orderId="+id,
        method:"put",
        headers:Headers
    }
    let resp=request(option)
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.code==1)
            return data.data
        else
            console.log(resp.body)
    }
    else
        console.log(JSON.stringify(resp))
    return false
}

//参加店铺活动
function Attend(act,token){
    console.log(JSON.stringify(act)+"\n\n"+token)
    let option={
        url:"https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/orderManagement",
        method:"post",
        headers:Headers,
        body:{
            "relId":act.rules[1].relId,
            "longitude":db.get("cdd_longitude"),
            "dimension":db.get("cdd_dimension"),
            "formToken":token
        }
    }
    //console.log(JSON.stringify(option.body))
    let resp=request(option)
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.code==1){
            s.reply("ok")
            return data.data.orderId
        }
        else{
            if(data.message){
                if(s.getPlatform()!="cron")
                    s.reply(data.message)
                else
                    to.content+=act.title+":"+data.message+"\n\n"
            }
            else 
                s.reply(resp.body)
        }
    }
    else
        console.log(JSON.stringify(resp))
    return false
}

//获取符合参与条件的店铺活动
function getActs(){
    let record=[]   //记录输出的店铺活动
    let resp = request("https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/releaseInformation/selectPageAll/?orderValue=1&current=1&text&all=0&active=0&type&use=0&size=20"+db.get("cdd_location")) 
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.code==1){
            let message=""
            let log=""
            console.log(JSON.stringify(data.data.records))
            for(let i=0;i< data.data.records.length;i++){
                let info=data.data.records[i]
                let rule=info.rules.find(rule=>rule.ruleType==2)    //会员返利规则
                let start=new Date(info.effectiveStart+":00")    //活动开始时间
                let end=new Date(info.effectiveEnd+":00")    //活动结束时间
                let rulestr="" //返利规则
                let payed=0,rebate=0    //返利门槛及数额
                let temp=info.informationName.split("】")
                let shop=temp.length==2?temp[1]:temp[0]    //店铺名称

                if(rule.choiceRule==1){
                    rulestr+=":"+rule.amountOne+"-"+rule.amountOne
                    payed=rebate=rule.amountOne
                }
                else{
                    rulestr+=":"+rule.amountOne+"-"+rule.amountTwo
                    payed=rule.amountOne
                    rebate=rule.amountTwo
                }
                if(info.distance>4) //店铺距离太远
                    break
                else if(!info.surplus){  //跳过无名额的店铺
                    log+=info.forumNameStr+"-"+shop+":无名额\n"
                    continue
                }
                //choiceRule(返利规则): 1(满amountOne返amountOne，此时amountTwo为0)     2(满amountOne返amountTwo)
                else if(rule.choiceRule==1 && rule.amountOne<13){  //跳过返利太少的或者门槛太低的店铺
                    log+=info.forumNameStr+"-"+shop+" 返利太少"+rulestr+"\n"
                    continue
                }
                else if(rule.choiceRule==2 && rule.amountTwo<13){ //跳过返利太少的店铺
                    log+=info.forumNameStr+"-"+shop+" 返利太少"+rulestr+"\n"
                    continue
                }
                else if(info.forumNameStr=="美团" && rule.choiceRule==2 && rule.amountOne>=30 && rule.amountOne-rule.amountTwo<=10){   //特殊情况
                    info["attend"]=true     //自动参加
                }
                else if(payed-rebate>3){
                    log+=info.forumNameStr+"-"+shop+"返利比例太少"+rulestr+"\n"
                    continue
                }
                else if(now.getTime()>end.getTime()){   //活动已结束
                    log+=info.forumNameStr+"-"+shop+" 已结束"+info.effectiveEndStr+"\n"
                    continue
                }
                
                message+=(record.length+1)+"、【"+info.forumNameStr+"】"+shop
                if(now.getTime()<start.getTime()){
                    message+="("+info.effectiveStartStr+")"
                    if(s.getPlatform()!="cron")
                        record.push(info)
                    else
                        log+=info.forumNameStr+"-"+shop+info.effectiveStart+"未到报名时间\n"
                }
                else
                    record.push(info)
                message+=rulestr+"("+info.surplus+")\n\n"
            }
            console.log(log)
            if(s.getPlatform()!="cron"){
                s.reply(message)
            }
            // else{
            //     to.content=notify
            //     silly.push(to)
            // }
        }
    }
    return record
}

//获取参加店铺活动的token
function formToken(){
    let resp=request("https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/user/getFormToken")
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.code==1)
            return data.data
    }
    return ""
}

main()
