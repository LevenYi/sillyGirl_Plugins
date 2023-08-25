/**
 * @title 餐大大
 * @rule 霸王餐
 * @rule 取消霸王餐
 * @rule 霸王餐 ?
 * @rule 自动霸王餐
 * @rule 切换霸王餐
 * @origin 自用
 * @create_at 2022-09-11 19:14:23
 * @description 餐大大霸王餐报名、取消、自动报名，自用插件，请勿使用
 * @author 自用
 * @version v1.0.1
 * @public false
 * @cron 0-59/10 9-22 * * *
 * @disable false
 * @admin  true
 * @icon https://hi.kejiwanjia.com/wp-content/uploads/2022/01/%E4%B8%8B%E8%BD%BD-1.jpeg
 */
const db=new Bucket('otto')
let accounts=JSON.parse(db.get('cdd_app_token'))
let default_account=accounts.find(account=>account["default"]==true)
let token=""
if(default_account)
    token=default_account.token
else
    token=accounts[0].token
let Headers={
    'authorization':'Bearer '+token
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
        let autoattend=db.get("cdd_auto").split("&")
       //acts.forEach(act=>console.log(act.title))
        autoattend.forEach(shop=>{
            let act=attened.find(act=>act.releaseInformationDO.title.indexOf(shop)!=-1)
            if(act){
                console.log(shop+"已报名")
                return
            }
            act=acts.find(act=>act.title.indexOf(shop)!=-1 )
            //console.log(JSON.stringify(act))
            if(!act){
                console.log(shop+"暂无活动")
                return
            }
            else if(Attend(act,formToken())){
                to.content+="\n已自动报名霸王餐：【"+act.forumNameStr+"】"+act.title
            }
            console.log(to.content)
            silly.push(to)
        })

    }
    else if(s.getContent()=="自动霸王餐"){
        if(db.get("cdd_auto_switch")==1){
            s.reply("已开启自动参加霸王餐："+db.get("cdd_auto"))
            db.set("cdd_auto_switch","0")
        }
        else{
            s.reply("已关闭自动参加霸王餐："+db.get("cdd_auto"))
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
    else if(s.getContent()=='取消霸王餐'){
        let acts=Attended()
        if(!acts.length){
            s.reply("没有已参加的活动")
            return
        }
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
        let id=acts[index].id
        if(Cancel(id))
            s.reply("ok")
        else
            s.reply("failed")
    }
    else if(s.getContent()=='切换霸王餐'){
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
}


//获取已参加活动列表
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
            let message=""
            //console.log("店铺数量:"+data.data.records.length)
            for(let i=0;i< data.data.records.length;i++){
                let info=data.data.records[i]
                if(info.transactionStatus!=1)
                    break
                record.push(info)
                let temp=info.releaseInformationDO
                let rule=temp.rules.find(rule=>rule.ruleType==2)
                if(rule.choiceRule==1)
                    rulestr=rule.amountOne+"-"+rule.amountOne
                else
                    rulestr=rule.amountOne+"-"+rule.amountTwo
                message+=record.length+"、【"+temp.forumNameStr+"】"+temp.title+":"+rulestr+"\n\n"
            }
            if(s.getPlatform()!="cron")
                s.reply(message)
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
    //console.log(JSON.stringify(act)+"\n\n"+token)
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
                //if(s.getPlatform()!="cron")
                    s.reply(data.message)
                //to.content=data.message
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
    let now=new Date()
    let resp = request("https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/releaseInformation/selectPageAll/?orderValue=1&current=1&text&all=0&active=0&type&use=0&size=20"+db.get("cdd_location")) 
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.code==1){
            let message=""
            let notify="",log=""
            //console.log(JSON.stringify(data.data.records))
            for(let i=0;i< data.data.records.length;i++){
                let info=data.data.records[i]
                let rule=info.rules.find(rule=>rule.ruleType==2)    //会员返利规则
                let start=new Date(info.effectiveStart+":00")    //活动开始时间
                let end=new Date(info.effectiveEnd+":00")    //活动结束时间
                let rulestr="" //满减规则
                let payed=0,rebate=0    //返利门槛及数额
                let temp=""
                if(rule.choiceRule==1){
                    rulestr+=":"+rule.amountOne+"-"+rule.amountOne
                    payed=rebate=rule.amountOne
                }
                else{
                    rulestr+=":"+rule.amountOne+"-"+rule.amountTwo
                    payed=rule.amountOne
                    rebate=rule.amountTwo
                }
                if(info.distance>4)
                    break
                else if(!info.surplus){  //跳过无名额的店铺
                    log+=info.forumNameStr+"-"+info.informationName+":无名额\n"
                    continue
                }
                //choiceRule(返利规则): 1(满amountOne返amountOne，此时amountTwo为0)     2(满amountOne返amountTwo)
                else if(rule.choiceRule==1 && rule.amountOne<13){  //跳过返利太少的或者门槛太低的店铺
                    log+=info.forumNameStr+"-"+info.informationName+" 返利太少"+rulestr+"\n"
                    continue
                }
                else if(rule.choiceRule==2 && rule.amountTwo<13){ //跳过返利太少的店铺
                    log+=info.forumNameStr+"-"+info.informationName+" 返利太少"+rulestr+"\n"
                    continue
                }
                else if(payed-rebate>3){
                    log+=info.forumNameStr+"-"+info.informationName+"返利比例太少"+rulestr+"\n"
                    continue
                }
                else if(now.getTime()>end.getTime()){   //活动已结束
                    log+=info.forumNameStr+"-"+info.informationName+" 已结束"+info.effectiveEndStr+"\n"
                    continue
                }
                record.push(info)
                let namet=info.informationName.split("】")
                let name=namet.length==2?namet[1]:namet[0]
                temp+=record.length+"、【"+info.forumNameStr+"】"+name
                if(now.getTime()<start.getTime())   //活动尚未开始
                    temp+="("+info.effectiveStartStr+")"
                temp+=rulestr+"("+info.surplus+")\n\n"
                if((rule.amountOne>=30||rule.amountTwo>=30) && s.getPlatform()=="cron"){
                    notify+=temp
                }
                 message+=temp
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
