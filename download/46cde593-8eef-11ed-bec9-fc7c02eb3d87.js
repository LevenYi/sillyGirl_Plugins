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


function shell(command){
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
        let data=JSON.parse(body)
        if(!data || !data.output){
            s.reply("shell服务已下线")
            return
        }
        let message=data.output
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
                shell(command)
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
        while(command!="exit"){
            shell(command)
            let inp=s.listen(60*1000)
            if(!inp)
                break
            else
                command=inp.getContent()
        }
        s.reply("退出shell交互模式")
    }
}