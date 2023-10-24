/**
 * @author https://t.me/sillyGirl_Plugin
 * @version v1.0.1
 * @create_at 2022-09-22 14:36:01
 * @description 执行shell命令，基于自建服务,set otto shell_token ? 设置token
 * @title shell
 * @rule sh ?
 * @rule 升级
 * @public false
 * @admin true
*/
const s = sender
const sillyGirl=new SillyGirl()

main()


function shell(command){
    let data=request({
        url:"http://127.0.0.1:3000/shell",
        method:"post",
        json:true,
		headers:{
			"accept": "application/json",
            "Authorization":new Bucket("otto").get("shell_token")
		},
        body:{
            command:command
        }
    }).body
    if(!data || !data.output){
        s.reply(data.message?data.message:"shell服务已下线")
        return false
    }
    //文本量过大时分片输出，防止平台字数限制输出失败    
    const unit=1000     //片长限制
    if(data.output.length<unit)
        s.reply(data.output)
    else{
        let pieces=data.output.split("\n")
        let temp=""
        pieces.forEach(piece=>{
            if(temp+piece>unit){
                s.reply(temp)
                temp=piece
            }
            else
                temp+=piece
        })
    }
    return true
}

function main(){
    let command=""
    if(s.getContent()=="升级"){
        let compiled_at = Number(new Bucket("sillyGirl").get("compiled_at"))
        //try{
            let url="https://api.github.com/repos/cdle/sillyGirl/releases"
            let data=null
            // let reqtryt=3
            // while(reqtryt-->0){
                 let resp=request(url)
            //     if(resp.status!=200)
            //         continue
                 data=JSON.parse(resp.body)
            // }
            if(!data){
                s.reply("github访问失败")
                return
            }
            let amd64=data[0].assets.find(asset=>asset.name=="sillyGirl_linux_amd64")
            if(!amd64){
                s.reply("未找到amd64版本")
                return
            }
            let version=amd64.updated_at
            let v=new Date(version).getTime()
            if(v>compiled_at){
                s.reply("最新版本:"+version+"\n当前版本:"+(new Date(compiled_at)).toISOString()+"\n是否确认升级？")
                inp=s.listen(30000)
                if(!inp || inp.getContent()!="是"){
                    s.reply("已取消升级")
                    return
                }
                let bk="sillyGirl"+(new Date(Number(compiled_at))).toISOString().split("T")[0]+".bk"
                //备份原版本并升级新版，仅适用amd64设备
                command=`cd /root/sillyGirl/ && mv sillyGirl ${bk} && wget ${amd64.browser_download_url} -O sillyGirl  && chmod 777 sillyGirl && ./sillyGirl -d`
                //command="cd /root/sillyGirl/ && mv sillyGirl sillyGirl_"+bk+" && curl -o sillyGirl https://gitlab.com/cdle/amd64/-/raw/main/sillyGirl_linux_amd64_"+v+" && chmod 777 sillyGirl && ./sillyGirl -d"
                s.reply("请稍候，执行升级命令中：\n"+command)
                if(shell(command))
                    s.reply("ok")
                else
                    s.reply("something wrong")
            }
            else{
                s.reply("已经最新版本！")
                return
            }
        // }
        // catch(err){
        //     s.reply("升级失败\n"+err)
        //     return
        // }
    }
    else{
        command=s.param(1)
        s.reply("进入shell交互模式，使用exit命令退出本模式")
        while(command!="exit"&&command!="q"&&command!="退出"){
            if(!shell(command))
                break
            let inp=s.listen(60*1000)
            if(!inp)
                break
            else
                command=inp.getContent()
        }
        s.reply("退出shell交互模式")
    }
}