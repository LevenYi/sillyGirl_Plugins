/*
* @author https://t.me/sillyGirl_Plugin
* @create_at 2022-09-07 18:34:55
* @description 例：修改命令 $ql cron run ? $运行 ?
* @title 命令重定向
* @platform qq wx tg pgm sxg
* @rule raw 修改命令 \$[^\$]+\$[^\$]+
* @rule 查看命令
* @rule 删除命令 ?
* @rule raw [\s\S]+
 * @public false
* @admin false
* @version v2.2.0
*/

//修改命令样例：修改命令 $ql cron run ? $运行 ?

//2022-6-25 v1.0 命令重定向，命令自定义
//2022-6-26 v1.1 修复导致非管理员无法正常使用其他傻妞命令的bug，为查看命令添加删除功能
//2022-6-26 v1.1.1 修复部分命令重定向失败的问题
//2022-6-26 v1.1.2 修复安装本插件后未设置重定向命令，导致无法使用其他命令的bug
//2022-6-29 v2.0 新增支持带参数命令的重定向
//2022-6-30 v2.0.1 修复设置带参数命令的可变参数与固定参数重定向时相互覆盖的bug
//2022-7-14 v2.0.2 修复部分重定向命令误触发的问题
//2022-7-29 v2.1.0	添加支持交互式命令
//2022-8-11 v2.1.1 修改部分命令，并在查看菜单提供执行功能
//2022-8-14 v2.1.2 修复微信端无法使用的问题
//2022-8-30 v2.1.3 适配最新傻妞
//2022-9-4 v2.1.4 适配最新傻妞
//2022-9-22 v2.2.0 更换触发傻妞方式 
//2022-12-19 v2.2.1 适配最新傻妞

var data=[{
	ori:"",
	redi:""
}]

const s = sender
const sillyGirl=new SillyGirl()
const db= new Bucket("sillyGirl")

function main(){
	let uid=s.getUserId()
	if(!s.isAdmin()){
		s.continue() 
		return
	}
	let msg=s.getContent()
	if(msg.indexOf("修改命令")!=-1){
		let temp=msg.split("$")
		if(temp.length!=3){
			s.reply("设置重定向命令格式有误")
			return
		}
		command1=temp[1].trim()
		command2=temp[2].trim()
		s.reply(SetRedirect(command1,command2,data))
	}
	
	else if(msg=="查看命令"){
		GetAllRedirect()
	}
	
	else if(msg.indexOf("删除命令")!=-1)
		s.reply(DelRedirect(param(1)))
	
	else{
		let command=Redirect(msg)
		if(command){//命中，执行重定向
			// let tipid=s.reply("执行命令:"+command)
			// sleep(1500)
        	// s.recallMessage(tipid)
			s.setContent(command)
			console.log("重定向为："+command)
		}
		s.continue()
	}
	return
}


function Redirect(msg){
	let storage=db.get("redirect")
	if(storage=="")
		return false
	data=JSON.parse(storage)
	index=FindByRedirect(msg,data)
//	s.reply("匹配"+index)
	if(index!=-1){
		//重定向命令无参数，直接返回原命令
		if(data[index].redi.indexOf("?")==-1)
			return data[index].ori
		let original=""//原始命令
		//存在参数
		//提取参数：获取存储的重定向命令包含内容，将命令中所含重定向命令内容替换为#，并以#分项用以提取参数
		redi=data[index].redi.split("?")
		ori=data[index].ori.split("?")
		for(let i=0;i<redi.length;i++){
			if(redi[i]!="")
				msg=msg.replace(redi[i],"#")
		}
		let args=msg.split("#")
		//去除首尾空项，以获取真实参数
		if(args[0]=="")
			args.shift()
		if(args[args.length-1]=="")
			args.pop()
		if(args.length!=ori.length-1)
			s.reply("参数数量对不上")
		//将存储的原始命令与参数重组
		for(let i=0;i<args.length;i++)
			original=original+ori[i]+args[i]
		original=original+ori[ori.length-1]
		return original
	}
	return false
}

