/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.1.0
* @create_at 2022-09-08 15:06:22
* @description 频道监控
* @title 频道监控
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
        stopword:["无","停","干","没","不"],      //频道消息出现关键词自动停止任务stopscript任务
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
            suffix:"desi JD_COOKIE 3 1-200",  //对新增任务的执行命令添加后缀
            schedule:"2 2 29 2 *"   //对新增任务修改定时规则
        },
        otherscript:true,   //是否在频道消息中出现js py等脚本名时自动执行该脚本
        stopword:["无","停","干","没","不"],      //频道消息出现关键词自动停止任务stopscript任务
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
            suffix:"desi JD_COOKIE 3 200-2",  //对新增任务的执行命令添加后缀
            schedule:"2 2 29 2 *"   //对新增任务修改定时规则
        },
        otherscript:true,   //是否在频道消息中出现js py等脚本名时自动执行该脚本
        stopword:["无","停","干","没","不"],      //频道消息出现关键词自动停止任务stopscript任务
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
        notify+="※容器【"+QLS[i].name+"】\n"
        let crons=ql.Get_QL_Crons(QLS[i].host,QLS[i].token)
        let latest=crons.find(cron=>!cron.pid) //记录拉库前的第一个定时任务，用于判断新增任务
        let ids=[],names=[] //记录将执行的任务
        if(tostart || scriptname){
           // console.log("拉库前第一个任务是"+latest.name)
            let sub=ql.Get_QL_Subs(QLS[i].host,QLS[i].token,config.repo)
            if(sub){    //新版青龙
                if(!sub.length){
                    notify+=QLS[i].name+"未找到订阅"+config.repo+"\n"
                    continue
                }
                let id=sub[0].id?sub[0].id:sub[0]._id
                if(!sub[0].status){
                    console.log(QLS[i].name+":"+config.repo+"订阅已处执行中")
                    continue
                }
                if(!ql.Start_QL_Subs(QLS[i].host,QLS[i].token,[id])){
                    notify+=QLS[i].name+"订阅"+config.repo+"执行失败\n"
                    continue
                }
                else
                    notify+="执行订阅【"+config.repo+"】\n"
                let limit=50
                while(limit-->0){
                    sleep(WAIT)
                    sub=ql.Get_QL_Subs(QLS[i].host,QLS[i].token,config.repo)
                    //console.log("拉库状态\n"+JSON.stringify(sub[0]))
                    if(sub[0].status){
                        console.log("订阅执行结束")
                        crons=ql.Get_QL_Crons(QLS[i].host,QLS[i].token)
                        break
                    }
                    else{
                        console.log("等待订阅执行完成")
                    }
                }
            }
            else{
                console.log("可能旧版青龙")
                let repo=crons.find(cron=>cron.command.indexOf(config.repo)!=-1 &&cron.command.indexOf("repo")!=-1)
                if(!repo){
                    notify+=QLS[i].name+"未找到拉库任务"+config.repo+"\n"
                    continue
                }
                else if(!repo.status){
                    console.log(QLS[i].name+":"+config.repo+"拉库已处进行中")
                    continue
                }
                let id=repo.id?repo.id:repo._id
                if(!ql.Start_QL_Crons(QLS[i].host,QLS[i].token,[id])){
                    notify+=QLS[i].name+"拉库"+config.repo+"执行失败\n"
                    continue
                }
                else
                    notify+="执行拉库【"+config.repo+"】\n"
                let limit=50
                while(limit-->0){
                    sleep(WAIT)
                    crons=ql.Get_QL_Crons(QLS[i].host,QLS[i].token)
                    repo=crons.find(cron=>cron.command.indexOf(config.repo)!=-1 &&cron.command.indexOf("repo")!=-1)
                    //console.log("拉库状态\n"+JSON.stringify(repo))
                    if(repo.status){
                        console.log("拉库完成")
                        break
                    }
                    else{
                        console.log("等待拉库结束")
                    }
                }
            }
            if(tostart){
                for(let j=0;j<crons.length;j++){
                    if(crons[j].name==latest.name)
                        break
                    if(crons[j].pid)
                        continue
                    notify+="★新增任务：【"+crons[j].name+"】\n"
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
                    if(crons[j].command.indexOf(config.startscript)!=-1 && ids.indexOf(id)==-1 && !crons[j].pid){
                        ids.push(id)
                        names.push(crons[j].name)
                    }
                }
            }
            if(scriptname){
                notify+="消息中含脚本名【"+scriptname.toString()+"】，可能为线报\n"
                scriptname.forEach(script=>{
                    let cron=crons.find(cron=>cron.command.indexOf(script)!=-1)
                    if(cron){
                        let id=cron.id?cron.id:cron._id
                        if(ids.indexOf(id)==-1 && !crons[j].pid){
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
        else if(tostop){
            let temp=[]
            for(let j=0;j<crons.length;j++){
                if(crons[j].pid && crons[j].command.indexOf(config.stopscript)!=-1)
                    temp.push(crons[j])
                // if(!crons[j].pid)
                //     break
            }
            if(!temp.length)
                notify+="没有需要停止的任务\n"
            else{
                ids=temp.map(cron=>cron.id?cron.id:cron._id)
                if(ql.Stop_QL_Crons(QLS[i].host,QLS[i].token,ids))
                    notify+="成功停止【"+temp.map(cron=>cron.name)+"】\n"
                else console.log("停止"+temp.map(cron=>cron.name)+"失败")
            }
        }
    }
    //console.log(notify)
    sillyGirl.notifyMasters(notify)
    return
}


main()