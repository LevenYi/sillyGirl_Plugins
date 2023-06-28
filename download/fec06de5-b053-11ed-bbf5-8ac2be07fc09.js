/**
 * @author https://t.me/sillyGirl_Plugin
 * @version v1.0.1
 * @create_at 2022-09-19 15:06:22
 * @description 对接homeassistant小爱音箱，用于对其发出指令，不可用于小爱对话
 * @title 远控小爱音箱
 * @rule 小爱 ?
 * @priority 9
 * @public false
 * @disable false
 * @admin true
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
const db=new Bucket("home_assistant")
const addr=db.get("addr")
const token=db.get("token")
var headers={
    "Authorization":"Bearer "+token,
    "Content-Type":"application/json"
}

function main(){
    if(!addr || !token){
        s.reply("不看注释别玩了！")
        return
    }
    let running=APIservices()
    if(!running || running.message!="API running."){   
        s.reply("服务异常"+running.message?running.message:"")
        return
    }
    let states=getStates()
    if(!states){
        s.reply("设备状态获取失败")
        return
    }
    let entity=states.find(state=>state.entity_id.indexOf("execute_text_directive")!=-1)
    if(!entity){
        s.reply("未找到小爱音箱执行命令实体")
        return
    }
    let result=xiaoai(entity.entity_id,s.param(1),silent)
    console.log(result)
    if(result){
        s.reply("ok")
    }
    else
        s.reply("操作失败!")
}

function Req(url,method,body){
    let option={
        url,
        headers,
        method:"get"
    }
    if(method)
        option.method=method
    if(body)
        option.body=body
    let resp=request(option)
    if(resp.status==200){
        if(resp.body)
            return JSON.parse(resp.body)
        else
            return true
    }
    else{
        console.log(JSON.stringify(option)+"\n\n"+JSON.stringify(resp))
        return false
    }
}

function xiaoai(entity_id,text,silent){
    return Req(addr+"/api/services/xiaomi_miot/intelligent_speaker","post",{
            "entity_id": entity_id,
            "text":text,
            "execute":true,
            "silent":silent,
            "throw":false
        })
}

function APIservices(){
    return Req(addr+"/api/")
}

function getStates(){
    return Req(addr+"/api/states","get")
}

function getServices(){
    return Req(addr+"api/services","get")
}

main()