/*
* @author https://t.me/sillyGirl_Plugin
* @create_at 2022-09-07 18:35:08
* @description 口令解析、链接解析、变量转换、变量监控多合一
* @title 白眼
* @platform qq wx tg pgm sxg
* @rule [\s\S]*[(|)|#|@|$|%|¥|￥|!|！]([0-9a-zA-Z]{10,14})[(|)|#|@|$|%|¥|￥|!|！][\s\S]*
* @rule [\s\S]*https://\S+\.isvjcloud\.com/\S+[\s\S]*
* @rule [\s\S]*https://\S+\.isvjd\.com/\S+[\s\S]*
* @rule [\s\S]*https://[\s\S]{2,}\.jd.com[\s\S]*
* @rule [\s\S]*export \w+[ ]*=[ ]*"[^"]+"[\s\S]*
* @rule 迁移ql spy
* @rule 恢复ql spy
* @rule 监控管理
* @rule 导出白眼
* @rule ImportWhiteEye=\S+
* @rule 监控状态
* @rule 清空监控队列
* @rule 清空监控记录
* @rule 清空白眼数据
 * @public false
* @version v1.2.5
*/


/*****************************详细说明***********************
监控目标:
除设置的对象外，默认监控管理员消息
注：若要正常监控，除设置监控目标外，还需傻妞监听该目标 

静默：开启后傻妞将会静默处理监控消息，不会在当前会话发出通知，但静默模式对管理员消息无效

不完全静默：即开启静默模式，但又使用过命令"set SpyNotify qq/tg/wx 用户id"或者"set SpyGroupNotify qq/tg/wx 群id"设置过通知渠道，傻妞将会在当前会话静默，但是会将监控处理情况推送到设置的渠道，将命令中的set改为delete即为取消设置

迁移ql spy:
将会将ql spy任务备份至jd_cookie env_listens_backup(使用命令get jd_cookie env_listens_backup可以获取，不过数据过多部分平台可能获取失败，可以前往命令行傻妞交互模式或者数据管理web端查看)
同时将删除ql spy数据(因为会跟白眼冲突，导致白眼无法作用)

恢复ql spy:
即将jd_cookie env_listens_backup数据恢复至jd_cookie env_listens

导入出白眼：选择一次性导出项数过多时可能会导出失败，建议选择10项左右

导入白眼数据：
将导出的信息发送给机器人即可，会默认仅添加自己没有监控的变量的任务，如果信息中容器非本人容器，将会默认使添加的监控任务使用傻妞所绑定的所有非禁用容器作为作用容器

监控状态：
查看监控任务的未完成任务数量、已完成任务数量、以及上次任务时间

其他：出现奇奇怪怪的不运行的清空可以使用‘清空监控队列’或者‘清空监控记录’命令进行重置


如果(不)需要具体的执行情况，可自行前往Que_Manager()找到相应代码添加/取消注释

插件中可能需要区分的名称：监控任务名称，自定义变量转换名称，自定义链接解析名称，青龙任务名称、以及内置的链接解析的名称
插件最后为内置解析规则，同自定义解析规则，可自行添加
*/
//0不通知口令与链接解析以及加入队列
const NotifyMode=0
//2022-8-27 v1.0.0 
//2022-8-27 v1.0.1 修复人形傻妞与tg机器人位于同一个对话时不停互相丢链接的问题，可能修复监控偶尔报错的问题
//2022-8-29 v1.0.2 修复最新版傻妞重复迁移ql spy导致备份数据丢失的问题,修复多容器报错问题
//2022-8-30 v1.1.0 修改任务处理为锁机制，导入配置时默认使用所有非禁用容器,添加一键清除白眼所有数据命令(卸载白眼可用)
//2022-8-30 v1.1.1 紧急修复，人形与机器人位于同一会话，且监控消息含链接且变量为链接时的死循环问题
//2022-8-31 v1.1.2 解决处理队列过程中遭遇不正常退出导致的队列不不处理问题（不完美，也可手动使用"清空监控队列"命令进行重置)，以及监控任务配置时未使用唯一性关键词导致启动青龙多个含相同关键词任务的问题
//2022-8-31 v1.1.3 修复未找到青龙任务时，陷入死循环的问题，以及其他恢复ql spy失败问题
//2022-8-31 v1.1.4 修复监控任务含多变量出现的奇奇怪怪问题
//2022-9-1 v1.1.5 监控的不运行问题应该有所缓解，增加了对配置有问题的容错性，修复了不存在监控任务时第一次导入配置时無默认容器的问题
//2022-9-1 v1.1.6 修复多变量任务只修改一个变量的问题，修复青龙配置文件变量值为空值时导致的另外新建变量，修改队列处理最大间隔为1分钟及其修正方式
//2022-9-1 v1.2.0 修复多容器报错，并添加监控任务无容器提醒
//2022-9-5 v1.2.1 适配最新傻妞,修复自定义链接解析无法去重的问题
//2022-9-8 v1.2.2 修复已知bug
//2022-9-9 v1.2.3 修复链接解析问题，支持解析链接型变量
//2022-9-12 v1.2.5 模块化




/*****************数据存储******************/

/*jd_cookie env_listens_new：监控任务
[{
	ID:id,
	Name:监控任务名,
	Keyword:脚本关键词或者任务名关键词,
	Envs:[监控变量名],
	Disable:是否禁用,
	Clients:[监控容器client_id],
	Interval:任务间隔(分),
	LastTime:上次执行时间,
	TODO:[[{//未执行队列
		name:监控变量名,
		value:监控变量值
	}]],
	DONE:[[{//已执行队列
		name:监控变量名,
		value:监控变量值		
	}]]
}]

jd_cookie spy_locked:任务锁，防止多进程同时处理队列

jd_cookie spy_silent_new：bool,是否静默监控

jd_cookie spy_targets_new：监控目标
[{name:监控目标备注名,id:监控目标id}]

jd_cookie spy_envtrans_new：变量转换
[{ori:原变量,redi:转换后变量,name:备注名称}]

jd_cookie spy_urldecode_new：链接解析
[{
	keyword:url关键词,
	trans:[{
		ori:url中需要提取的参数名(-1表示直接使用整段url),
		redi:提取的参数使用的变量名
		}]
	name:备注名称
}]

*/

const ql=require("qinglong")
const st=require("something")

const s = sender
const sillyGirl = new SillyGirl()
const db = new Bucket("jd_cookie")


