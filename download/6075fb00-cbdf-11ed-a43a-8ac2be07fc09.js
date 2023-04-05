/**
 * @title 餐大大
 * @rule 霸王餐
 * @rule 取消霸王餐
 * @origin 自用
 * @create_at 2022-09-11 19:14:23
 * @description 餐大大自动查询霸王餐
 * @author 自用
 * @version v1.0.1
 * @public false
 * @disable false
 * @cron 1-59/20 * * * *
 * @icon https://hi.kejiwanjia.com/wp-content/uploads/2022/01/%E4%B8%8B%E8%BD%BD-1.jpeg
 */

let Headers={
    'authorization':'Bearer '+new Bucket('otto').get('cdd_token')
}
const s = sender
const silly=new SillyGirl()

function main() {
    if(s.getPlatform()=="cron"){
        getActs()
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
        if(index==NaN)
            return
        Attend(acts[index],formToken())
    }
    else{
        let acts=Attended()
        let index=null
        let inp=s.listen(60000)
        if(!inp)
            return
        else
            index=inp.getContent()-1
        if(index==NaN)
            return
        let id=acts[index].id
        if(Cancel(id))
            s.reply("ok")
        else
            s.reply("failed")
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
                message+=record.length+"、"+temp.title+":"+rule.amountOne+"-"+rule.amountTwo+"\n\n"
            }
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
            "longitude":"113.8930676917588",
            "dimension":"23.013770219598175",
            "formToken":token
        }
    }
    let resp=request(option)
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.code==1){
            s.reply("ok")
            return data.data.orderId
        }
        else{
            if(data.message)
                s.reply(data.message)
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
    let resp = request("https://bawangcan-prod.csmbcx.com/cloud/mbcx-user-weapp/wx/releaseInformation/selectPageAll/?orderValue=1&current=1&text&lat=23.01376874727772&lng=113.89298058539543&all=0&active=0&type&use=0&size=20") 
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.code==1){
            let message=""
            let notify=""
            //console.log("店铺数量:"+data.data.records.length)
            for(let i=0;i< data.data.records.length;i++){
                let info=data.data.records[i]
                let rule=info.rules.find(rule=>rule.ruleType==2)    //会员返利规则
                let start=new Date(info.effectiveStart+":00")    //活动开始时间
                let end=new Date(info.effectiveEnd+":00")    //活动结束时间
                let rulestr="" //满减规则
                let temp=""
                if(rule.choiceRule==1)
                    rulestr+=":"+rule.amountOne+"-"+rule.amountOne
                else
                    rulestr+=":"+rule.amountOne+"-"+rule.amountTwo
                if(info.distance>4)
                    break
                else if(!info.surplus){  //跳过无名额的店铺
                    console.log(info.informationName+":无名额")
                    continue
                }
                //choiceRule(返利规则): 1(设置返利上限amountOne，此时amountTwo为0)     2(满amountOne返amountTwo)
                else if(rule.choiceRule==1 && rule.amountOne<13){  //跳过返利太少的或者门槛太低的店铺
                    console.log(info.informationName+" 满减太少"+rulestr)
                    continue
                }
                else if(rule.choiceRule==2 && rule.amountTwo<13){ //跳过返利太少的店铺
                    console.log(info.informationName+" 满减太少:"+rulestr)
                    continue
                }
                else if(now.getTime()>end.getTime()){   //活动已结束
                    console.log(info.informationName+" 已结束"+info.effectiveEndStr)
                    continue
                }
                record.push(info)
                temp+=record.length+"、"+info.informationName
                if(now.getTime()<start.getTime())   //活动尚未开始
                    temp+="("+info.effectiveStartStr+")"
                temp+=rulestr+"("+info.surplus+")\n\n"
                if((info.amountOne>=30||info.amountTwo>=30)&&s.getPlatform()=="cron"){
                    notify+=temp
                }
                else
                    message+=temp
            }
            if(s.getPlatform()!="cron")
                s.reply(message)
            else
                silly.push({
		            platform:"qq",//推送平台,选填qq/tg/wx
                    userId:"3176829386",//推送到的账号的id
                    content:message
	        })
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
