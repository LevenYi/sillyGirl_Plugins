/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.0
* @create_at 2022-09-08 15:06:22
* @description 定时自动命令、一键多命令
* @title 定时任务
* @platform qq wx tg pgm sxg
* @rule 执行任务
* @cron 0 19 * * *
 * @public false
* @admin true
* @disable true
*/
//触发命令可在上面rule项修改，定时规则可在上面cron项修改

//填入多任务命令
const Mission=["通知失效","删除失效"]
//多任务之间的执行时间间隔，单位：分钟
const Delay=3

//可在""中间填入自动执行定时任务时的推送渠道
const NotifyTo={
		platform:"",//推送平台,选填qq/tg/wx
        userId:"",//推送到的账号的id
	}


const s = sender
const sillyGirl=new SillyGirl()


function main(){
	let notify=""
    let tipid=s.reply("正在执行多任务...\n共"+Mission.length+"个任务待执行，任务执行间隔为"+Delay+"分钟")
	for(let i=0;i<Mission.length;i++){
		notify+="执行["+Mission[i]+"]:\n"+sillyGirl.session(Mission[i])().message+"\n\n"
		sleep(Delay*60*1000)
	}
	if(s.getPlatform()!="cron")
		s.reply("=========执行多任务=========\n"+notify)
	else{
        NotifyTo["content"]="=========启动定时多任务=========\n"+notify
		push(NotifyTo)
    }
}

main()