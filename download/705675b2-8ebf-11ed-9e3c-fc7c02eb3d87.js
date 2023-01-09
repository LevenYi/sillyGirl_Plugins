/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.3
* @create_at 2022-09-08 15:06:22
* @description 饿了么ck提交与查询,需安装qinglong模块
* @title 饿了么
* @rule elm ?
* @rule 饿了么
* @priority 10
 * @public false
*/

/***********配置************ */
//青龙面板地址:set elm ql_host http://192.168.31.2:6700
//青龙应用id:set elm ql_client_id aaaaaa
//青龙应用密钥:set elm ql_client_secret AAAAAAAAAA

//饿了么变量名
const EnvName="elmCookie"

//允许使用本插件的群聊白名单
const GroupWhiteList=[]
/****************************** */




/***********绑定关系******************* 
elm_bind 饿了么ID [{imtype:qq/wx/tg,id:id}]

**************************************/

const s = sender 
const ql=require("qinglong")
const db=new Bucket("elm_bind")
const elm=new Bucket("elm")

const Host=elm.get("ql_host")
//青龙应用id
const CilentID=elm.get("ql_client_id")
//青龙应用密钥
const CilentSecret=elm.get("ql_client_secret")
function main(){
    if(!s.isAdmin() && s.getChatId() && GroupWhiteList.indexOf(s.getChatId())==-1){
        console.log("非白名单群聊，禁止使用")
        return
    }
    else if(!Host || !CilentID || !CilentSecret){
        let tip="请使用命令'set elm ql_host ip:端口'设置提交饿了么ck与查询饿了么收入的青龙面板地址"
        tip+="请使用命令'set elm ql_client_id 应用id'设置青龙面板的应用id"
        tip+="请使用命令'set elm ql_client_secret 应用密钥'设置青龙面板的应用密钥 "
        s.reply(tip)
        return
    }

    let temp=elm.get("ql_token")
    let token=null
    if(temp)
        token=JSON.parse(temp)
    let envs=ql.Get_QL_Envs(Host,token)
    if(!envs){
        token=ql.Get_QL_Token(Host,CilentID,CilentSecret)
        if(token){
            envs=ql.Get_QL_Envs(Host,token)
            elm.set("ql_token",JSON.stringify(token))
        }
        else{
            console.log("token failed")
            return
        }
    }
    if(!envs){
        s.reply("青龙变量获取失败")
        return
    }

    if(s.getContent()=="饿了么"){
        let elm_ids=db.keys()
        let eids=[]
        elm_ids.forEach(value=>{
                let binds=JSON.parse(db.get(value))
                if(typeof(binds) == "number"){//历史遗留问题，绑定关系数据存储转换
                    binds=[{imtype:s.getPlatform(),id:binds}]
                    db.set(value,JSON.stringify(binds))
                }
                if(binds.some(bind=>bind.imtype==s.getPlatform() && bind.id==s.getUserId()))
                    eids.push(value)  
            })
        if(!eids.length){
            s.reply("未绑定饿了么账号")
            return
        }
        let find=false
        for(let i=0;i<envs.length;i++){
            if(envs[i].name==EnvName){
                let eid=envs[i].value.match(/(?<=USERID=)\d+/)
                if(eid && eids.indexOf(eid[0])!=-1){
                    find=true
                    let bean_info=ElmBeans(envs[i].value)
                    let user_info=ElmUserInfo(envs[i].value)
                    if(bean_info && user_info){
                        let msg="账号："+user_info.username
                        msg+="\n吃货豆总数："+bean_info.amount
                        msg+="\n今日收入："+bean_info.increment
                        msg+="\n今日使用/过期："+bean_info.decrement
                        s.reply(msg)
                    }
                    else{
                        s.reply("查询失败")
                    }
                }
            }
        }
        if(!find)
            s.reply("请重新提交饿了么ck")
    }
    else{
        let ck=s.param(1)
        if(ck.indexOf("SID")==-1 || ck.indexOf("cookie2")==-1 || ck.indexOf("USERID")==-1){
            s.reply("ck有误或者不完整")
            return
        }
        s.recallMessage(s.getMessageId())

        let e_uid=ck.match(/(?<=USERID=)\d+/)[0]
        let find=false
        for(let i=0;i<envs.length;i++){
            if(envs[i].name==EnvName){
                let eid=envs[i].value.match(/(?<=USERID=)\d+/)
                if(eid && eid[0]==e_uid){
                    find=true
                    if(envs[i].id)
                        env_id=envs[i].id
                    else
                        env_id=envs[i]._id
                    if(ql.Update_QL_Env(Host,token,env_id,envs[i].name,ck,envs[i].remarks)){
                        UpdateBind(e_uid)
                        s.reply("更新成功")
                        return
                    }
                }
            }
        }
        if(!find){
            if(ql.Add_QL_Envs(Host,token,[{
                    name:EnvName,
                    value:ck,
                    remarks:s.getPlatform()+":"+s.getUserId()
                }])){
                UpdateBind(e_uid)
                s.reply("添加成功")
                return
            }
        }
        s.reply("提交失败")
    }
}

function UpdateBind(uid){
    let data=db.get(uid)
    if(data)
        binds=JSON.parse(data)
    else
        binds=[]
    if(typeof(binds) == "number"){//历史遗留问题，绑定关系数据存储转换
        binds=[{imtype:s.getPlatform(),id:binds}]
    }
    if(!binds.some(bind=>bind.imtype==s.getPlatform() && bind.id==s.getUserId())){
        binds.push({imtype:s.getPlatform(),id:s.getUserId()})
        db.set(uid,JSON.stringify(binds))
    }    
}

function ElmBeans(ck){
    let resp=request({
        url:"https://h5.ele.me/restapi/svip_biz/v1/supervip/foodie/records?offset=0&limit=100",
		method:"get",
        headers:{
            Cookie:ck
        }
    })
	try{
        let info=JSON.parse(resp.body)
        let increment=0,decrement=0
		let day0=(new Date()).getDate()
		for(let i=0;i<info.records.length;i++){
			let day=info.records[i].createdTime.match(/(?<=-)\d{1,2}(?= )/)[0]
			if(day == day0){
                if(info.records[i].bizType=="USE" || info.records[i].bizType=="OVERDUE")
                    decrement+=info.records[i].count
                else
				    increment+=info.records[i].count
            }
			else
				break
		}
    	return {
                	amount:info.peaCount,
                	increment:increment,
                    decrement:decrement
        		}
	}
	catch(err){
		return null
	}
}
function ElmUserInfo(ck){
    let resp=request({
        url:"https://restapi.ele.me/eus/v4/user_mini",
		method:"get",
        headers:{
            Cookie:ck
        }
    })
    try{
        return JSON.parse(resp.body)
    }
    catch(err){
        return null
    }
}
main()