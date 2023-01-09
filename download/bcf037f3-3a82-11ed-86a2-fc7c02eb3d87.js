/*
* @author https://t.me/sillyGirl_Plugin
* @create_at 2022-09-07 18:35:08
* @description 口令解析、链接解析、变量转换、变量监控多合一，须安装something与qinglong模块，若无芝士，需在配置项填入容器信息
* @title 白眼
* @rule raw [\s\S]*[(|)|#|@|$|%|¥|￥|!|！]([0-9a-zA-Z]{10,14})[(|)|#|@|$|%|¥|￥|!|！][\s\S]*
* @rule raw [\s\S]*https:\/\/(.{2,}\.isvj(clou)?d\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)[\s\S]*
* @rule raw [\s\S]*https:\/\/([\w\.]*[^u]\.jd\.com)[\s\S]*
* @rule raw [\s\S]*export \w+[ ]*=[ ]*"[^"]+"[\s\S]*
* @rule 恢复ql spy
* @rule 监控管理
* @rule 导出白眼
* @rule raw ImportWhiteEye=[\S\s]+
* @rule 天王盖地虎
* @rule 监控状态
* @rule 清空监控队列
* @rule 清空监控记录
* @rule 清空白眼数据
* @priority 10
 * @public false
* @disable false
* @version v1.4.0
*/


/*****************************详细说明***********************
监控目标:
除设置的对象外，默认监控管理员消息
注：若要正常监控，除设置监控目标外，还需傻妞监听该目标（在傻妞后台-群组管理，添加监听目标群或者频道）

静默：开启后傻妞将会静默处理监控消息，不会在当前会话发出通知
静默推送：即开启静默模式，但又使用过命令"set SpyNotify qq/tg/wx 用户id"或者"set SpyGroupNotify qq/tg/wx 群id"设置过通知渠道，傻妞将会在当前会话静默，但是会将监控处理情况推送到设置的渠道，将命令中的set改为delete即为取消设置

迁移ql spy（已移除本功能）:
将会将ql spy任务备份至jd_cookie env_listens_backup(使用命令get jd_cookie env_listens_backup可以获取，不过数据过多部分平台可能获取失败，可以前往命令行傻妞交互模式或者数据管理web端查看)
同时将删除ql spy数据(因为会跟白眼冲突，导致白眼无法作用)

恢复ql spy:
即将jd_cookie env_listens_backup数据恢复至jd_cookie env_listens

导出白眼：选择一次性导出项数过多时可能会导出失败，建议选择10项左右

导入白眼数据：
将导出的信息发送给机器人即可，会默认仅添加自己没有监控的变量的任务
并把傻妞所绑定的所有非禁用容器作为作用容器

监控状态：
查看监控任务的未完成任务数量、已完成任务数量、以及上次任务时间

其他：出现奇奇怪怪的不运行的情况可以使用‘清空监控队列’或者‘清空监控记录’命令进行重置

插件中可能需要区分的名称：监控任务名称，自定义变量转换规则名称，自定义链接解析规则名称，青龙任务名称、以及内置的链接解析规则的名称
插件最后为内置解析规则，自定义解析规则类似(残废，仅可添加简单规则)
*/

/*****************配置***************************/
/*容器信息，若未使用过芝士的“青龙管理”命令对接过青龙，须填写容器信息
例：
var QLS=[
    {
        "host":"http://127.0.0.1:5700",     //容器1地址
        "client_id":"aaaaaaaa",         //容器应用id
        "client_secret":"AAAAAAAA", //容器应用密钥
        "disable":false,    //导入监控任务时本容器是否默认不监控
        "name":"服务器1"   //容器名
    },
    {
        "host":"http://127.0.0.1:5800",     
        "client_id":"bbbbbbbb",        
        "client_secret":"BBBBBBBBBBBBBBBBB", 
        "disable":false,   
        "name":"服务器2"   
    }
]*/
var QLS=[]

//监控开关,关闭后将仅解析不监控
const SPY=true

const NotifyMode=false

//监控目标黑名单，用于屏蔽群内某些不想监控的账号
const BlackList=["162726413","5036494307"]

//口令关键词黑名单,用于屏蔽某些不想监控的口令，仅对非管理员起效
const JDCodeBlackList=["炸年兽","年夜饭","队","助"]
/************************************************/

/*
2022-8-27 v1.0.0 
2022-8-27 v1.0.1 修复人形傻妞与tg机器人位于同一个对话时不停互相丢链接的问题，可能修复监控偶尔报错的问题
2022-8-29 v1.0.2 修复最新版傻妞重复迁移ql spy导致备份数据丢失的问题,修复多容器报错问题
2022-8-30 v1.1.0 修改任务处理为锁机制，导入配置时默认使用所有非禁用容器,添加一键清除白眼所有数据命令(卸载白眼可用)
2022-8-30 v1.1.1 人形与机器人位于同一会话，且监控消息含链接且变量为链接时的死循环问题
2022-8-31 v1.1.2 解决处理队列过程中遭遇不正常退出导致的队列不不处理问题（不完美，也可手动使用"清空监控队列"命令进行重置)，以及监控任务配置时未使用唯一性关键词导致启动青龙多个含相同关键词任务的问题
2022-8-31 v1.1.3 修复未找到青龙任务时，陷入死循环的问题，以及其他恢复ql spy失败问题
2022-8-31 v1.1.4 修复监控任务含多变量出现的奇奇怪怪问题
2022-9-1 v1.1.5 监控的不运行问题应该有所缓解，增加了对配置有问题的容错性，修复了不存在监控任务时第一次导入配置时無默认容器的问题
2022-9-1 v1.1.6 修复多变量任务只修改一个变量的问题，修复青龙配置文件变量值为空值时导致的另外新建变量，修改队列处理最大间隔为1分钟及其修正方式
2022-9-1 v1.2.0 修复多容器报错，并添加监控任务无容器提醒
2022-9-5 v1.2.1 适配最新傻妞,修复自定义链接解析无法去重的问题
2022-9-8 v1.2.2 修复已知bug
2022-9-9 v1.2.3 修复链接解析问题，支持解析链接型变量
2022-9-12 v1.2.5 模块化
2022-9-16 v1.2.6 队列任务对应青龙任务处于空闲状态，不受监控任务间隔限制立即执行
2022-9-20 v1.2.9 修复监控容器存在空任务时报错、部分链接识别错误以及监控任务设置时间隔后处理队列时的误报找不到青龙任务
2022-9-21 v1.3.0 修复任务时间间隔失效问题
2022-10-15 v1.3.2 链接解析规则支持正则
2022-11-19 v1.3.3 智能解析链接型变量，新增部分链接内置解析规则
2022-11-29 v1.3.4 不再使用芝士“青龙管理”命令信息，容器信息自填
2022-12-03 v1.3.5 支持多参数-->单变量
2022-12-05 v1.3.6 增加监控开关(关闭后将仅解析)
2022-12-25 v1.3.7 更新qinglong模块token缓存机制
2023-1-3 v1.3.8 更新非管理员的口令黑名单机制以及解析规则是否仅管理员可用
2023-1-5 v1.3.9 推送排版优化
2023-1-6 v1.4.0 排队及队列处理逻辑优化


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

jd_cookie spy_urldecode_new：链接解析规则

例：https://lzkj-isv.isvjcloud.com/app?a=1111&b=2222&c=3333 采用以下解析规则时
{
	keyword:"https://lzkj-isv.isvjcloud.com/app",	//必需，url关键词,string或者regdex
	trans:[
		{
			ori:"a b",	//必需，url中需要提取的参数的参数名（若使用整段url作为变量值，则本项为-1；若需提取多个参数值作为变量值，则参数名间以一个空格隔开,并在sep项填入分割符）
			redi:"0",	//可选，提取的参数使用的变量名，无本项时或者本项为0时仅输出提取的变量值
			sep:"_"		//可选，当需要提取url中多个参数值作为一个变量值时，各个不同参数值间所使用的分割符
		},
		{
			ori:"c",
			redi:"C"
		}
	],
	admin:true,	//可选，bool，该规则是否仅对管理员有效,值为false时若消息来源为非管理员，将不进行解析
	name:测试规则 	//备注名称
}
将会得到如下解析结果
【测试规则(仅管理员可用)】1111_2222
【测试规则(仅管理员可用)】export C="3333"
*/

