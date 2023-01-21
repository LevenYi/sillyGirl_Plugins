/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.0
* @create_at 2022-09-08 15:06:22
* @description 频道监控
* @title 频道监控
* @platform qq wx tg pgm sxg
* @rule ?
 * @public false
*/

const Config=[
    {
        name:"测试",    //备注名
        id:"-1001642487812",  //监控频道的id
        keyword:"开卡监控",     //触发关键词，可空
        container:[1],  //监控容器
        repo:"KingRan",     //触发后需要执行的拉库任务
        startscript:"opencard", //拉库结束后需要自动执行的新增任务
        modify:{
            suffix:"desi JD_COOKIE 1-200",  //对新增任务的执行命令添加后缀
            schedule:"2 2 29 2 *"   //对新增任务修改定时规则
        },
        otherscript:true,   //是否在频道消息中出现js py等脚本名时自动执行该脚本
        stopword:["无","停","干","没水"],      //频道消息出现关键词自动停止任务stopscript任务
        stopscript:"opencard"   //需要监控停止执行的任务关键词
    },
    {
        name:"KR",    //备注名
        id:"-1001659538110",  //监控频道的id
        keyword:"",     //触发关键词，可空
        container:[1],  //监控容器
        repo:"KingRan",     //触发后需要执行的拉库任务
        startscript:"opencard", //拉库结束后需要自动执行的新增任务
        modify:{
            suffix:"desi JD_COOKIE 1-200",  //对新增任务的执行命令添加后缀
            schedule:"2 2 29 2 *"   //对新增任务修改定时规则
        },
        otherscript:true,   //是否在频道消息中出现js py等脚本名时自动执行该脚本
        stopword:["无","停","干","没水"],      //频道消息出现关键词自动停止任务stopscript任务
        stopscript:"opencard"   //需要监控停止执行的任务关键词
    },
        {
        name:"环境保护",    //备注名
        id:"-1001765547510",  //监控频道的id
        keyword:"",     //触发关键词，可空
        container:[1],  //监控容器
        repo:"feverrun",     //触发后需要执行的拉库任务
        startscript:"opencard", //拉库结束后需要自动执行的新增任务
        modify:{
            suffix:"desi JD_COOKIE 1 200-2",  //对新增任务的执行命令添加后缀
            schedule:"2 2 29 2 *"   //对新增任务修改定时规则
        },
        otherscript:true,   //是否在频道消息中出现js py等脚本名时自动执行该脚本
        stopword:["无","停","干","没水"],      //频道消息出现关键词自动停止任务stopscript任务
        stopscript:"opencard"   //需要监控停止执行的任务关键词
    }
]

