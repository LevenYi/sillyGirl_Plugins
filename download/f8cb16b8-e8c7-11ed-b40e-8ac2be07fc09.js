/**
 * @author https://t.me/sillyGirl_Plugin
 * @version v1.0.1
 * @create_at 2023-09-22 14:36:01
 * @description pandora,https://github.com/pengzhile/pandora/blob/master/doc/wiki.md
 * @title pandora
 * @rule ai ? ?
 * @rule ai ?
 * @rule ai list
 * @public false
 * @admin false
*/


/*
pandora token更新：https://gist.github.com/pengzhile/448bfcfd548b3ae4e665a84cc86c4694，
定时运行脚本，token自动保存至share_tokens.txt
//pandora安装完成后以http服务方式启动，例：nohup pandora -s 192.168.31.5:3100 -t share_tokens.txt >/dev/null &
//设置pandora地址 set otto pandora ?，例：set otto pandora http://192.168.31.5:3100

命令介绍：、
例：ai list，列出所有对话
例：ai 你是谁， 进入ai对话模式，默认进入DefaultCon对话，回复q或exit或退出后退出对话模式，下同
例：ai 2 你好，进入第2个对话

*/



//默认对话标题
const DefaultCon="QA"

const s=sender
const host=new Bucket("otto").get("pandora")

function Req(api,method,body){
    let option={
        url:host+api,
        json:true
    }
    if(body)
        option.body=body
    if(method)
        option.method=method
    let resp= request(option)
    return resp.body
}

//自建服务
function uuid(){
    return request("http://127.0.0.1:3000/uuid").body
}

function main(){
    let conversations=Req("/api/conversations")
    let cvs=null
    let prompt=""  //用户提问
    if(s.getContent()=="ai list"){
        let msg=""
        if(conversations.items.length){
            conversations.items.forEach((cvs,i)=>msg+=(i+1)+"、"+cvs.title+"\n")
        }
        else
            msg="您未创建任何对话"
        s.reply(msg)
        return
    }
    if(s.param(2)){ //指定对话
        let No=Number(s.param(1))
        if(isNaN(No)){
            s.reply("指定对话时，请使用命令“ai 对话序号 命令”")
            return
        }
        else if(No>conversations.total){
            s.reply("您目前仅有"+conversations.total+"个对话")
            return
        }
        else    
            cvs=conversations.items[No-1]
        prompt=s.param(2)
    }
    else{   //未指定对话，使用默认对话
        prompt=s.param(1)
        if(DefaultCon){
            cvs=conversations.items.find(cvs=>cvs.title==DefaultCon)
            if(!cvs){
                if(conversations.total)
                    cvs=conversations.items[0]
            }
        }
    }
    // if(cvs)
    //     console.log(JSON.stringify(cvs))

    const model="text-davinci-002-render-sha" //对话使用的模型，通常整个会话中保持不变。
    let message_id=""   //消息ID，通常使用str(uuid.uuid4())来生成一个。
    let parent_message_id=""    // 父消息ID，首次同样需要生成。之后获取上一条回复的消息ID即可。
    let conversation_id=""  // 首次对话可不传。ChatGPT回复时可获取。
    let stream=false  //是否使用流的方式输出内容，默认为：True
    while(prompt!="exit" && prompt!="q" && prompt!="退出"){
        let conversation_id=cvs? cvs.id: undefined
        if(conversation_id){
            parent_message_id=Req("/api/conversation/"+conversation_id).current_node
        }
        else
            parent_message_id=uuid()
        message_id=uuid()
        s.reply("正在生成，请稍候...")
        let body={model,stream,conversation_id,parent_message_id,message_id,prompt}
        let data=Req("/api/conversation/talk","post",body)
        data.message.content.parts.forEach(text=>s.reply(text))
        console.log(JSON.stringify(body)+"\n\n"+JSON.stringify(data))
        
        let inp=s.listen(60*1000)
        if(!inp)
            break
        else
            prompt=inp.getContent()
    }
    s.reply("退出AI对话")
}

main()