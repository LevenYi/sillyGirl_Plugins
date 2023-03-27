/**
* @author https://t.me/sillyGirl_Plugin
 * @version v1.0.0
* @create_at 2022-09-19 15:06:22
* @description 对接homeassistant小爱音箱，用于对其发出指令，不可用于小爱对话
* @title 远控小爱音箱
* @rule 小爱 ?
* @priority 9
 * @public false
* @disable false
*/

/*********配置************/
// 设置home assistant面板地址
// set home_assistant addr http://127.0.0.1:8123

// 设置访问token，面板-用户资料-长期访问令牌-创建令牌
// set home_assistant token 你创建的令牌

//小爱音箱是否对指令保持静默
const silent=false
/***************************/



const s=sender

function main(){
    let db=new Bucket("home_assistant")
    let addr=db.get("addr")
    let token=db.get("token")
    if(!addr || !token){
        s.reply("不看注释别玩了！")
        return
    }
    let states=getStates(addr,token)
    if(!states){
        s.reply("设备状态获取失败")
        return
    }
    let entity=states.find(state=>state.entity_id.indexOf("execute_text_directive")!=-1)
    if(!entity){
        s.reply("未找到小爱音箱执行命令实体")
        return
    }
    if(xiaoai(addr,token,entity.entity_id,s.param(1),silent)){
        s.reply("ok")
    }
    else
        s.reply("操作失败!")
}

function xiaoai(addr,token,entity_id,text,silent){
    let option={
        url:addr+"/api/services/xiaomi_miot/intelligent_speaker" ,
        method:"post",
        headers:{
            "Authorization":"Bearer "+token,
            "Content-Type":"application/json"
        },
        body:{
            "entity_id": entity_id,
            "text":text,
            "execute":true,
            "silent":silent,
            "throw":true
        }
    }
    let resp=request(option)
    if(resp.status==200)
        return true
    else{
        console.log("xiaoai\n"+JSON.stringify(resp))
        return false
    }
}

function getStates(addr,token){
    let option={
        url:addr+"/api/states",
        headers:{
            "Authorization":"Bearer "+token,
            "Content-Type":"application/json"
        }
    }
    let resp=request(option)
    if(resp.status==200)
        return JSON.parse(resp.body)
    else{
        console.log("getStates\n"+JSON.stringify(resp))
        return null 
    }
}

function getServices(addr,token){
    let option={
        url:addr+"api/services",
        headers:{
            "Authorization":"Bearer "+token,
            "Content-Type":"application/json"
        }
    }
    let resp=request(option)
    if(resp.status==200)
        return JSON.parse(resp.body)
    else{
        console.log(JSON.stringify(resp))
        return null
    }
}

main()