const ql=require("qinglong")
const st=require("something")

const s = sender
const db = new Bucket("jd_cookie")
const LIMIT = 40	//循环次数限制，防止意外死循环
const WAIT = 60 * 1000	//输入等待时间

function main() {
	var msg = s.getContent()
	if(!QLS.length && SPY){	
		QLS=ql.QLS()
		if(!QLS){
			s.reply("请先使用'青龙管理'对接青龙或者在插件内填写监控容器")
			return
		}
	}
	else if(QLS.length){
		QLS.forEach((QL,i)=>QLS[i].token=ql.Get_QL_Token(QL.host,QL.client_id,QL.client_secret))
	}
	if (IsTarget() || s.isAdmin()) {//仅对监控目标和管理员消息监控
	  //try{	
		//变量监控
		if (msg.match(/export ([^"]+)="([^"]+)"/) != null) {
			let names = msg.match(/(?<=export[ ]+)\w+(?=[ ]*=[ ]*"[^"]+")/g)
			let values = msg.match(/(?<=export[ ]+\w+[ ]*=[ ]*")[^"]+(?=")/g)
			let envs = [],urls=[]
			for (let i = 0; i < values.length; i++){
					envs.push({ name: names[i], value: values[i] })
			}
			if(!Env_Listen(envs)){
				const NoDecode=["jd_zdjr_activityUrl","jd_cjhy_activityUrl","jd_wdz_activityUrl","jd_wdzfd_activityUrl"]//不解析的链接型变量
				names.forEach((ele,index)=>{
					if(ele.match(/URL|Url/) && NoDecode.indexOf(ele)==-1)
						urls.push(values[index])
					})
				if(urls.length){
					Notify("未加入监控队列，尝试解析变量链接")
					Urls_Decode(urls)
				}
			}
		}
		//链接监控
		else if (msg.match(/.isvj(clou)?d/) || msg.match(/\.\jd\.com/) ) {
			let urls = msg.match(/https:\/\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\*\+,%;\=]*/g).map(url=>decodeURIComponent(url))
			//Notify(urls.toString())
			Urls_Decode(urls)
		}
		//口令监控
		else if (msg.match(/[(|)|#|@|$|%|¥|￥|!|！][0-9a-zA-Z]{10,14}[(|)|#|@|$|%|¥|￥|!|！]/g) != null) {
			//console.log("口令")
			JDCODE_Decode(msg)
		}
		s.continue()
	//   }
	//   catch(err){
	// 		Notify("发生错误，请联系开发者\n"+err)
	// 		return
	//   }
	}

	if (!s.isAdmin()) {//其他命令为管理员命令
		s.continue()
		return
	}


	if (msg == "迁移ql spy") {
		Migrate_qlspy()
	}
	else if (msg == "恢复ql spy") {
		Recovery_qlspy()
	}

	else if (msg == "导出白眼")
		Export_Spy()

	else if (msg.match(/^ImportWhiteEye=\S+/) != null)
		s.reply(Import_Spy(msg.match(/(?<=ImportWhiteEye=)[\s\S]+/g)[0]))

	else if(msg=="天王盖地虎"){
		let data=db.get("spy_targets_new")
		if(!data)
			targets=[]
		else
			targets=JSON.parse(data)
		
		if(!targets.find(value=>value.id==s.getChatId()||value.id==s.getUserId())){
			if(s.getChatId())
				targets.push({name:s.getChatId(),id:s.getChatId()})
			else
				targets.push({name:s.getUserId(),id:s.getUserId()})
			db.set("spy_targets_new",JSON.stringify(targets))
			s.reply("宝塔镇河妖")
		}
		else
			s.reply("唧唧复唧唧")
	}

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
	let exit=function(inp){	//退出
		if (inp == "q") {
			s.reply("请确认是否直接退出？输入\"是\"不保存数据直接退出")
			let temp=s.listen(WAIT)
			if (temp &&temp.getContent() == "是")
				s.reply("未保存本次修改内容")
			else
				s.reply(SaveData(Listens, silent, targets, trans, urldecodes))	
			return true
		}
		else if (inp == "wq") {
			s.reply(SaveData(Listens, silent, targets, trans, urldecodes))
			return true
		}
		else if(inp===false){
			s.reply("由于您长时间未操作，已自动退出，数据未保存")
			return true
		}
		else
			return false
	}
	while (true) {
		if (limit-- < 0) {
			s.reply("由于您长时间未操作，已自动退出，数据未保存")
			return
		}
		if (inp)
			Menu(Listens, silent, targets)
		inp=s.listen(WAIT)
		if(inp)
			inp=inp.getContent()
		
		if(exit(inp))	//退出
			return
		else if (inp == "a") {	//静默
			if (silent != "true"){
				silent = "true"
				s.reply("已开启静默!\n若需获取监控情况，可在完成设置后使用命令'set SpyNotify tg(或qq、wx) id'或'set SpyGroupNotify tg(或qq、wx) 群id'设置推送渠道")
			}
			else{
				silent = "false"
				s.reply("已关闭静默")
			}
		}

		else if (inp == "b") {	//变量转换管理
			let temp=SpyTrans(trans)
			if(exit(temp))
				return
			else
				trans=temp
		}
		else if (inp == "c") {	//链接解析管理
			let temp=SpyUrlDecode(urldecodes)
			if(exit(temp))
				return
			else
				urldecodes=temp
		}
		else if (inp == "d") {	//监控目标管理
			let temp=SpyTargets(targets)
			if(exit(temp))
				return
			else
				targets=temp			
		}
		else if (inp == "0") {
			let spy = {
				ID: Listens.length,
				Name: "",
				Keyword: "",
				Envs: [],
				Disable: false,
				Clients: [],
				Interval: 10,
				LastTime: 0,
				TODO: [],
				DONE: []
			}
			try{
				for (let i = 0; i < QLS.length; i++)//默认监控非禁用容器
					if(!QLS[i].disable)
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
			let temp=SpyItem(Listens[inp-1],QLS)
			if(exit(temp))
				return
			else
				Listens[inp-1]=temp
		}
	}
}

function Spy_Status() {
	let data = db.get("env_listens_new")
	if (data != "") {
		let now = (new Date()).getTime()
		if (db.get("spy_locked") != "true")
			notify = "☆已完成所有任务☆\n"
		else
			notify = "★正在处理队列★\n"
		notify += "待执行 已完成 任务 冷却等待/秒 \n------------------------------\n"
		let Listens = JSON.parse(data)
		for (let i = 0; i < Listens.length; i++) {
			if (Listens[i].LastTime!=undefined) {//根据上次执行时间获取任务状态
				last = new Date(Listens[i].LastTime)
				let towait=Listens[i].Interval*60-Math.floor((now-last)/1000)
				if(towait<0)
					towait=0
				if (towait>0)
					notify+="★"
				else
					notify+="☆"
				notify+=fmt.sprintf("%-4v%-4v%-15v%4v\n",Listens[i].TODO.length,Listens[i].DONE.length,Listens[i].Name,towait)
			}
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
	if(!envs.length)//不监控
		return false
	// 	检查变量名是否为用户配置的需要转换的变量名，是则先转换
	let data = db.get("spy_envtrans_new")
	if (data) {
		let trans = JSON.parse(data)
		for (let i = 0; i < envs.length; i++) {
			for (let j = 0; j < trans.length; j++) {
				if (envs[i].name == trans[j].ori) {
					envs[i].name = trans[j].redi
					Notify(st.ToEasyCopy(s.getPlatform(),"变量转换：\n"+trans[j].name,"export " + envs[i].name + "=\"" + envs[i].value + "\""))
				}
			}
		}
	}
	if(!SPY)//不监控
		return false

	data=db.get("env_listens_new")
	if(!data){
		Notify("无监控任务，请先添加或者导入监控任务")
		return true
	}
	//分析变量是否为监控变量，是否为重复线报，变量对应监控任务是否禁用，以及加入任务队列后是否执行
	let notify = ""
	let flag=false	//是否有任务加入队列
	let unlock = true//是否解锁处理任务队列
	let now = (new Date()).getTime()
	let Listens = JSON.parse(data)
	envs.forEach(env=>{
		for (let i = 0; i < Listens.length; i++) {
			if (!Listens[i]["TODO"])
				Listens[i]["TODO"] = []
			if (!Listens[i]["DONE"])
				Listens[i]["DONE"] = []
			//根据上次任务执行时间,分析处理队列过程中是否不正常退出导致队列没能处理完并开锁
			if (Listens[i].LastTime) {
				let last = (new Date(Listens[i].LastTime)).getTime()
				if (Listens[i].Interval) {
					if (now - last < Listens[i].Interval * 60 * 1000)
						unlock = false
				}
				else if (now - last < 3 * 60 * 1000)
					unlock = false
			}
			if(Listens[i].Envs.find(value=>value==env.name)){	//该变量属于监控任务listen[i]的监控变量
				notify+="\n【触发任务"+(i+1)+"】:" + Listens[i].Name+ "\n"
				if (Listens[i].Disable&&!s.isAdmin()){
					notify+="【监控结果】:禁用任务，忽略\n"
					return
				}
				else if(!Listens[i].Clients.length){
					notify+="【监控结果】:无指定容器，忽略\n"
					return
				}
				else if(!Listens[i].Clients.every((value)=>
						QLS.findIndex(QL=>QL.client_id==value)!=-1)){
					notify += "【监控结果】:存在错误容器，忽略"
					return
				}
				//console.log(JSON.stringify(envs[j])+"\n\n"+JSON.stringify(Listens[i].DONE))
				else if (IsIn(env, Listens[i].TODO) || IsIn(env, Listens[i].DONE)) {
					if(env.length>1)
						notify+="【监控结果】:重复变量" + envs[j].value + "，忽略\n"
					else
						notify+="【监控结果】:重复变量，忽略\n"
					return
				}
				else{	//将变量env加入任务Listen[i]的任务队列
					flag=true
					notify+="【监控结果】:加入队列\n"
					if(Listens[i].TODO.length){
						//队列第一个任务已存在相同变量名，直接将变量加入队列，否则可能该监控任务可能需多变量，将变量加入前一个任务
						if(Listens[i].TODO[0].find(todo=>todo.name==env.name))	
							Listens[i].TODO.unshift([env])
						else
							Listens[i].TODO[0].unshift(env)
					}
					else
						Listens[i].TODO.unshift([env])
				}
			}
						
		}
	})
	// Listens.forEach(listen=>{
	// 	if(listen.TODO.length)
	// 		console.log(listen.Name+"\n"+ JSON.stringify(listen.TODO))
	// })
	if(notify)
		Notify(notify)
	else{
		Notify("未监控该变量，已忽略")
		return false
	}
	if (flag){
		db.set("env_listens_new", JSON.stringify(Listens))
		if(db.get("spy_locked") == "false"||unlock) {
			db.set("spy_locked", true)
			Que_Manager(QLS)
			return true
		}
	}
	return true
}

function JDCODE_Decode(JDCODE) {
	if(JDCodeBlackList.find(keyword=>s.getContent().indexOf(keyword)!=-1)&&!s.isAdmin()){
		console.log("黑名单口令，不解析")
		return
	}
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
	//console.log(JSON.stringify(info))
	Notify(st.ToHyperLink(s.getPlatform(),info.jumpUrl,info.title))//口令解析结果通知，不需要自行注释
	Urls_Decode([info.jumpUrl])
}

function Urls_Decode(urls) {
	//console.log(urls)
	let notify = ""
	let envs = []//记录urls中提取的变量
	for (let i = 0; i < urls.length; i++) {
		let spy = []	//解析结果
		let by=0	//解析方式
		//let tip=""
		//使用自定义解析规则尝试解析
		let data = db.get("spy_urldecode_new")
		if (data) {
			let urldecodes = JSON.parse(data)
			spy = DecodeUrl(urls[i], urldecodes)
		}
		if(spy.length)
			by=1
		else{//未能根据自定义解析规则解析出变量，使用内置解析规则
			spy = DecodeUrl(urls[i], UrlDecodeRule)
			if(spy.length){
				by=2
			}
		}
		spy.forEach(ele=>{
			let temp=""
			if(!ele.name ||ele.name=="0"){	//未设置解析变量名时，仅输出活动名与变量值
				temp=ele.value
				notify+=st.ToEasyCopy(s.getPlatform(),ele.act,temp)+"\n"
			}
			else{
				temp="export " + ele.name + "=\"" + ele.value + "\""
				notify+=st.ToEasyCopy(s.getPlatform(),ele.act,temp)+"\n"
				envs.push({name:ele.name,value:ele.value})
			}
		})
		if(by==0)
			notify += "未解析到变量\n"
		else if(by==1)
			notify+="--by自定义规则\n\n"
		else if(by==2)
			notify+="--by内置规则\n\n"
	}
	//console.log(JSON.stringify(envs))
	if (envs.length ||s.isAdmin()){
		Env_Listen(envs)
		Notify(notify)	//链接解析结果通知，不需要自行注释
	}
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
		let temp = ClearHistory(spys.slice(n, n + num))
		//console.log(n+num)
		if (s.reply("ImportWhiteEye=" + JSON.stringify(temp))==""){
			s.reply("导出数量过多，导出失败,请重新导出并减少单次导出项数")
			return
		}
		n+=num
	}
	if (n < spys.length)//导出末尾未截取到的部分
		s.reply("ImportWhiteEye=" + JSON.stringify(ClearHistory(spys.slice(n))))
}

function Import_Spy(data) {//console.log(data)
	let notify = ""
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
	console.log("进入队列处理进程")
	let limit = 100//死循环保险，防止陷入死循环
	//处理队列任务
	while (true) {
		let now = (new Date()).getTime()
		if (--limit < 0) {
			Notify("『白眼』\n可能死循环了，自动退出")
			Spy_Clear()
			break
		}

		let Listens = JSON.parse(db.get("env_listens_new"))
		for (i = 0; i < QLS.length; i++) {
			QLS[i]["envs"] = []	//容器配置文件需要修改的变量
			QLS[i]["keywords"] = []	//容器需要执行的任务的关键词
		}

		//记录各个容器中需要修改的变量与需要执行的任务关键词*/
		QLS.forEach((QL,i)=>{
			if(QL.disable)
				return
			Listens.forEach(listen=>{
				if(listen.Clients.indexOf(QL.client_id)!=-1){
					//console.log(listen.Name+"\n"+JSON.stringify(listen.TODO)+"\n加入容器:"+QL.name)
					if(listen.TODO.length && listen.TODO[0].length){
						listen.TODO[0].forEach(env=>QLS[i].envs.push(env))
						QLS[i].keywords.push(listen.Keyword)
					}
				}
			})
		})
		//对各个容器执行任务
		let notify = ""
		let t=1
		let update=false
		let record=[]	//记录处于冷却状态等待下一次执行的任务
		for (let i = 0; i < QLS.length; i++) {
			console.log("青龙执行\n"+JSON.stringify(QLS[i].envs)+"\n\n"+QLS[i].keywords)
			if (!QLS[i].token) {
				notify += "【执行结果】:失败" 
				notify += "【故障原因】:"+QLS[i].name + "token获取失败\n"
				continue
			}
			else if (!ql.Modify_QL_Config(QLS[i].host, QLS[i].token, QLS[i].envs)) {
				notify += "【执行结果】:失败" 
				notify += "【故障原因】:"+QLS[i].name + "配置文件变量修改失败\n"
				continue
			}
			let crons = ql.Get_QL_Crons(QLS[i].host, QLS[i].token)
			if (!crons ) {					
				notify += "【执行结果】:失败" 
				notify += "【故障原因】:"+QLS[i].name + "获取青龙任务失败\n"
				continue
			}
			//在各个容器找到需要执行的任务并执行
			let todo=[]//记录将要执行的青龙任务
			for(let j=0;j<QLS[i].keywords.length;j++){
				let cron=crons.find(cron=>cron.name.indexOf(QLS[i].keywords[j])!=-1||cron.command.indexOf(QLS[i].keywords[j])!=-1)
				if(cron){//找到需要执行的青龙任务
					if(!cron.pid)
						todo.push(cron)
					else{//任务正在执行，即上次任务尚未执行完,分析是否需要强制停止前一个任务并开始下一个任务
						let index=Listens.findIndex((value=>value.Keyword==QLS[i].keywords[j]))
						if(now-(new Date(Listens[index].LastTime)).getTime()>Listens[index].Interval*60*1000){//超过监控任务设置的执行时间间隔，强制停止并执行下一个任务
							console.log("【"+cron.name+"】超时,进程id:"+cron["pid"]+"终止并执行下一个")
							notify+="tip:"+cron.name+"执行超时，强制开启下一个任务\n"
							todo.push(cron)
							if(!ql.Stop_QL_Crons(QLS[i].host, QLS[i].token, [cron.id?cron.id:cron._id]))
								notify+="停止失败，未知原因\n"
						}
						else{
							console.log("【"+Listens[index].Name+"等待任务冷却")
							if(record.indexOf(QLS[i].keywords[j])==-1)
								record.push(QLS[i].keywords[j])
						}
						// if(Listens[index].Interval<t)
						// 	t=Listens[index].Interval
					}
				}
				else{
					notify += "【执行结果】:【"+QLS[i].name + "】未找到任务" +QLS[i].keywords[j]+"\n" 
					notify += "【故障原因】:监控任务配置有误,或者未支持该青龙版本\n"
				}
			}
			//console.log("待冷却任务：\n"+JSON.stringify(record))
			if(!todo.length){
				//console.log("本次轮询无需要执行的任务")
				continue
			}
			let ids=todo.map(value=>{
				if(value.id)
					return value.id
				else
					return value._id
			})
			let names=todo.map(value=>value.name)
			if (ql.Start_QL_Crons(QLS[i].host, QLS[i].token, ids)) { //记录队列中成功执行的任务
//			if(true){ 
				notify += "【执行结果】:【"+QLS[i].name + "】成功执行"+JSON.stringify(names)+"\n"  
			}
			else{
				notify += "【执行结果】:【"+QLS[i].name + "】"+JSON.stringify(names)+"执行失败\n" 
			}
		}
		let done=true
		for(let i=0;i<Listens.length;i++){
			if(Listens[i].TODO.length && record.indexOf(Listens[i].Keyword)==-1){
				update=true
				//console.log("【"+Listens[i].Name+"】队列:\n"+JSON.stringify(Listens[i].TODO))
				Listens[i].LastTime=now
				Listens[i].DONE.push(Listens[i].TODO[0])
				if(Listens[i].DONE.length>50)
					Listens[i].DONE.splice(29,20)
				Listens[i].TODO.shift()
			}
			if(Listens[i].TODO.length)
				done=false
		}
		if(update)
			db.set("env_listens_new", JSON.stringify(Listens))
		if(notify)
			Notify(notify)

		if(done){
			db.set("spy_locked", false)	//开锁
			console.log("已处理完所有队列")
			break
		}
		// else {
		// 	db.set("spy_locked", true)//防止不正常开锁		
		// }

		//console.log((limit+1)+"循环,等待(分):"+t)
		sleep(t*60*1000)
	}
}

//根据配置urldecodes尝试解析url
function DecodeUrl(url, rules) {
	//console.log(url+"\n"+url.length)
	let spy = []//解析结果：[{name:监控变量名,value:监控变量值,act:备注名}]
	for (let i = 0; i < rules.length; i++) {
		if (url.match(rules[i].keyword)) {
			if(rules[i].admin && !s.isAdmin()){
				console.log("规则【"+rules[i].name+"】仅管理员可用")
				continue
			}
			for (let j = 0; j < rules[i].trans.length; j++) {
				let temp = {
					act: rules[i].name,
					name: rules[i].trans[j].redi
				}
				// if(rules[i].admin)
				// 	temp.act+="(仅管理员可用)"
				if (rules[i].trans[j].ori == -1) {//使用整段url作为变量
					temp["value"] = url
				}
				else if(rules[i].trans[j].ori.indexOf(" ") !=-1){//提取多参数作为变量值
					let pn=rules[i].trans[j].ori.split(" ")
					let pv=[]
					pn.forEach(ele=>{
						if(!ele)
							return
						let reg=new RegExp("(?<="+ele+"(=|%3D))[^&%]+")
						let actid=url.match(reg)
						if(actid)
							pv.push(actid[0])
						else
							console.log(url+"\n中未找到活动参数:"+ele)
					})
					if(!pv.length)//未找到参数
						break
					if(rules[i].trans[j].sep)
						temp["value"]=pv.join(rules[i].trans[j].sep)
					else
						console.log("内置解析规则"+JSON.stringify(rules[i])+"缺少分割符")
				} 
				else {//提取参数作为变量
					let reg = new RegExp("(?<=" + rules[i].trans[j].ori + "(=|%3D))[^&%]+")
					let actid = url.match(reg)
					if (actid) {
						temp["value"] = actid[0]
					}
					else{
						console.log(url+"\n中未找到活动参数:"+rules[i].trans[j].ori)
						break
					}
				}
				spy.push(temp)
			}
		}
	}
	return spy
}

//导入监控数据
function Add_Spy(oldspy, newspy) {
	let start = oldspy.length//保存导入结果数据中新添项开始的位置
	for (let i = 0; i < newspy.length; i++) {//导入监控配置与现存某项监控的变量相同则不导入此项监控配置
		let find=function () {
			for (let j = 0; j < oldspy.length; j++) {
				for (k = 0; k < oldspy[j].Envs.length; k++) {
					for (m = 0; m < newspy[i].Envs.length; m++) {
						if (newspy[i].Envs[m] == oldspy[j].Envs[k]) {
							//console.log(newspy[i].Name + "的" + newspy[i].Envs[m] + "变量已存在于监控中，不导入\n")
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
						if (QLS[i].client_id == newspy[i].Clients[j])
							return true
					return false
				}()
				if(noclient){
					//console.log(`删除${newspy[i].Name}：${newspy[i].Clients[j]}`)
					newspy[i].Clients.splice(j, 1)
				}
			}
			if(newspy[i].Clients.length==0){//导入的任务无有效容器，将非禁用容器作为默认容器
				for(j=0;j<QLS.length;j++)
					if(!QLS[j].disable)
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
function Notify(msg) {
	if (db.get("spy_silent_new") != "true" || s.isAdmin()) {
		if (s.getPlatform() != "tg")
			s.reply(msg)
		else {
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
	else {//静默推送
		let temp="--------------------\n"
		let gname=JSON.parse(db.get("spy_targets_new")).find(target=>target.id==s.getChatId()).name	//线报来源备注名
		if((s.getPlatform()=="tg" || s.getPlatform()=="pgm") && s.getContent().match(/`[\s\S]*`/)){
			temp+="【线报】"+s.getContent()+"\n\n"
		}
		else{
			console.log("markupdown线报")
			temp+=st.ToEasyCopy(s.getPlatform(),"线报",s.getContent())+"\n\n"
		}
		temp+="【来源】"+gname+"("+s.getPlatform().toUpperCase()+")\n"
		let from=temp+"--------------------\n\n"
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

//检查消息源是否监控目标
function IsTarget() {
	try {
		let uid = s.getUserId(),cid = s.getChatId()
		if(BlackList.indexOf(uid)!=-1)
			return false
		let tgbot_token=(new Bucket("tg")).get("token")
		let tgbotid=tgbot_token?tgbot_token.split(":")[0]:0	//不监控来自机器人的消息,防止tg人形与机器人互相解析
		let data=db.get("spy_targets_new")
		let targets = data?JSON.parse(data):[]
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

//打印主菜单
function Menu(Listens, silent, targets) {
	let notify = "----------------------\n请选择编辑对象\n----------------------\n"
	for (let i = 0; i < Listens.length; i++) {
		let name = Listens[i]["Name"]
		if (name == undefined)
			name = Listens[i]["name"]//之前数据存储写错单词
		if (Listens[i].Disable)
			notify += (i + 1) + "、" + name + "-[禁用]\n"
		else
			notify += (i + 1) + "、" + name + "\n"
	}

	if (silent != "true")
		notify += "a、开启静默\n"
	else
		notify += "a、关闭静默\n"
	notify += "b、变量转换\n"
	notify += "c、链接解析\n"
	notify += "d、监听目标:"
	for (let i = 0; i < targets.length; i++) {
		if (targets[i].name)
			notify += "【" + targets[i].name + "】"
		else
			notify += "【" + targets[i].id + "】"
	}
	notify+="\n--------------------------------\n"
	notify+="[-删除][0增加][wq保存][q退出]"
	s.reply(notify)
}

//主菜单-监听目标管理
function SpyTargets(targets) {
	let limit = LIMIT
	let inp = 1
	while (true) {
		if (limit-- < 0) {	//s.reply("由于您长时间未操作，已自动退出，数据未保存")
			return false
		}
		if (inp){
			let notify = "请选择监听目标进行编辑：\n"
			for (let i = 0; i < targets.length; i++) {
				notify += (i + 1) + "、"+ targets[i].name + ":"+targets[i].id + "\n"
			}
			notify+="------------------------\n"
			notify+="[-删除][0增加][u返回][wq保存][q退出]"
			s.reply(notify)
		}
		inp=s.listen(WAIT)
		if(inp)
			inp = inp.getContent()
		if (inp == "u")
			return targets
		else if(inp=="q"||inp=="wq")
			return inp
		else if (inp < 0) {
			try {
				targets.splice(Math.abs(inp) - 1, 1)
			}
			catch (err) {
				s.reply("输入有误，请重新选择")
			}
		}
		else if (inp == "0") {
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

//主菜单-变量转换管理
function SpyTrans(trans) {
	let limit = LIMIT
	let inp = 1
	while (true) {
		if (limit-- < 0) {
			s.reply("由于您长时间未操作，已自动退出，数据未保存")
			return false
		}
		if (inp){
			let notify = "请选择添加或者删除变量转换规则：\n"
			notify+="(注:仅提供简单的变换功能,即变量a-->变量b)\n"
			for (let i = 0; i < trans.length; i++)
				notify += (i + 1) + "、" + trans[i].name + ":" + trans[i].ori + "-->" + trans[i].redi + "\n"
			notify+="------------------------\n"
			notify+="[-删除][0增加][u返回][wq保存][q退出]"
			s.reply(notify)
		}
		inp=s.listen(WAIT)
		if(inp)
			inp = inp.getContent()
		if (inp == "u")
			return trans
		else if(inp=="q"||inp=="wq")
			return inp
		else if (inp < 0) {
			try {
				trans.splice(Math.abs(inp) - 1, 1)
			}
			catch (err) {
				s.reply("输入有误，请重新选择")
			}
		}
		else if (inp == "0") {
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
				s.reply("已添加变量转换任务\n【" + tran.name + "】:" + tran.ori + "-->" + tran.redi )
			}
			catch(err){
				s.reply("输入超时，请重新添加转换任务")
			}
		}
	}
}

//主菜单-链接解析管理
function SpyUrlDecode(decodes) {
	let limit = LIMIT
	let inp = 1
	while (true) {
		if (limit-- < 0) {
			//s.reply("由于您长时间未操作，已自动退出，数据未保存")
			return false
		}
		if (inp){
			let notify = "请选择添加或者删除链接解析规则：\n"
			notify+="(注:当内置规则解析失败时可添加自定义规则,仅提供简单的自定义规则,完整规则请参考插件注释于内置规则中添加)\n"
			for (let i = 0; i < decodes.length; i++) {
				notify += (i + 1) + "、" + decodes[i].name
				if(decodes[i].admin)
					notify+="(仅管理员可用)" 
				notify += "\n" + decodes[i].keyword + " :\n"
				for (let j = 0; j < decodes[i].trans.length; j++)
					notify += decodes[i].trans[j].ori + "-->" + decodes[i].trans[j].redi + "\n"
			}
			notify+="------------------------\n"
			notify+="[-删除][0增加][u返回][wq保存][q退出]"
			s.reply(notify)	
		}
		inp=s.listen(WAIT)
		if(inp)
			inp = inp.getContent()
		if (inp == "u")
			return decodes
		else if(inp=="q"||inp=="wq")
			return inp
		else if (inp < 0) {
			try {
				urldecodes.splice(Math.abs(inp) - 1, 1)
			}
			catch (err) {
				s.reply("输入有误，请重新选择")
			}
		}
		else if (inp == "0") {
			let decode = {
				keyword: "",
				name: "",
				trans: [{
					ori: "",
					redi: ""
				}],
				admin:true
			}
			try{
				s.reply("请输入该解析任务的备注名称：")
				decode.name = s.listen(WAIT).getContent()
				s.reply("请输入您想解析链接的关键词(一般为截取链接最前面一段,例如:http://xxx.com/yyyy/zzzz?a==123... 中的http://xxx.com/yyyy/ )")
				decode.keyword = s.listen(WAIT).getContent()
				s.reply("请输入您想提取的该类型链接中的参数名（例如:http://...../?actid=xxx 中的actid,若使用整段链接作为变量请输入-1)")
				decode.trans[0].ori = s.listen(WAIT).getContent()
				s.reply("请输入使用该参数值作为变量值的变量名(若仅需提取参数无需变量,请输入0)：")
				decode.trans[0].redi = s.listen(WAIT).getContent()
				s.reply("请选择该解析规则是否仅管理员可用，输入“是”或“否”")
				decode.admin=s.listen(WAIT).getContent()=="是"?true:false
				urldecodes.push(decode)
				s.reply("已添加" + decode.name + "(" + decode.keyword + " ):" + decode.trans[0].ori + "-->" + decode.trans[0].redi )					
			}
			catch(err){
				s.reply("输入超时，请重新添加解析任务")
			}
		}
	}

}

//主菜单-监控任务管理
function SpyItem(spy, QLS) {
	let inp = 1
	let limit = LIMIT
	while (true) {
		if (limit-- < 0) {
			//s.reply("由于您长时间未操作，已自动退出，数据未保存")
			return false
		}
		if (inp){
			let notify = "请选择要编辑的属性:\n"
			notify += "1、监视任务名称：" + spy.Name + "\n"
			notify += "2、脚本关键词：" + spy.Keyword + "\n"
			notify += "3、洞察变量：" + spy.Envs.toString() + "\n"
			notify += "4、指定容器："
			for (let i = 0; i < spy.Clients.length; i++) {
				let ql=QLS.find(ql=>ql.client_id==spy.Clients[i])
				if(ql)
					notify += "【" + ql.name + "】"
				else
					notify += "[" + spy.Clients[i] + "]"
			}
			notify += "\n"
			if (spy.Disable)
				notify += "5、关闭禁用\n"
			else
				notify += "5、开启禁用\n"
			notify += "6、青龙任务限制时长：" + spy.Interval + "分钟\n"
			notify+="------------------------\n"
			notify+="[u返回][wq保存][q退出]"
			s.reply(notify)
		}	
		inp=s.listen(WAIT)
		if(inp)
			inp = inp.getContent()
		if (inp == "u")
			return spy
		else if(inp=="q"||inp=="wq")
			return inp
		else if (inp == 1) {
			s.reply("请输入监控任务名称：")
			let temp= s.listen(WAIT)
			if(temp)
				spy.Name = temp.getContent()
			else{
				s.reply("输入超时")
				continue
			}
		}
		else if (inp == 2) {
			s.reply("请输入脚本关键词：")
			let temp= s.listen(WAIT)
			if(temp)
				spy.Keyword = temp.getContent()
			else{
				s.reply("输入超时")
				continue
			}
		}
		else if (inp == 3) {//修改洞察变量
			let temp=SpyEnvs(spy.Envs)
			if(temp===false)
				return false
			else
				spy.Envs=temp
		}
		else if (inp == 4) {//修改作用容器
			let temp=SpyClients(QLS,spy.Clients)
			if(temp===false)
				return false
			else
				spy.Clients=temp		
		}
		else if (inp == 5) {
			spy.Disable = !spy.Disable
		}
		else if (inp == 6) {
			s.reply("请输入运行限制时间(分钟):")
			let temp=s.listen(WAIT)
			if(temp)
				spy.Interval = temp.getContent()
			else
				s.reply("已超时，请重新修改")
		}
	}
}



//主菜单-监控任务-监控容器管理
function SpyClients(QLS, clients) {
	let inp = 1
	let limit = LIMIT
	while (true) {
		if (limit-- < 0) {
			//s.reply("由于您长时间未操作，已自动退出，数据未保存")
			return false
		}
		if (inp){
			let notify = "请选择指定容器进行编辑：\n"
			for (let i = 0; i < clients.length; i++) {
				let QL=QLS.find(QL=>QL.client_id==clients[i])
				if (!QL)
					notify += (i + 1) + "、未对接容器【" + clients[i] + "】\n"
				else
					notify += (i + 1) + "、" + QL.name + "\n"
			}
			notify+="------------------------\n"
			notify+="[-删除][0增加][u返回]"
			s.reply(notify)
		}
		inp=s.listen(WAIT)
		if(inp)
			inp = inp.getContent()
		if (inp == "u")
			return clients
		else if (inp == "0") {
			let tip = "请选择添加的青龙容器:\n"
			for (let i = 0; i < QLS.length; i++)
				tip += (i + 1) + "、" + QLS[i].name + "\n"
			s.reply(tip)
			try {
				clients.push(QLS[s.listen(WAIT).getContent() - 1].client_id)
			}
			catch (err) {
				s.reply("输入有误，请重新选择")
			}
		}
		else if (inp < 0) {
			try {
				clients.splice(Math.abs(inp) - 1, 1)
			}
			catch (err) {
				s.reply("输入有误，请重新选择")
			}
		}
	}
}

//主菜单-监控任务-洞察变量管理
function SpyEnvs(envs) {
	let inp = 1
	let limit = LIMIT
	while (true) {
		if (limit-- < 0) {
			//s.reply("您已经长时间未操作，已自动退出，数据未保存")
			return false
		}
		if (inp){
			let notify = "请选择洞察变量进行编辑：\n"
			for (let i = 0; i < envs.length; i++)
				notify += (i + 1) + "、" + envs[i] + "\n"
			notify+="------------------------\n"
			notify+="[-删除][0增加][u返回]"
			s.reply(notify)
		}
		inp=s.listen(WAIT)
		if(inp)
			inp = inp.getContent()				
		if (inp == "u")
			return envs
		else if (inp == "0") {
			s.reply("请输入新添加的洞察变量：")
			try{
				envs.push(s.listen(WAIT).getContent())
			}
			catch(err){
				s.reply("输入超时")
			}
		}
		else if (inp < 0) {
			try {
				envs.splice(Math.abs(inp) - 1, 1)
			}
			catch (err) {
				s.reply("输入有误，请重新输入")
			}
		}
	}		
}



/****************内置解析链接规则****************** */
//非activityId在最后
var UrlDecodeRule =[
		{//测试规则
			keyword:"https://lzkj-isv.isvjcloud.com/app",
			trans:[
				{
					ori:"a b",
					redi:"0",
					sep:"_"
				},
				{
					ori:"c",
					redi:"C"
				}
			],
//			admin:true,
			name:"测试规则"
		},
		/******************KR库********************** */
		{
			keyword: /cjhy(dz)?-isv\.isvjcloud\.com\/wxTeam\/activity/,
			name: "CJ组队瓜分",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_activityId"
			}]
		},

		{
			keyword: /lzkj(dz)?-isv\.isvj(clou)?d.com\/wxTeam\/activity/,
			name: "LZ组队瓜分",
			trans: [{
				ori: "activityId",
				redi: "jd_zdjr_activityId"
			}]
		},

		{
			keyword: /cjhy(dz)?-isv\.isvjcloud\.com\/microDz\/invite\/activity/,
			name: "CJ微定制",
			trans: [{
				ori: "activityId",
				redi: "jd_wdz_activityId"
			}]
		},

		{
			keyword: /cjhy(dz)?-isv\.isvjcloud\.com\/microDz\/invite\/openLuckBag/,
			name: "CJ微定制福袋",
			trans: [{
				ori: "activityId",
				redi: "jd_wdzfd_activityId"
			}]
		},
	
		{
			keyword: /lzkj(dz)?-isv\.isvjcloud.com\/wxCollectCard/,
			name: "LZ集卡抽奖",
			trans: [{
				ori: "activityId",
				redi: "jd_wxCollectCard_activityId"//kr
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
			keyword: /wxDrawActivity|lzclient/,
			name: "幸运抽奖",
			trans: [{
				ori: "-1",
				redi: "LUCK_DRAW_URL"//kr
			}]
		},
		{
			keyword: /lzkj(dz)?-isv\.isvj(clou)?d.com\/wxgame/,
			name: "LZ店铺游戏",
			trans: [{
				ori: "activityId",
				redi: "jd_wxgame_activityId"//kr
			}]
		},
		{
			keyword: /lzkj(dz)?-isv\.isvj(clou)?d\.com\/wxSecond/,
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
			keyword: "wxShopFollowActivity",
			name: "店铺关注有礼",
			trans: [{
				ori: "-1",
				redi: "jd_wxShopFollowActivity_activityUrl"
			}]
		},
		

		{
			keyword: /https:\/\/lzkj-isv.isvj(clou)?d.com\/drawCenter/,
			name: "LZ刮刮乐",
			trans: [{
				ori: "activityId",
				redi: "jd_drawCenter_activityId"
			}]
		},

		{
			keyword: /lzkjdz-isv.isvj(clou)?d.com\/wxFansInterActionActivity/,
			name: "LZ粉丝互动",
			trans: [{
				ori: "activityId",
				redi: "jd_wxFansInterActionActivity_activityId"
			}]
		},


		{
			keyword: /lzkj(dz)?-isv.isvj(clou)?d.com\/wxShareActivity/,
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
			name: "CJ超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "CJHY_SIGN"
			}]
		},
		{
			keyword: /cjhy-isv.isvj(clou)?d.com\/sign\/sevenDay\/signActivity/,
			name: "CJ超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "CJHY_SEVENDAY"
			}]
		},
		{
			keyword: /lzkj-isv.isvj(clou)?d.com\/sign\/signActivity/,
			name: "LZ超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "LZKJ_SIGN"
			}]
		},
		{
			keyword: /lzkj-isv.isvj(clou)?d.com\/sign\/sevenDay/,
			name: "LZ超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "LZKJ_SEVENDAY"
			}]
		},

		{
			keyword: /lzkjdz-isv.isvj(clou)?d.com\/wxUnPackingActivity/,
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
			keyword: /https:\/\/lzkj-isv.isvj(clou)?d.com\/wxBuildActivity/,
			name: "LZ盖楼有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_wxBuildActivity_activityId"//kr
			}]
		},

		{
			keyword: /wxKnowledgeActivity/,
			name: "知识超人",
			trans: [{
				ori: "-1",
				redi: "jd_wxKnowledgeActivity_activityUrl"//KR
			}]
		},

		{
			keyword: "https://cjhy-isv.isvjcloud.com/wxKnowledgeActivity/activity",
			name: "CJ知识超人",
			trans: [{
				ori: "activityId",
				redi: "jd_cjwxKnowledgeActivity_activityId"//kr
			}]
		},
		{
			keyword: "https://cjhy-isv.isvjcloud.com/activity/daily/",
			name: "cjhy每日抢",
			trans: [{
				ori: "activityId",
				redi: "jd_cjdaily_activityId"
			}]
		},

		{
			keyword: /(lzkj-isv.isvj(clou)?d.com\/wxShopGift)|(cjhy-isv\.isvjcloud\.com\/wxShopGift)/,
			name: "特效店铺有礼",
			trans: [{
				ori: "-1",
				redi: "jd_wxShopGift_activityUrl"//kr
			}]
		},

		{
			keyword: "https://txzj-isv.isvjcloud.com/cart_item",
			name: "收藏大师-加购有礼",
			trans: [{
				ori: "-1",
				redi: "jd_cart_item_activityUrl"//kr
			}]
		},
		{
			keyword: "https://txzj-isv.isvjcloud.com/collect_item",
			name: "收藏大师-关注有礼",
			trans: [{
				ori: "-1",
				redi: "jd_collect_item_activityUrl"//kr
			}]
		},
		{
			keyword: "https://txzj-isv.isvjcloud.com/collect_shop",
			name: "收藏大师-关注商品",
			trans: [{
				ori: "-1",
				redi: "jd_collect_shop_activityUrl"//kr
			}]
		},
		{
			keyword: "https://txzj-isv.isvjcloud.com/lottery",
			name: "收藏大师-幸运抽奖",
			trans: [{
				ori: "-1",
				redi: "jd_lottery_activityUrl"//kr
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
			keyword: /pro(dev)?\.m\.jd\.com\/mall\/active\/dVF7gQUVKyUcuSsVhuya5d2XD4F/,
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

		{
			keyword: /jinggeng-isv\.isvj(clou)?d\.com\/ql\/front\/showInviteJoin/,
			name: "邀请入会赢好礼 · 京耕",
			trans: [{
				ori: "-1",
				redi: "jd_showInviteJoin_activityUrl"//kr
			}]
		},
		{
			keyword: /(lzkj(dz)?-isv\.isvj(clou)?d\.com\/prod\/cc\/interactsaas\/index\?activityType=(10006|10070))|(lorealjdcampaign-rc\.isvjcloud.com\/interact\/index\?activityType=10006)/,
			name: "邀请入会有礼（lzkj_loreal）",
			trans: [{
				ori: "-1",
				redi: "jd_lzkj_loreal_invite_url"//kr
			}]
		},
		{
			keyword: /shop\.m\.jd.com\/shop\/lottery/,
			name: "店铺刮刮乐",
			trans: [{
				ori: "-1",
				redi: "jd_shopDraw_activityUrl"//kr
			}]
		},


	
	/*******************环境保护库********************** */	
		{
			keyword: /https:\/\/lzkj-isv\.isvj(clou)?d\.com\/wxShopFollowActivity/,
			name: "LZ店铺关注抽奖",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_wxShopFollowActivity_activityId"
			}]
		},
		{
			keyword: "https://cjhy-isv.isvjcloud.com/wxShopFollowActivity/activity",
			name: "CJ店铺关注抽奖",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_wxShopFollowActivity_activityId"
			}]
		},

		{
			keyword: "https://cjhydz-isv.isvjcloud.com/microDz/invite/openLuckBag",
			name: "CJ微定制福袋",
			trans: [{
				ori: "activityId",
				redi: "jd_wdz_openLuckBag_activityId"
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
			keyword: /https:\/\/lzkj-isv\.isvj(cloud)?\.com\/lzclient/,
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
			keyword: /lzkj-isv\.isvj(clou)?d\.com\/wxGameActivity/,
			name: "LZ游戏活动",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_wxGameActivity_activityId"//环保
			}]
		},
		{
			keyword: /lzkj-isv\.isvj(clou)?d.com\/wxgame/,
			name: "LZ游戏活动",
			trans: [{
				ori: "activityId",
				redi: "WXGAME_ACT_ID"//环保
			}]
		},
		{
			keyword: "https://cjhy-isv.isvjcloud.com/wxGameActivity/activity",
			name: "CJ游戏活动",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_wxGameActivity_activityId"//环保
			}]
		},	
		{
			keyword: "https://lzkj-isv.isvjcloud.com/wxKnowledgeActivity/activity",
			name: "LZ知识超人",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_wxKnowledgeActivity_activityId"//环保
			}]
		},
		{
			keyword: "https://cjhy-isv.isvjcloud.com/wxKnowledgeActivity/activity",
			name: "CJ知识超人",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_wxKnowledgeActivity_activityId"//环保
			}]
		},

		{
			keyword: "https://txzj-isv.isvjcloud.com/cart_item",
			name: "txzj加购有礼",
			trans: [{
				ori: "a",
				redi: "jd_txzj_cart_item_id"
			}]
		},
		{
			keyword: "https://txzj-isv.isvjcloud.com/collect_item",
			name: "txzj关注有礼",
			trans: [{
				ori: "a",
				redi: "jd_txzj_collect_item_id"
			}]
		},
		{
			keyword: "https://txzj-isv.isvjcloud.com/sign_in",
			name: "txzj签到",
			trans: [{
				ori: "a",
				redi: "jd_txzj_sign_in_id"
			}]
		},
		{
			keyword: "https://txzj-isv.isvjcloud.com/lottery",
			name: "txzj抽奖",
			trans: [{
				ori: "a",
				redi: "jd_txzj_lottery_id"
			}]
		},

		{
			keyword: "https://cjhy-isv.isvjcloud.com/activity/daily/",
			name: "cjhy每日抢",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_daily_ids"
			}]
		},
		{
			keyword: "https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/activity",
			name: "CJ生日礼包和会员等级礼包",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_wxMcLevelAndBirthGifts_ids"
			}]
		},
		{
			keyword: "https://cjhy-isv.isvjcloud.com/sign/signActivity",
			name: "CJ超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_signActivity_ids"
			}]
		},
		{
			keyword: /https:\/\/cjhy-isv.isvj(clou)?d.com\/sign\/sevenDay\/signActivity/,
			name: "CJ超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_sevenDay_ids"
			}]
		},
		{
			keyword: /https:\/\/lzkj-isv.isvj(clou)?d.com\/sign\/signActivity/,
			name: "LZ超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_signActivity2_ids"
			}]
		},
		{
			keyword: /https:\/\/lzkj-isv.isvj(clou)?d.com\/sign\/sevenDay/,
			name: "LZ超级店铺无线签到",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_sevenDay_ids"
			}]
		},
		{
			keyword: /lzkj-isv.isvj(clou)?d.com\/wxBuildActivity/,
			name: "LZ盖楼有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_wxBuildActivity_activityId"
			}]
		},
		{
			keyword: /lzkj-isv\.isvj(clou)?d.com\/wxShopGift/,
			name: "lzkj店铺礼包",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_wxShopGift_ids"
			}]
		},
		{
			keyword: /cjhy-isv\.isvjcloud\.com\/wxShopGift/,
			name: "cjhy店铺礼包",
			trans: [{
				ori: "activityId",
				redi: "jd_cjhy_wxShopGift_ids"
			}]
		},
		{
			keyword: /lorealjdcampaign-rc\.isvjcloud\.com\/interact\/index\?activityType=10006/,
			name: "loreal邀请入会有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_loreal_interact_yqrhyl_activityId"
			}]
		},
		{
			keyword: /lzkj(dz)?-isv\.isvj(clou)?d\.com\/prod\/cc\/interactsaas\/index\?activityType=10006/,
			name: "邀请入会有礼",
			trans: [{
				ori: "activityId",
				redi: "jd_lzkj_interactsaas_yqrhyl_activityId"
			}]
		},



	/*******************wall库********************* */
	/*	{
			keyword: "wxCollectionActivity/activity",
			name: "M加购有礼",
			trans: [{
				ori: "-1",
				redi: "M_WX_ADD_CART_URL"//wall
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
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxSecond",
			name: "M读秒手速",
			trans: [{
				ori: "-1",
				redi: "M_WX_SECOND_DRAW_URL"
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
			name: "M老虎机抽奖",
			trans: [{
				ori: "-1",
				redi: "M_WX_CENTER_DRAW_URL"
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
			keyword: "https://lzkjdz-isv.isvjcloud.com/wxCollectCard",
			name: "M集卡抽奖",
			trans: [{
				ori: -1,
				redi: "M_WX_COLLECT_CARD_URL"//wall
			}]
		}*/
]


main()