const ql=require("qinglong")
const st=require("something")
const s = sender
const sillyGirl=new SillyGirl()
function main(){
    const WAIT=10000
    s.continue()
    let notify=""
    let config=Config.find(config=>config.id==s.getChatId())
    if(!config||s.getContent().indexOf("export")!=-1){
        return
    }
    let scriptname=null
    if(config.otherscript)
        scriptname=s.getContent().match(/\w+\.(js|py)/g)
    let tostop=config.stopword.some(word=>s.getContent().indexOf(word)!=-1)
    let tostart=s.getContent().match(config.keyword)!=null
    //console.log("tostart:"+tostart+"\ntostop"+tostop+"\nscript:"+scriptname)
    if(!tostart && !scriptname &&!tostop){ 
        return
    }
    let QLS=ql.QLS()
    if(!QLS){
        console.log("未对接青龙")
        return
    }
    notify+=config.name+"触发监控\n-------------------\n"
    notify+=s.getContent()+"\n---------------------\n"
    for(let i=0;i<QLS.length;i++){
        if(config.container.indexOf(i+1)==-1)
            continue
        notify+="容器【"+QLS[i].name+"】\n"
        let crons=ql.Get_QL_Crons(QLS[i].host,QLS[i].token)
        let latest=crons[0] //记录拉库前的第一个定时任务，用于判断新增任务
        let ids=[],names=[] //记录将执行的任务
        if(tostart || scriptname){
            //console.log("拉库前第一个任务是"+latest.name)
            notify+="执行拉库\n"
            let sub=ql.Get_QL_Subs(QLS[i].host,QLS[i].token,config.repo)
            if(sub){
                if(sub.length){
                    if(ql.Start_QL_Subs(QLS[i].host,QLS[i].token,[sub[0].id])){
                        console.log("成功执行订阅"+config.repo)
                        sleep(60000)
                    }
                    else
                        console.log("订阅执行失败"+config.repo)
                }
                else    
                    console.log("无订阅任务"+config.repo)
            }
            else{
                console.log("可能旧版青龙")
                let repo=crons.find(cron=>cron.command.indexOf(config.repo)!=-1 &&cron.command.indexOf("repo")!=-1)
                if(!repo){
                    notify+=QLS[i].name+"无拉库任务"+config.repo+"\n"
                    continue
                }
                else if(repo.pid){
                    console.log("已经正在拉库")
                    return
                }
                let id=repo.id?repo.id:repo._id
                if(ql.Start_QL_Crons(QLS[i].host,QLS[i].token,[id])){
                    while(true){
                        sleep(WAIT)
                        crons=ql.Get_QL_Crons(QLS[i].host,QLS[i].token)
                        repo=crons.find(cron=>cron.command.indexOf(config.repo)!=-1 &&cron.command.indexOf("repo")!=-1)
                        //console.log("拉库状态\n"+JSON.stringify(repo))
                        if(!repo.pid){
                            console.log("拉库完成")
                            break
                        }
                        else{
                            console.log("等待拉库结束")
                        }
                    }
                }
                else{
                    console.log("拉库执行失败")
                    continue
                }
            }
            if(tostart){
                for(let j=0;j<crons.length;j++){
                    if(crons[j].name==latest.name)
                        break
                    notify+="新增任务：【"+crons[j].name+"】\n"
                    let command=crons[j].command
                    let schedule=crons[j].schedule
                    let id=crons[j].id?crons[j].id:crons[j]._id
                    if(config.modify&&config.modify.suffix)
                        command+=" "+config.modify.suffix
                    if(config.modify&&config.modify.schedule)
                        schedule=config.modify.schedule
                    if(ql.Update_QL_Cron(QLS[i].host,QLS[i].token,id,crons[j].name,command,schedule)){
                    if(true)
                        notify+="执行命令修改为："+command+"\n"
                        notify+="定时规则修改为:"+schedule+"\n"
                    }
                    else
                        notify+="任务修改失败\n"
                    if(crons[j].command.indexOf(config.startscript)!=-1){
                        ids.push(id)
                        names.push(crons[j].name)
                    }
                }
            }
            else if(scriptname){
                notify+="消息中含脚本名【"+scriptname.toString()+"】，可能为线报\n"
                scriptname.forEach(script=>{
                    let cron=crons.find(cron=>cron.command.indexOf(script)!=-1)
                    if(cron){
                        let id=cron.id?cron.id:cron._id
                        if(ids.indexOf(id)==-1){
                            ids.push(id)
                            names.push(cron.name)
                        }
                    }
                    else
                        notify+="未找到脚本"+script+"\n"
                })
            }
            if(ids.length){
                if(ql.Start_QL_Crons(QLS[i].host,QLS[i].token,ids))
                //if(true)
                    notify+="成功执行【"+names.toString()+"】\n"
                else
                    notify+="执行【"+names.toString()+"】失败\n"
            }
            else 
                notify+="没有需要执行的任务\n"
        }
        if(tostop){
            let cron=crons.find(cron=>cron.pid&&cron.command.indexOf(config.repo)!=-1 && cron.command.indexOf(config.stopscript)!=-1)
            if(!cron)
                notify+="没有需要停止的任务\n"
            else if(ql.Stop_QL_Crons(QLS[i].host,QLS[i].token,[cron.id?cron.id:cron._id]))
                notify+="成功停止【"+cron.name+"】\n"
            else console.log("停止"+cron.name+"失败")
        }
    }
    //console.log(notify)
    sillyGirl.notifyMasters(notify)
    return
}


main()