function SetRedirect(com1,com2,data){
	if(com1.indexOf("?")!=-1||com1.indexOf("？")!=-1){
		com1=com1.replace(/？/g,"?")//防呆，中文？替换
		com2=com2.replace(/？/g,"?")
		let temp1=com1.split("?")
		let temp2=com2.split("?")
		if(temp1.length!=temp2.length)
			return "重定向失败，参数数量不一致"
	}
	let notify=""
	let storage=db.get("redirect")
	if(storage==""){
		data[0].ori=com1
		data[0].redi=com2
		notify="已添加:\""+com1+"\"重定向为\""+com2+"\""
	}
	else{
		data=JSON.parse(storage)
		let index=FindByOriginal(com1,data)
		if(FindByRedirect(com2,data)!=-1){
			notify="命令\""+com2+"\""+"已被占用,请更换其他命令"
		}
		else if(index!=-1&&data[index].ori==com1){
			data[index].redi=com2
			notify="已更新:\""+com1+"\"重定向为\""+com2+"\""
		}
		else{
			data.push({ori:com1,redi:com2})
			notify="已添加:\""+com1+"\"重定向为\""+com2+"\""
		}
	}
	db.set("redirect",JSON.stringify(data))
	return notify
}

function FindByRedirect(com,data){
	for(let i=0;i<data.length;i++){
		if(data[i].redi==com)//無参数，直接命中
		   return i
		let arr=data[i].redi.split("?")
//		s.reply(data[i].redi+arr.length)
		let nomatch=0
		for(let j=0;j<arr.length;j++)
			if(com.indexOf(arr[j])==-1)
			   nomatch=1
		if(!nomatch&&arr.length!=1)
		    return i
	}
	return -1
}

function FindByOriginal(com,data){
	for(let i=0;i<data.length;i++){
		let find=1
		let arr=data[i].ori.split("?")
		for(let j=0;j<arr.length;j++)
			if(com.indexOf(arr[j])==-1)
				find=0
		if(find)
			return i
	}
	return -1
}

function GetAllRedirect(){
	let notify=""
	let storage=db.get("redirect")
	if(storage==""||storage=="[]"){
		s.reply("不存在重定向命令")
		return
	}
	let data=JSON.parse(storage)
		for(let i=0;i<data.length;i++)
			notify=notify+(i+1)+"、"+data[i].redi+"-->"+data[i].ori+"\n"
//			notify+=(i+1)+"、"+data[i].redi+"\n"
	
	
	s.reply("共"+data.length+"个重定向命令(\"-数字\"删除,输入命令执行,\"q\"退出)\n"+notify)
	let sg=s.listen(20000)
	if(sg==null||sg.getContent()=="q"){
		s.reply("已退出")
		return
	}
	else if(sg.getContent()>=0){
		s.reply("请输入命令执行")
		return	
	}
	//删除
	else if(sg.getContent()<0){//删除自定义命令
		let n=Math.abs(sg.getContent())
		if(n>data.length){
			s.reply("超出选择范围，已退出")
			return
		}
		try{
			s.reply("已删除重定向命令:"+data[n-1].redi)	
			data.splice(n-1,1)
			db.set("redirect",JSON.stringify(data))		
		}
		catch(err){
			s.reply("删除失败")
		}
	}
	else{//执行自定义命令
		let command=Redirect(sg.getContent())
		if(command!=false){//命中，执行重定向
			s.setContent(command)
			console.log('重定向为：'+command)
			//s.reply("执行命令:"+command+"\n"+sillyGirl.session(command)().message)
			// let flag=0
			// while(!flag){
			// 	let im=s.listen(15000)
			// 	if(im!=null){
			// 		s.reply(sillyGirl.session(im.getContent())().message)
			// 	}
			// 	else
			// 		flag=1
			// }
			s.continue()
		}
		else
			s.reply("执行失败，退出")
	}
	return
}


function DelRedirect(com){
	let notify=""
	let storage=db.get("redirect")
	if(storage=="")
		notify="不存在重定向命令"
	else{
		data=JSON.parse(storage)
		let index=FindByRedirect(com,data)
		if(index==-1)
			notify="不存在该重定向命令"
		else{
			data.splice(index,1)
			db.set("redirect",JSON.stringify(data))
			notify="已删除重定向命令:"+com		
		}
	}
	return notify
}

main()