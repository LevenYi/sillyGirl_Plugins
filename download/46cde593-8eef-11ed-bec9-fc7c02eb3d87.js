/**
 * @author https://t.me/sillyGirl_Plugin
 * @version v1.0.1
 * @create_at 2022-09-22 14:36:01
 * @description 执行shell命令，基于自建服务
 * @title shell
 * @rule sh ?
 * @rule 升级
 * @public false
 * @admin true
*/
const s = sender
const sillyGirl=new SillyGirl()

main()

function main(){
    let command=""
    if(s.getContent()=="升级"){
        let compiled_at = Number(new Bucket("sillyGirl").get("compiled_at"))
        try{
            let v=Number(request("https://gitlab.com/cdle/amd64/-/raw/main/compile_time.go").body.match(/(?<=compiled_at = ")\d+/))
            if(v>compiled_at){
                s.reply("最新版本:"+(new Date(v)).toISOString()+"\n当前版本:"+(new Date(compiled_at)).toISOString()+"\n是否确认升级？")
                inp=s.listen(30000)
                if(!inp || inp.getContent()!="是"){
                    s.reply("已取消升级")
                    return
                }
                let bk="sillyGirl"+(new Date(Number(compiled_at))).toISOString()
                //备份原版本并升级新版，仅适用amd64设备
                command="cd /root/sillyGirl/ && mv sillyGirl sillyGirl_"+bk+"&& curl -o sillyGirl https://gitlab.com/cdle/amd64/-/raw/main/sillyGirl_linux_amd64_"+v+" && chmod 777 sillyGirl && ./sillyGirl -d"
            }
            else{
                s.reply("已经最新版本！")
                return
            }
        }
        catch(err){
            s.reply("升级失败\n"+err)
            return
        }
    }
    else
        command=s.param(1)
    request({
        url:"http://127.0.0.1:3000/shell",
        method:"post",
        //json:true,
		headers:{
			"accept": "application/json"
		},
        body:{
            command:command
        }
    },function(error,info,body){     
        const unit=1000
        let message=JSON.parse(body).message
        if(message.length<unit){
            s.reply(message)
        }
        else{
            console.log("stdout too long")
            console.log(message.length+":\n"+message)
            let start=0,limit=10
            // console.log(start+":"+message.substr(start,unit))
            while(limit-->0){
                console.log(start+":"+message.substr(start,unit))
                s.reply(message.substr(start,unit))
                start+=unit
                if(start>message.length)
                    break
                sleep(500)
            }
        }
    })
}