function main() {
	//	let isspy=false
	var msg = s.getContent()
	//			s.reply('start')
	if (IsTarget() || s.isAdmin()) {//仅对监控目标和管理员消息监控
		//		try{	
		//变量监控
		if (msg.match(/export ([^"]+)="([^"]+)"/) != null) {//s.reply('spy')
			let names = msg.match(/(?<=export[ ]+)\w+(?=[ ]*=[ ]*"[^"]+")/g)
			let values = msg.match(/(?<=export[ ]+\w+[ ]*=[ ]*")[^"]+(?=")/g)
			let envs = []
			for (let i = 0; i < values.length; i++){
				/*if(values[i].indexOf("https")!=-1){
					Urls_Decode([values[i]])
				}
				else*/
					envs.push({ name: names[i], value: values[i] })
			}
			Env_Listen(envs)
			//			isspy=true	
		}
		//链接监控
		else if (msg.indexOf("http") != -1) {
			let urls = msg.match(/https:\/\/[0-9a-zA-Z-&?=\/\.\+]+/g)
			//			s.reply(urls.toString())
			Urls_Decode(urls)
			//			isspy=true	
		}
		//口令监控
		else if (msg.match(/[(|)|#|@|$|%|¥|￥|!|！][0-9a-zA-Z]{10,14}[(|)|#|@|$|%|¥|￥|!|！]/g) != null) {
			JDCODE_Decode(msg)
			//			isspy=true	
		}
		/*		}
				catch(err){
					Notify("发生错误，请联系开发者\n"+err)
					return
				}*/
	}

	if (!s.isAdmin()) {//其他命令为管理员命令
		s.continue()
		return
	}


	if (msg == "迁移ql spy") {
		ql.Migrate_qlspy()
	}
	else if (msg == "恢复ql spy") {
		ql.Recovery_qlspy()
	}

	else if (msg == "导出白眼")
		Export_Spy()

	else if (msg.match(/^ImportWhiteEye=\S+/) != null)
		s.reply(Import_Spy(msg.match(/(?<=ImportWhiteEye=)\S+/g)))

	else if (msg == "监控管理")
		Spy_Manager()

	else if (msg == "清空监控队列") {
		Spy_Clear()
	}

	else if (msg == "清空监控记录")
		Spy_RecordReset()

	else if (msg == "监控状态")
		Spy_Status()

	else if (msg == "清空白眼数据") {
		SaveData("", "", "", "", "")
		db.set("env_listens_backup", "")
		s.reply("已删除白眼监控任务、静默设置、监控目标、变量转换、自定义链接解析、和ql spy备份数据")
	}

	return
}

function Spy_Manager() {
	const LIMIT = 24//循环次数限制，防止意外死循环
	const WAIT = 60 * 1000//输入等待时间
	let notify = ""
	let qldb = new Bucket("qinglong")
	let data = qldb.get("QLS")
	if (data == "") {
		s.reply("未对接青龙，请先前往‘青龙管理’添加青龙容器，已退出")
		return
	}
	let QLS = JSON.parse(data)
	let data1 = db.get("env_listens_new")
	let silent = db.get("spy_silent_new")
	let data2 = db.get("spy_targets_new")
	let data3 = db.get("spy_envtrans_new")
	let data4 = db.get("spy_urldecode_new")
	if (data1 == "")
		Listens = []
	else
		Listens = JSON.parse(data1)
	if (data2 == "")
		targets = []
	else
		targets = JSON.parse(data2)
	if (data3 == "")
		trans = []
	else
		trans = JSON.parse(data3)
	if (data4 == "")
		urldecodes = []
	else
		urldecodes = JSON.parse(data4)

	let limit = LIMIT
	let inp = 1//随便什么值，非null即可
	while (true) {
		if (limit-- < 0) {
			s.reply("由于您长时间未操作，已自动退出，数据未保存")
			return
		}
		if (inp != null)
			Print_SpyMenu(Listens, silent, targets)
		let temp=s.listen(WAIT)
		if(temp!=null)
			inp = temp.getContent()
		else
			inp=null
		if (inp == "q") {
			s.reply("请确认是否保存？输入\"是\"保存")
			let temp2=s.listen(WAIT)
			if (temp!=null&&temp2.getContent() == "是")
				s.reply(SaveData(Listens, silent, targets, trans, urldecodes))
			else
				s.reply("未保存本次修改内容")
			break
		}

		else if (inp == "wq") {
			s.reply(SaveData(Listens, silent, targets, trans, urldecodes))
			break
		}

		else if (inp == "a") {
			if (silent == "true")
				silent = "false"
			else
				silent = "true"
		}

		else if (inp == "b") {
			let limit2 = LIMIT
			let inp2 = 1
			while (true) {
				if (limit2-- < 0) {
					s.reply("由于您长时间未操作，已自动退出，数据未保存")
					return
				}
				if (inp2 != null)
					Print_SpyTran(trans)

				let temp2=s.listen(WAIT)
				if(temp2!=null)
					inp2 = temp2.getContent()
				else
					inp2=null

				if (inp2 == "u")
					break
				else if (inp2 < 0) {
					try {
						trans.splice(Math.abs(inp2) - 1, 1)
					}
					catch (err) {
						s.reply("输入有误，请重新选择")
					}
				}
				else if (inp2 == "0") {
					let tran = {
						ori: "",
						redi: "",
						name: ""
					}
					try{
						s.reply("请输入您想转换的变量名：")
						tran.ori = s.listen(WAIT).getContent()
						s.reply("请输入您想变为的变量名：")
						tran.redi = s.listen(WAIT).getContent()
						s.reply("请输入该转换任务的备注名称：")
						tran.name = s.listen(WAIT).getContent()
						trans.push(tran)
						s.reply("已添加变量转换任务\n【" + tran.name + "】:" + tran.ori + "-->" + tran.redi + "\n您可以继续添加转换变量或者返回上一级菜单")
					}
					catch(err){
						s.reply("输入超时，请重新添加转换任务")
					}
				}
			}
		}

		else if (inp == "c") {
			let limit2 = LIMIT
			let inp2 = 1
			while (true) {
				if (limit2-- < 0) {
					s.reply("由于您长时间未操作，已自动退出，数据未保存")
					return
				}
				if (inp2 != null)
					Print_SpyUrl(urldecodes)

				let temp2=s.listen(WAIT)
				if(temp2!=null)
					inp2 = temp2.getContent()
				else
					inp2=null
				//console.log("输入"+inp2)
				if (inp2 == "u")
					break
				else if (inp2 < 0) {
					try {
						urldecodes.splice(Math.abs(inp2) - 1, 1)
					}
					catch (err) {
						s.reply("输入有误，请重新选择")
					}
				}
				else if (inp2 == "0") {
					let decode = {
						keyword: "",
						name: "",
						trans: [{
							ori: "",
							redi: ""
						}]
					}
					try{
						s.reply("请输入您想解析链接的关键词(例如：http://xxx.com/yyyy/zzzz/)")
						decode.keyword = s.listen(WAIT).getContent()
						s.reply("请输入您想提取的参数（例如:http://...../?actid=xxx中的actid,若使用整段链接作为变量请输入-1)")
						decode.trans[0].ori = s.listen(WAIT).getContent()
						s.reply("请输入您想使用该参数的变量名：")
						decode.trans[0].redi = s.listen(WAIT).getContent()
						s.reply("请输入该解析任务的备注名称：")
						decode.name = s.listen(WAIT).getContent()
						urldecodes.push(decode)
						s.reply("已添加" + decode.name + "(" + decode.keyword + "):" + decode.trans[0].ori + "-->" + decode.trans[0].redi + "\n您可以继续添加转换变量或者返回上一级菜单")					
					}
					catch(err){
						s.reply("输入超时，请重新添加解析任务")
					}
				}
			}
		}

		else if (inp == "d") {
			let limit2 = LIMIT
			let inp2 = 1
			while (true) {
				if (limit2-- < 0) {
					s.reply("由于您长时间未操作，已自动退出，数据未保存")
					return
				}
				if (inp2 != null)
					Print_SpyTargets(targets)

				let temp2=s.listen(WAIT)
				if(temp2!=null)
					inp2 = temp2.getContent()
				else
					inp2=null

				if (inp2 == "u")
					break
				else if (inp2 < 0) {
					try {
						targets.splice(Math.abs(inp2) - 1, 1)
					}
					catch (err) {
						s.reply("输入有误，请重新选择")
					}
				}
				else if (inp2 == "0") {
					try{
						s.reply("请输入新添加的监听目标的账号ID或者群ID：")
						let id = s.listen(WAIT).getContent()
						s.reply("请输入新添加的监听目标的备注名称：")
						let name = s.listen(WAIT).getContent()
						targets.push({ id: id, name: name })
					}
					catch(err){
						s.reply("输入超时，请重新添加")
					}
				}
			}
		}

		else if (inp == "0") {
			let spy = {
				ID: Listens.length,
				Name: "",
				Keyword: "",
				Envs: [],
				Disable: false,
				Clients: [],
				Interval: 1,//默认最小间隔1分钟
				LastTime: 0,
				TODO: [],
				DONE: []
			}
			try{
			for (
				let i = 0; i < QLS.length; i++)//默认监控非禁用容器
					if(!QLS.disable)
						spy.Clients.push(QLS[i].client_id)
				s.reply("请输入监视任务名称：")
				spy.Name = s.listen(WAIT).getContent()
				s.reply("请输入脚本关键词：")
				spy.Keyword = s.listen(WAIT).getContent()
				s.reply("请输入洞察变量：")
				spy.Envs.push(s.listen(WAIT).getContent())
				s.reply("请输入运行间隔时间(分钟):")
				spy.Interval = s.listen(WAIT).getContent()
				s.reply("已添加监视任务，默认作用所有容器，如需修改请在下面主菜单选择编辑")
				Listens.push(spy)
			}
			catch(err){
				s.reply("输入超时，请重新添加")
			}
		}

		else if (inp < 0) {
			try {
				Listens.splice(Math.abs(inp) - 1, 1)
			}
			catch (err) {
				s.reply("输入有误，请重新选择")
				continue
			}
		}

		else if (inp > 0 && inp <= Listens.length) {
			let inp2 = 1
			let limit2 = LIMIT
			while (true) {
				if (limit2-- < 0) {
					s.reply("由于您长时间未操作，已自动退出，数据未保存")
					return
				}
				if (inp2 != null)
					Print_SpyItem(Listens[inp - 1], QLS)

				let temp2=s.listen(WAIT)
				if(temp2!=null)
					inp2 = temp2.getContent()
				else
					inp2=null

				if (inp2 == "u")
					break
				else if (inp2 == "q") {
					try{
						s.reply("请确认是否保存？输入\"是\"保存")
						if (s.listen(WAIT).getContent() == "是")
							s.reply(SaveData(Listens, silent, targets, trans, urldecodes))
						else
							s.reply("未保存本次修改内容")
					}
					catch(err){
						s.reply("输入超时，未保存本次修改内容")
					}
					return
				}
				else if (inp2 == "wq") {
					s.reply(SaveData(Listens, silent, targets, trans, urldecodes))
					return
				}

				else if (inp2 == 1) {
					s.reply("请输入监视任务名称：")
					let temp3= s.listen(WAIT)
					if(temp3!=null)
						Listens[inp - 1].Name = temp3.getContent()
					else{
						s.reply("输入超时")
						continue
					}
				}
				else if (inp2 == 2) {
					s.reply("请输入脚本关键词：")
					let temp3= s.listen(WAIT)
					if(temp3!=null)
						Listens[inp - 1].Keyword = temp3.getContent()
					else{
						s.reply("输入超时")
						continue
					}
				}
				else if (inp2 == 3) {//修改洞察变量
					let inp3 = 1
					let limit3 = LIMIT
					while (true) {
						if (limit3-- < 0) {
							s.reply("您已经长时间未操作，已自动退出，数据未保存")
							return
						}
						if (inp3 != null)
							Print_Spy_Envs(Listens[inp - 1].Envs)
						let temp3=s.listen(WAIT)
						if(temp3!=null)
							inp3 = temp3.getContent()
						else
							inp3=null
						
						if (inp3 == "u")
							break
						else if (inp3 == "0") {
							s.reply("请输入新添加的洞察变量：")
							try{
								Listens[inp - 1].Envs.push(s.listen(WAIT).getContent())
							}
							catch(err){
								s.reply("输入超时")
							}
						}
						else if (inp3 < 0) {
							try {
								Listens[inp - 1].Envs.splice(Math.abs(inp3) - 1, 1)
							}
							catch (err) {
								s.reply("输入有误，请重新输入")
							}
						}
					}
				}
				else if (inp2 == 4) {//修改作用容器
					let inp3 = 1
					let limit3 = LIMIT
					while (true) {
						if (limit3-- < 0) {
							s.reply("由于您长时间未操作，已自动退出，数据未保存")
							return
						}
						if (inp3 != "")
							Print_SpyClients(QLS, Listens[inp - 1].Clients)

						let temp3=s.listen(WAIT)
						inp3 = temp3==null?null:temp3.getContent()
						if (inp3 == "u")
							break
						else if (inp3 == "0") {
							let tip = "请选择添加的青龙容器:\n"
							for (let i = 0; i < QLS.length; i++)
								tip += (i + 1) + "、" + QLS[i].name + "\n"
							s.reply(tip)
							try {
								Listens[inp - 1].Clients.push(QLS[s.listen(WAIT).getContent() - 1].client_id)
							}
							catch (err) {
								s.reply("输入有误，请重新选择")
							}
						}
						else if (inp3 < 0) {
							try {
								Listens[inp - 1].Clients.splice(Math.abs(inp3) - 1, 1)
							}
							catch (err) {
								s.reply("输入有误，请重新选择")
							}
						}
					}
				}
				else if (inp2 == 5) {
					Listens[inp - 1].Disable = !Listens[inp - 1].Disable
				}
				else if (inp2 == 6) {
					s.reply("请输入运行间隔时间(分钟):")
					let temp4=s.listen(WAIT)
					if(temp4!=null)
						Listens[inp - 1].Interval = temp4.getContent()
					else
						s.reply("已超时，请重新修改")
				}

			}
		}
	}
	return
}

function Spy_Status() {
	let data = db.get("env_listens_new")
	if (data != "") {
		let now = (new Date()).getTime()
		if (db.get("spy_locked") != "true")
			notify = "☆已完成所有任务☆\n"
		else
			notify = "★正在处理队列★\n"
		notify += "任务名 剩余任务 已完成任务 上次任务时间\n------------------------------\n"
		let Listens = JSON.parse(data)
		for (let i = 0; i < Listens.length; i++) {
			time = 0
			if (typeof (Listens[i].LastTime) == "number") {//根据上次执行时间获取任务状态
				last = new Date(Listens[i].LastTime)
				time = last.getHours() + ":" + last.getMinutes() + ":" + last.getSeconds()
				if (now - last.getTime() < Listens[i].Interval * 60 * 1000 || now - last.getTime() < 60 * 1000 || Listens[i].TODO.length != 0)
					notify += "★"
				else
					notify += "☆"
			}
			else
				notify += "☆"
			notify += Listens[i].Name + " 【" + Listens[i].TODO.length + "】【 " + Listens[i].DONE.length + "】 " + time + "\n"

		}
		Notify(notify)
	}
	else
		Notify("未配置监控任务，请先前往‘监控管理’添加")
}

function Spy_Clear() {
	let data = db.get("env_listens_new")
	if (data != "") {
		let Listens = JSON.parse(data)
		for (let i = 0; i < Listens.length; i++)
			Listens[i]["TODO"] = []
		db.set("env_listens_new", JSON.stringify(Listens))
	}
	db.set("spy_locked", false)//开锁
	Notify("清空任务队列完成")
	return
}

function Spy_RecordReset() {
	let data = db.get("env_listens_new")
	if (data != "") {
		let Listens = JSON.parse(data)
		for (let i = 0; i < Listens.length; i++) {
			Listens[i]["DONE"] = []
			Listens[i]["LastTime"] = 0
		}
		db.set("env_listens_new", JSON.stringify(Listens))
	}
	db.set("spy_locked", false)//开锁
	Notify("清理记录完成")
	return
}

function Migrate_qlspy() {
	let notify = ""
	//迁移监控配置
	let data = db.get("env_listens")
	let data2 = db.get("env_listens_new")
	if (data == "" || data == "[]") {
		s.reply("ql spy不存在监控配置，或许您已经迁移过,已退出")
		return
	}
	if (data2 != "")
		newspy = JSON.parse(data2)
	else
		newspy = []
		db.set("env_listens_backup",data)//ql spy数据备份
		db.set("env_listens","")//清除ql spy数据，以免冲突
	let result = Add_Spy(newspy, JSON.parse(data));//console.log(JSON.stringify(result))
	for (let i = result.addat; i < result.spys.length; i++) {
		notify += result.spys[i].Name + "\n"
		result.spys[i].Interval = Math.ceil(result.spys[i].Interval / 60)
	}
		db.set("env_listens_new",JSON.stringify(result.spys))
	notify = "成功迁移" + (result.spys.length - result.addat) + "项监控任务:\n" + notify

	//迁移静默设置
	let silent = db.get("spy_slient")
	db.set("spy_silent_new", silent)
	notify += "\n成功迁移静默设置:" + silent + "\n"

	//迁移监控目标
	let data3 = db.get("spy_targets")
	let targets = data3.split("&")
	let tn = []
	for (let i = 0; i < targets.length; i++)
		tn.push({ id: targets[i], name: "" })
	db.set("spy_targets_new", JSON.stringify(tn))
	notify += "\n成功迁移监控目标:" + data3 + "\n"

	s.reply(notify + "\nql spy数据已备份至jd_cookie env_listens_backup,可在网页后台查看")
}

function Recovery_qlspy() {
	let data = db.get("env_listens_backup")
	if (data == "" || data == "[]") {
		s.reply("不存在备份数据")
		return
	}
	else {
		db.set("env_listens", data)
		Notify("已恢复,可前往ql spy查看")
	}
}

function Env_Listen(envs) {
	//console.log(JSON.stringify(envs))
	if (envs.length == 0)
		return
	// 	检查变量名是否为用户配置的需要转换的变量名，是则先转换
	let data2 = db.get("spy_envtrans_new")
	if (data2 != "") {
		let trans = JSON.parse(data2)
		for (let i = 0; i < envs.length; i++) {
			for (let j = 0; j < trans.length; j++) {
				if (envs[i].name == trans[j].ori) {
					envs[i].name = trans[j].redi
					Notify(st.ToEasyCopy(s.getPlatform(),"变量自动转换：","export " + envs[i].name + "=\"" + envs[i].value + "\""))
				}
			}
		}
	}

	let qldb = new Bucket("qinglong")
	let data = qldb.get("QLS")
	if (data == "") {
		Notify("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return
	}
	let QLS = JSON.parse(data)

	//分析变量是否为监控变量，是否为重复线报，变量对应监控任务是否禁用，以及加入任务队列后是否执行
	let Listens = []//监控配置数据
	let data3 = db.get("env_listens_new")
	if (data3 != "") {
		let notify = ""
		let find = false, flag = false
		let unlock = true//是否解锁处理任务队列
		let now = (new Date()).getTime()
		Listens = JSON.parse(data3)
		for (let i = 0; i < Listens.length; i++) {
			//			Notify(Listens[i].Name)
			if (Listens[i]["TODO"] == undefined)
				Listens[i]["TODO"] = []
			if (Listens[i]["DONE"] == undefined)
				Listens[i]["DONE"] = []
			//根据上次任务执行时间,分析处理队列过程中是否不正常退出导致队列没能处理完并开锁
			if (Listens[i].LastTime != null && Listens[i].LastTime != 0) {
				let last = (new Date(Listens[i].LastTime)).getTime()
				if (Listens[i].Interval != 0) {
					if (now - last < Listens[i].Interval * 60 * 1000)
						unlock = false
				}
				else if (now - last < 3 * 60 * 1000)
					unlock = false
			}



			let que = []//将envs处理成任务队列
			for (let j = 0; j < envs.length; j++) {
				for (let k = 0; k < Listens[i].Envs.length; k++) {
					if (envs[j].name == Listens[i].Envs[k]) {
						find = true
						//console.log(JSON.stringify(envs[j])+"\n\n"+JSON.stringify(Listens[i].DONE))
						if (IsIn(envs[j], Listens[i].TODO) || IsIn(envs[j], Listens[i].DONE)) {
							notify += "【" + envs[j].value + "】重复的变量，已忽略\n"
							continue
						}
						else {
							//console.log(JSON.stringify(que))
							if(que.length==0)
								que.push([envs[j]])
							else{
								if(que[que.length-1].findIndex((value,index,array)=>value.name==envs[j].name)
								!=-1)
									que.push([envs[j]])
								else
									que[que.length-1].push(envs[j])
								
							}
						}
					}
				}
			}

			if (que.length != 0) {
				//console.log(JSON.stringify(que))
				if (Listens[i].Disable)
					notify += "发现洞察变量，检查到监控任务"+(i+1)+"【" + Listens[i].Name + "】任务已禁用，已忽略\n"
				else {
					//检查监控任务填写容器是否错误
					if (Listens[i].Clients.length == 0)
						notify += "发现洞察变量，检查到监控任务"+(i+1)+"【" + Listens[i].Name + "】无指定容器，已忽略\n请尽快前往‘监控管理’添加该任务的作用容器\n"
					else {
						if(!Listens[i].Clients.every((value)=>
								QLS.findIndex((value2,index,arrat)=>
									value2.client_id==value)!=-1
							
						))
							notify += "发现洞察变量，检查到监控任务"+(i+1)+"【" + Listens[i].Name + "】配置的容器中存在不属于傻妞所对接容器的容器，请尽快前往‘监控管理’修改该任务的作用容器\n"
					
						flag = true
						notify += "发现" + que.length + "个洞察变量，【" + Listens[i].Name + "】加入任务队列\n"
						Listens[i].TODO = que.concat(Listens[i].TODO)
					}
				}
			}
		}
	
		if (find) {
			//if(NotifyMode)
				Notify(notify)
			if (flag) {
				db.set("env_listens_new", JSON.stringify(Listens))
				if (db.get("spy_locked") == "false") {
					db.set("spy_locked", true)
					Que_Manager(QLS)
					return
				}
			}
		}
		else {
			//if(NotifyMode)
				Notify("未监控的变量，已忽略")
		}
		if (unlock) {//用于某些特殊情况未能正常处理完队列导致锁未能打开时重新开锁
			db.set("spy_locked", false)
			//			Notify("开锁")
		}
	}
	else {
		return -6//不存在监控配置
	}
}

function JDCODE_Decode(JDCODE) {
	let info = st.NolanDecode(JDCODE)
	if (info == null){
		info =st.WallDecode(JDCODE)
		if (info == null){
			info = st.WindfggDecode(JDCODE)
			if (info == null){
				Notify("解析失败")
				return null
			}
		}
	}
	Notify(st.ToHyperLink(s.getPlatform(),info.jumpUrl,info.title))//口令解析结果通知，不需要自行注释
	Urls_Decode([info.jumpUrl])
}

function Urls_Decode(urls) {//console.log(urls)
	let notify = "", tgpush = ""
	let envs = []//记录urls中提取的变量
	for (let i = 0; i < urls.length; i++) {
		let spy = []
		//使用自定义解析规则尝试解析
		let data = db.get("spy_urldecode_new")
		if (data != "") {
			let urldecodes = JSON.parse(data)
			spy = DecodeUrl(urls[i], urldecodes)
		}
		if (spy.length == 0) {//未能根据自定义解析规则解析出变量，使用内置解析规则
			spy = DecodeUrl(urls[i], DefaultUrlDecode)
		}
		if (spy.length == 0) {
			notify += "未解析到变量\n可使用\"监控管理\"命令自行添加\n"
		}
		else {
			for (let i = 0; i < spy.length; i++) {
				notify=st.ToEasyCopy(s.getPlatform(),spy[i].act,"export " + spy[i].name + "=\"" + spy[i].value + "\"")
				envs.push(spy[i])
			}
		}
	}
	Notify(notify)//变量解析通知，不需要自行注释
	if (envs.length != 0)
		Env_Listen(envs)
}

function Export_Spy() {
	let notify = ""
	let data = db.get("env_listens_new")
	if (data == "")
		return "不存在监控信息"
	let spys = JSON.parse(data)
	let n = 0//监控数组截取位置
	s.reply("请输入每条消息导出项数(当导出项数过多时会导致无法导出或者最后无法导入，输入0将一次全部导出，建议不超过10)")
	let temp = s.listen(25000)
	if(temp==null){
		s.reply("输入超时，已退出")
		return
	}
	let num = Number(temp.getContent())
	if (num == 0) {
		let temp = ClearHistory(spys)
		if (s.reply("ImportWhiteEye=" + JSON.stringify(temp))==""){
			s.reply("导出数量过多，导出失败,请重新导出并减少单次导出项数")		
		}
		return
	}
	while (n + num < spys.length) {
		let temp = ClearHistory(spys.slice(n, n += num))

		if (typeof(s.reply("ImportWhiteEye=" + JSON.stringify(temp)))=="")
			s.reply("导出数量过多，导出失败,请重新导出并减少单次导出项数")
	}
	if (n < spys.length)//导出末尾未截取到的部分
		s.reply("ImportWhiteEye=" + JSON.stringify(ClearHistory(spys.slice(n))))
}

function Import_Spy(data) {
	let notify = ""
	let qldb = new Bucket("qinglong")
	let data1 = qldb.get("QLS")
	if (data1 == "") {
		Notify("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return
	}
	let QLS = JSON.parse(data1)
	try {
		var newspy = JSON.parse(data)
	}
	catch (err) {
		return "接收信息有误，或者切换平台导入，或者在命令行交互模式导入"
	}
	let olddata = db.get("env_listens_new")
	if (olddata == "") {//不存在监控信息
		olddata = "[]"
	}

	let oldspy = JSON.parse(olddata)
	let result = Add_Spy(oldspy, newspy)
	db.set("env_listens_new", JSON.stringify(result.spys))
	return "共导入" + (result.spys.length - result.addat) + "个监控任务\n" + notify

}


/**************工具函数**************/
//处理任务队列 
function Que_Manager(QLS) {
	//	Notify("处理任务队列")
	let count = 0
	let limit = 100//死循环保险，防止陷入死循环
	//处理队列任务
	while (true) {
		let now = (new Date()).getTime()
		if (limit-- < 0) {
			Notify("『白眼』\n死循环了，自动退出")
			Spy_Clear()
			break
		}

		//检查是否已完成所有任务，是则开锁并停止循环退出
		let Listens = JSON.parse(db.get("env_listens_new"))
		let done = true//检查是否已完成所有任务
		for (let i = 0; i < Listens.length; i++) {
			if (Listens[i].TODO.length != 0) {
				done = false
				break
			}
		}
		if (done) {
			db.set("spy_locked", false)//开锁
			if(NotifyMode)
				Notify("已完成所有任务")
			break
		}
		else {
			db.set("spy_locked", true)//防止不正常开锁		
		}



		for (i = 0; i < QLS.length; i++) {
			QLS[i]["envs"] = []	//容器配置文件需要修改的变量
			QLS[i]["keywords"] = []	//容器需要执行的任务的关键词
			QLS[i]["listenIndex"]=[]	//记录keywords对应的监听任务,便于未能顺利执行时撤回
		}

		//执行任务
		let t = 60 * 1000//距离所有任务中最近的下一次任务的时间
		let record = []//记录将要执行的监控任务,用于执行失败时恢复
		for (let i = 0; i < Listens.length; i++) {
			//分析距离上次任务时间是否达到执行间隔
			let todo = false
			if (Listens[i].LastTime != 0 && Listens[i].LastTime != null) {
				let last = (new Date(Listens[i].LastTime)).getTime()
				temp = last + Listens[i].Interval * 60 * 1000 - now
				if (temp < 0) {
					todo = true
				}

			}
			else
				todo = true

			/*			if(Listens[i].TODO.length>0)
			//			s.reply(Listens[i].Name+":\n"+!Listens[i].Disable+"\n"+todo+"\n"+Listens[i].TODO.length)
					
						//记录各个容器中需要修改的变量与需要执行的任务关键词*/
			if (todo && Listens[i].TODO.length != 0) {
				//if(Listens[i].TODO.length!=0){
				for (let j = 0; j < Listens[i].Clients.length; j++) {//记录各个容器需要修改的变量与执行的任务的关键词
					for (k = 0; k < QLS.length; k++) {
						if (Listens[i].Clients[j] == QLS[k].client_id) {
							//							Notify("将要执行"+JSON.stringify(Listens[i].TODO))
							for (m = 0; m < Listens[i].TODO[0].length; m++) {
								QLS[k]["envs"].push(Listens[i].TODO[0][m])
							}
							QLS[k]["keywords"].push(Listens[i].Keyword)
						}
					}
				}
				record.push(Listens[i])
				Listens[i].LastTime = now
				Listens[i].DONE.push(Listens[i].TODO[0])
				if (Listens[i].DONE.length > 50)//默认最多保存50个监控记录
					Listens[i].DONE.splice(0, 20)
				Listens[i].TODO.shift()
				//Notify(Listens[i].Name+"任务间隔"+Listens.Interval)
				if (Listens[i].Interval != 0 && Listens[i].Interval * 60 * 1000 < t)
					t = Listens[i].Interval * 60 * 1000
			}
		}
		//		Notify("距离下一次任务时间:"+t)
		//对各个容器执行任务
		let suss = false
		let notify = ""
		for (let i = 0; i < QLS.length; i++) {
			//			s.reply(JSON.stringify(QLS[i].envs)+"\n\n"+QLS[i].keywords)
			if (QLS[i].envs.length == 0) {//该容器无任务,未监控该容器或者该容器已禁用
				//				notify+=QLS[i].name+"无任务，跳过\n"
				continue
			}
			let token = ql.Get_QL_Token(QLS[i].host, QLS[i].client_id, QLS[i].client_secret)
			if (token == null) {
				notify += QLS[i].name + "token获取失败，跳过\n"
				continue
			}

			if (!ql.Modify_QL_Config(QLS[i].host, token, QLS[i].envs)) {
				notify += QLS[i].name + JSON.stringify(QLS[i].envs) + "配置文件变量修改失败，跳过\n"
				continue
			}
			let crons = ql.Get_QL_Crons(QLS[i].host, token)
			if (crons == null) {
				notify += QLS[i].name + "获取青龙任务失败，跳过\n"
				continue
			}
			let ids = [], names = []//记录需要执行的青龙任务
			/*for(j==0;j<QLS[i].keywords.length;j++){
				for(k=0;k<crons.length;k++){
					if(crons[k].name.indexOf(QLS[i].keywords[j]!=-1)||crons[k].command.indexOf(QLS[i].keywords[j]!=-1)){
						if(crons[k].pid==""){//找到了任务但该任务还在执行,将对应监控任务队列
							Listens[QLS[i].listenIndex[j]].TODO.push(Listens[QLS[i].listenIndex[j]].DONE[Listens[QLS[i].listenIndex[j]].DONE.length-1])
						}
					}
				}
			}*/
			for (j = 0; j < crons.length; j++) {
				for (k = 0; k < QLS[i].keywords.length; k++) {
					if (crons[j].command.indexOf(QLS[i].keywords[k]) != -1 || crons[j].name.indexOf(QLS[i].keywords[k]) != -1) {
						//if(crons[j].pid==""){
							if (crons[j].id)
								ids.push(crons[j].id)
							else
								ids.push(crons[j]._id)
							names.push(crons[j].name)
							QLS[i].keywords.splice(k, 1)//删除以避免执行容器内具有相同关键词的任务
						//}
					}
				}
			}
			if (ids.length == 0) {
				notify += QLS[i].name + "容器未找到任务:" + QLS[i].keywords.toString() + "请检查是否监控任务配置有误\n"
			}
			if (!ql.Stop_QL_Crons(QLS[i].host, token, ids)) {
				//				Notify(QLS[i].name+":\n"+names.toString()+"\n停止失败")		
			}
			sleep(1000)
			if (ql.Start_QL_Crons(QLS[i].host, token, ids)) {
			//if(true){
				notify += "容器【" + QLS[i].name + "】:执行〔" + names.toString() + "〕执行成功"
				suss = true
			}
			//			else
			//				Notify(QLS[i].name+":\n"+names.toString()+"\n执行失败")
		}

		/*		if(!suss){//没有成功执行，将移入已完成队列的任务移出
					for(let i=0;i<Listens[i].length;i++)
						for(j=0;j<record.length;j++)
							if(Listens[i].Name==record[j])
								Listens[i].DONE.pop()
				}	*/
		db.set("env_listens_new", JSON.stringify(Listens))
		if(notify!="")
			Notify(notify)
		/*		count++
		//		if(t>0){
					s.reply("第"+count+"次循环,等待时长:"+t)
					sleep(10000)
		//		}*/
		sleep(t)
	}
}


//根据配置urldecodes尝试解析url
function DecodeUrl(url, urldecodes) {//console.log(url+"\n"+url.length)
	let spy = []//解析结果：[{name:监控变量名,value:监控变量值,act:活动任务名}]
	for (let i = 0; i < urldecodes.length; i++) {
		if (url.indexOf(urldecodes[i].keyword) != -1) {//console.log("找到链接解析规则"+urldecodes[i].keyword)
			for (let j = 0; j < urldecodes[i].trans.length; j++) {
				let temp = {
					act: urldecodes[i].name,
					name: urldecodes[i].trans[j].redi
				}
				if (urldecodes[i].trans[j].ori == -1) {//使用整段url作为变量
					temp["value"] = url
					spy.push(temp)
				}
				else {//提取参数作为变量
					let reg = new RegExp("(?<=" + urldecodes[i].trans[j].ori + "=)\\w+")
					//console.log("(?<=" + urldecodes[i].trans[j].ori + "=)\w+")
					let actid = url.match(reg);//console.log("提取参数"+actid)
					if (actid != null) {
						temp["value"] = actid[0]
						spy.push(temp)
					}

				}
			}
			//				if(spy.length!=0)//成功在配置中找到并将url转换为监控变量
			//					break
		}
	}
	return spy
}




//导入监控数据
function Add_Spy(oldspy, newspy) {
	let data = (new Bucket("qinglong")).get("QLS")
	if (data == "") {
		//		Notify("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return null
	}
	let QLS = JSON.parse(data)
	//	console.log(JSON.stringify(oldspy)+"\n\n"+JSON.stringify(newspy))
	let start = oldspy.length//保存导入结果数据中新添项开始的位置
	console.log(newspy.length)
	for (let i = 0; i < newspy.length; i++) {//导入监控配置与现存某项监控的变量相同则不导入此项监控配置
		let find=function () {
			for (let j = 0; j < oldspy.length; j++) {
				for (k = 0; k < oldspy[j].Envs.length; k++) {
					for (m = 0; m < newspy[i].Envs.length; m++) {
						if (newspy[i].Envs[m] == oldspy[j].Envs[k]) {
							console.log(newspy[i].Name + "的" + newspy[i].Envs[m] + "变量已存在于监控中，不导入\n")
							return true
						}
					}
				}
			}
			return false
		}()
		if(!find){
			ClearHistory([newspy[i]])
			for (let j = 0; j < newspy[i].Clients.length; j++) {//删除监控任务newspy[i]中指定容器非傻妞对接容器的容器
				let noclient=function () {
					for (k = 0; k = QLS.length; k++)
						if (QLS.client_id == newspy[i].Clients[j])
							return true
					return false
				}()
				if(noclient){
					console.log(`删除${newspy[i].Name}：${newspy[i].Clients[j]}`)
					newspy[i].Clients.splice(j, 1)
				}
			}
			if(newspy[i].Clients.length==0){//导入的任务无有效容器，将非禁用容器作为默认容器
				for(j=0;j<QLS.length;j++)
					if(!QLS.disable)
						newspy[i].Clients.push(QLS[j].client_id)
			}
			oldspy.push(newspy[i])
//			console.log("成功导入【" + newspy[i].Name + "】\n")
		}
		else {
			console.log(newspy[i].Name + "已存在")
		}
	}
//	console.log(JSON.stringify(oldspy))
	return { spys: oldspy, addat: start }
}


//发送msg消息
function Notify(msg) {//s.reply("通知")
	let imType = s.getPlatform()
	let message = s.getContent();//s.reply(message)
	if (db.get("spy_silent_new") != "true" || s.isAdmin()) {//s.reply(msg)
		if (imType != "tg")
			s.reply(msg)
		else {
			//msg = msg.replace(/(?<!\\)_/g,"\\_")
			if (s.getChatId() != 0){
				if(!st.SendToTG(s.getChatId(), msg))
					s.reply(msg)
			}
			else{
				if(!st.SendToTG(s.getUserId(), msg))
					s.reply(msg)
			}
		}
	}
	else {//静默
		let from = "处理来自" + s.getPlatform() + ":"
		if (s.getChatId() != 0) {
			/*			if(s.getChatname()!="")
							from+="群("+s.getChatname()+")"
						else*/
			from += "群(" + s.getChatId() + ")"
		}
		if (s.getUsername() != "")
			from += "(" + s.getUsername() + ")"
		else
			from += "(" + s.getUserId() + ")"
		from += "的消息\n---------------------\n【" + message.slice(0, 50) + "......】\n---------------------\n";
//		tgmsg=(from + tgmsg).replace(/(?<!\\)_/g,"\\_")
		st.NotifyMainKey("SpyNotify", false, from + msg + "\n--『白眼』")
		st.NotifyMainKey("SpyGroupNotify", true, from + msg + "\n--『白眼』")
	}
}




//清空Listens监控队列与记录
function ClearHistory(Listens) {
	for (let i = 0; i < Listens.length; i++) {
		Listens[i]["TODO"] = []
		Listens[i]["DONE"] = []
		Listens[i]["LastTime"] = 0
		Listens[i]["Clients"] = []
		if (Listens[i].UUID)
			delete Listens[i].UUID
		if (Listens[i].Mode)
			delete Listens[i].Mode
		if (Listens[i].MaxRuntime)
			delete Listens[i].MaxRuntime
	}
	return Listens
}

//检查消息源是否监控目标或者管理员
function IsTarget() {
	try {
		let uid = s.getUserId(), cid = s.getChatId()
		let tgbotid=(new Bucket("tg")).get("token").split(":")[0]//不解析来自机器人的消息
		let targets = JSON.parse(db.get("spy_targets_new"))
		for (let i = 0; i < targets.length; i++){
			if (targets[i].id == uid )
				return true
			else if(targets[i].id == cid&&uid!=tgbotid)
				return true
		}
		return false
	}
	catch (err) {
		return false
	}
}

//检查env{name:变量名,value:变量值}是否已存在队列[[{name:变量名,value:变量值}]]
function IsIn(env, TODO) {
	//	s.reply("env:"+JSON.stringify(env)+"\n\ntodo:"+JSON.stringify(TODO)+"\n\ndone:"+JSON.stringify(DONE))
	for (let i = 0; i < TODO.length; i++)
		for (j = 0; j < TODO[i].length; j++)
			if (TODO[i][j].name == env.name && TODO[i][j].value == env.value)
				return true
	return false
}

//保存数据
function SaveData(Listens, silent, targets, trans, urldecodes) {
	try {
		if (typeof (Listens) == "object")
			db.set("env_listens_new", JSON.stringify(Listens))
		else
			db.set("env_listens_new", Listens)

		db.set("spy_silent_new", silent)

		if (typeof (targets) == "object")
			db.set("spy_targets_new", JSON.stringify(targets))
		else
			db.set("spy_targets_new", targets)

		if (typeof (trans) == "object")
			db.set("spy_envtrans_new", JSON.stringify(trans))
		else
			db.set("spy_envtrans_new", trans)

		if (typeof (urldecodes) == "object")
			db.set("spy_urldecode_new", JSON.stringify(urldecodes))
		else
			db.set("spy_urldecode_new", urldecodes)
		return "已保存本次修改"
	}
	catch (err) {
		return "保存失败"
	}
}

//打印监控主菜单页面
function Print_SpyMenu(Listens, silent, targets) {
	//	s.reply(JSON.stringify(targets))
	let notify = "----------------------\n请选择编辑对象\n----------------------\n(-数字删除,0添加,q退出，wq保存)\n"
	for (let i = 0; i < Listens.length; i++) {
		let name = Listens[i]["Name"]
		if (name == undefined)
			name = Listens[i]["name"]//之前数据存储写错单词
		if (Listens[i].Disable)
			notify += (i + 1) + "、" + name + "-[禁用]\n"
		else
			notify += (i + 1) + "、" + name + "\n"
	}

	if (silent == "true")
		notify += "a、关闭静默\n"
	else
		notify += "a、开启静默\n"
	notify += "b、变量自动转换\n"
	notify += "c、链接自动解析\n"
	notify += "d、监听目标:"
	for (let i = 0; i < targets.length; i++) {
		if (targets[i].name != "")
			notify += "【" + targets[i].name + "】"
		else
			notify += "【" + targets[i].id + "】"
	}
	s.reply(notify)
}

//打印监控菜单-监听目标页面
function Print_SpyTargets(targets) {
	let notify = "请选择监听目标进行编辑：\n(-数字删除，0增加，u返回)\n"
	for (let i = 0; i < targets.length; i++) {
		notify += (i + 1) + "、"
		if (targets[i].name != "")
			notify += targets[i].name + ":"
		notify += targets[i].id + "\n"
	}
	s.reply(notify)
}

//打印监控菜单-监听任务-指定容器页面
function Print_SpyClients(QLS, clients) {
	notify = "请选择指定容器进行编辑：\n(-数字删除，0增加，u返回)\n"
	for (let i = 0; i < clients.length; i++) {
		let find = false
		for (j = 0; j < QLS.length; j++)
			if (clients[i] == QLS[j].client_id) {
				find = true
				notify += (i + 1) + "、" + QLS[j].name + "\n"
			}
		if (!find)
			notify += (i + 1) + "、未找到容器[" + clients[i] + "]，请确认您在’青龙管理‘内有对应此应用ID的容器\n"
	}
	s.reply(notify)
}

//打印监控菜单-监听任务-洞察变量页面
function Print_Spy_Envs(envs) {
	let notify = "请选择洞察变量进行编辑：\n(-数字删除，0增加，u返回)\n"
	for (let i = 0; i < envs.length; i++)
		notify += (i + 1) + "、" + envs[i] + "\n"
	s.reply(notify)
}

//打印监控菜单-监控任务页面
function Print_SpyItem(spy, QLS) {
	let notify = "请选择要编辑的属性:\n(u返回,q退出,wq保存)\n"
	notify += "1、监视任务名称：" + spy.Name + "\n"
	notify += "2、脚本关键词：" + spy.Keyword + "\n"
	notify += "3、洞察变量：" + spy.Envs.toString() + "\n"
	notify += "4、指定容器："
	for (let i = 0; i < spy.Clients.length; i++) {
		let find = false
		for (j = 0; j < QLS.length; j++)
			if (spy.Clients[i] == QLS[j].client_id) {
				find = true
				notify += "【" + QLS[j].name + "】"
				break
			}

		if (!find)
			notify += "[" + spy.Clients[i] + "]"
	}
	notify += "\n"
	if (spy.Disable)
		notify += "5、关闭禁用\n"
	else
		notify += "5、开启禁用\n"
	notify += "6、运行间隔时间：" + spy.Interval + "分钟\n"
	s.reply(notify)
}

//打印监控菜单-变量转换页面
function Print_SpyTran(trans) {
	let notify = "请选择添加添加或者删除转换变量：\n(-数字删除，0添加,u返回)\n"
	for (let i = 0; i < trans.length; i++)
		notify += (i + 1) + "、" + trans[i].name + ":" + trans[i].ori + "-->" + trans[i].redi + "\n"
	s.reply(notify)
}

//打印监控菜单-链接解析页面
function Print_SpyUrl(decodes) {
	let notify = "请选择添加添加或者删除解析链接：\n(-数字删除，0添加,u返回)\n"
	for (let i = 0; i < decodes.length; i++) {
		notify += (i + 1) + "、" + decodes[i].name + "(" + decodes[i].keyword + "):\n"
		for (let j = 0; j < decodes[i].trans.length; j++)
			notify += decodes[i].trans[j].ori + "-->" + decodes[i].trans[j].redi + "\n"
	}
	s.reply(notify)
}



/****************内置解析链接规则****************** */
//非activityId在最后
var DefaultUrlDecode =
	[
		{
			keyword: "https://cjhydz-isv.isvjcloud.com/wxTeam/activity",
			name: "CJ组队瓜分",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_activityId"
			}]
		},

		{
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxTeam/activity",
			name: "LZ组队瓜分",
			trans: [{
				ori: "activityId",
				redi: "jd_zdjr_activityId"
			}]
		},


		{
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxShareActivity/activity",
			name: "LZ分享有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_wxShareActivity_activityId"
			}]
		},

		{
			keyword: "https://cjhydz-isv.isvjcloud.com/microDz/invite/activity",
			name: "CJ微定制",
			trans: [{
				ori: "activityId",
				redi: "jd_wdz_activityId"
			}]
		},

		{
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxCollectCard",
			name: "M集卡抽奖",
			trans: [{
				ori: -1,
				redi: "M_WX_COLLECT_CARD_URL"//wall
			}]
		},
		{
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxCollectCard",
			name: "LZ集卡抽奖",
			trans: [{
				ori: "activityId",
				redi: "jd_wxCollectCard_activityId"//kr
			}]
		},


		{
			keyword: "wxCollectionActivity/activity",
			name: "M加购有礼",
			trans: [{
				ori: "-1",
				redi: "M_WX_ADD_CART_URL"//wall
			}]
		},
		{
			keyword: "wxCollectionActivity/activity",
			name: "加购有礼",
			trans: [{
				ori: "-1",
				redi: "jd_wxCollectionActivity_activityUrl"//kr
			}]
		},
		{
			keyword: "https://lzkj-isv.isvjcloud.com/wxCollectionActivity/activity2",
			name: "LZ加购有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_wxCollectionActivityId"//环保
			}]
		},

		{
			keyword: "https://cjhy-isv.isvjcloud.com/wxCollectionActivity/activity",
			name: "CJ加购有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_wxCollectionActivityId"//环保
			}]
		},

		{
			keyword: "wxDrawActivity/activity",
			name: "幸运抽奖",
			trans: [{
				ori: "-1",
				redi: "LUCK_DRAW_URL"//kr
			}]
		},
		{
			keyword: "https://lzkj-isv.isvjcloud.com/lzclient",
			name: "幸运抽奖",
			trans: [{
				ori: "-1",
				redi: "LUCK_DRAW_URL"//kr
			}]
		},
		{
			keyword: "wxDrawActivity/activity",
			name: "幸运抽奖",
			trans: [{
				ori: "-1",
				redi: "M_WX_LUCK_DRAW_URL"//wall
			}]
		},
		{
			keyword: "https://lzkj-isv.isvjcloud.com/lzclient",
			name: "幸运抽奖",
			trans: [{
				ori: "-1",
				redi: "M_WX_LUCK_DRAW_URL"//wall
			}]
		},
		{
			keyword: "https://lzkj-isv.isvjcloud.com/lzclient/",
			name: "LZ幸运抽奖",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_wxDrawActivity_Id"//环保
			}]
		},
		{
			keyword: "https://cjhy-isv.isvjcloud.com/wxDrawActivity/activity/",
			name: "CJ幸运抽奖",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_wxDrawActivity_Id"//环保
			}]
		},

		{
			keyword: "https://lzkj-isv.isvjcloud.com/wxgame/activity",
			name: "LZ店铺游戏",
			trans: [{
				ori: "activityId",
				redi: "jd_wxgame_activityId"
			}]
		},

		{
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxSecond",
			name: "M读秒手速",
			trans: [{
				ori: "-1",
				redi: "M_WX_SECOND_DRAW_URL"
			}]
		},
		{
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxSecond",
			name: "LZ读秒拼手速",
			trans: [{
				ori: "activityId",
				redi: "jd_wxSecond_activityId"//kr
			}]
		},

		{
			keyword: "wxCartKoi/cartkoi",
			name: "LZ购物车锦鲤",
			trans: [{
				ori: "activityId",
				redi: "jd_wxCartKoi_activityId"
			}]
		},

		{
			keyword: "https://lzkj-isv.isvjd.com/wxShopFollowActivity",
			name: "LZ店铺关注抽奖",
			trans: [{
				ori: "activityId",
				redi: "jd_wxShopFollowActivity_activityId"//kr 环保
			}]
		},
		{
			keyword: "https://lzkj-isv.isvjcloud.com/wxShopFollowActivity",
			name: "LZ店铺关注抽奖",
			trans: [{
				ori: "activityId",
				redi: "jd_wxShopFollowActivity_activityId"//kr 环保
			}]
		},

		{
			keyword: "https://cjhydz-isv.isvjcloud.com/wxShopFollowActivity/activity",
			name: "CJ店铺关注抽奖",
			trans: [{
				ori: "activityId",
				redi: "jd_cjwxShopFollowActivity_activityId"//kr
			}]
		},
		
		{
			keyword: "https://cjhy-isv.isvjcloud.com/wxShopFollowActivity/activity",
			name: "M关注抽奖",
			trans: [{
				ori: "-1",
				redi: "M_WX_FOLLOW_DRAW_URL"
			}]
		},

		{
			keyword: "https://lzkj-isv.isvjcloud.com/drawCenter",
			name: "LZ刮刮乐",
			trans: [{
				ori: "activityId",
				redi: "jd_drawCenter_activityId"
			}]
		},
		{
			keyword: "https://lzkj-isv.isvjcloud.com/drawCenter",
			name: "M老虎机抽奖",
			trans: [{
				ori: "-1",
				redi: "M_WX_CENTER_DRAW_URL"
			}]
		},

		{
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity",
			name: "LZ粉丝互动",
			trans: [{
				ori: "activityId",
				redi: "jd_wxFansInterActionActivity_activityId"
			}]
		},
		{
			keyword: "https://lzkjdz-isv.isvjd.com/wxFansInterActionActivity",
			name: "LZ粉丝互动",
			trans: [{
				ori: "activityId",
				redi: "jd_wxFansInterActionActivity_activityId"
			}]
		},


		{
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxShareActivity/activity/",
			name: "LZ分享有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_wxShareActivity_activityId"
			}]
		},
		{
			keyword: "https://lzkjdz-isv.isvjd.com/wxShareActivity/activity/",
			name: "LZ分享有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_wxShareActivity_activityId"
			}]
		},

		{
			keyword: "https://jdjoy.jd.com/module/task/v2/doTask",
			name: "JoyJD任务",
			trans: [{
				ori: "activityId",
				redi: "comm_activityIDList"
			}]
		},

		{
			keyword: "https://cjhy-isv.isvjcloud.com/sign/signActivity",
			name: "超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "CJHY_SIGN"
			}]
		},
		{
			keyword: "https://cjhy-isv.isvjcloud.com/sign/sevenDay/signActivity",
			name: "超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "CJHY_SEVENDAY"
			}]
		},
		{
			keyword: "https://lzkj-isv.isvjcloud.com/sign/signActivity2",
			name: "超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "LZKJ_SIGN"
			}]
		},
		{
			keyword: "https://lzkj-isv.isvjcloud.com/sign/sevenDay/signActivity",
			name: "超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "LZKJ_SEVENDAY"
			}]
		},

		{
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxUnPackingActivity/activity/activity",
			name: "LZ让福袋飞",
			trans: [{
				ori: "activityId",
				redi: "jd_wxUnPackingActivity_activityId"
			}]
		},
		{
			keyword: "https://lzkjdz-isv.isvjd.com/wxUnPackingActivity/activity/activity",
			name: "LZ让福袋飞",
			trans: [{
				ori: "activityId",
				redi: "jd_wxUnPackingActivity_activityId"
			}]
		},

		{
			keyword: "https://cjhy-isv.isvjcloud.com/wx/completeInfoActivity/view/activity",
			name: "CJ完善信息有礼",
			trans: [
				{
					ori: "activityId",
					redi: "jd_completeInfoActivity_activityId"
				},
				{
					ori: "venderId",
					redi: "jd_completeInfoActivity_venderId"
				}
			]
		},

		{
			keyword: "https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/activity",
			name: "CJ生日礼包和会员等级礼包",
			trans: [{
				ori: "activityId",
				redi: "jd_wxMcLevelAndBirthGifts_activityId"
			}]
		},
		{
			keyword: "https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/activity",
			name: "M等级/生日礼包",
			trans: [{
				ori: "-1",
				redi: "M_WX_LEVEL_BIRTH_URL"
			}]
		},

		{
			keyword: "https://lzkj-isv.isvjcloud.com/wxBuildActivity/activity",
			name: "LZ盖楼有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_wxBuildActivity_activityId"//kr
			}]
		},
		{
			keyword: "https://lzkj-isv.isvjd.com/wxBuildActivity/activity",
			name: "M盖楼领奖",
			trans: [{
				ori: "-1",
				redi: "M_WX_BUILD_DRAW_URL"
			}]
		},

		{
			keyword: "https://lzkj-isv.isvjcloud.com/wxShopGift/activity",
			name: "M关注有礼无线",
			trans: [{
				ori: "-1",
				redi: "M_WX_SHOP_GIFT_URL"
			}]
		},

		{
			keyword: "https://cjhy-isv.isvjcloud.com/wxInviteActivity/openCard/invitee",
			name: "CJ开卡入会有礼",
			trans: [{
				ori: "venderId",
				redi: "VENDER_ID"
			}]
		},

		{
			keyword: "https://prodev.m.jd.com/mall/active/dVF7gQUVKyUcuSsVhuya5d2XD4F",
			name: "邀好友赢大礼",
			trans: [{
				ori: "code",
				redi: "yhyauthorCode"
			}]
		},

		{
			keyword: "https://jinggengjcq-isv.isvjcloud.com",
			name: "大牌联合开卡",
			trans: [{
				ori: "actId",
				redi: "DPLHTY"
			}]
		},
	]


main()
