/*
* @author https://t.me/sillyGirl_Plugin
* @title 口令解析手动版
* @version v1.0.0
* @create_at 2022-09-08 15:06:22
* @description jx +口令,用于某些特殊口令，须安装something模块
* @platform qq wx tg pgm sxg
* @rule raw jx [\s\S]*
* @priority 100
 * @public false
* @admin true
*/

//请在消息框输入并发送：你好 佩奇
//建议同时打开浏览器控制台

//sender
const s = sender
const st=require("something")

main()



function main(){
	let uid=s.getUserId(),cid=s.getChatId(),imType=s.getPlatform()
	let tipid=s.reply("正在解析...")
	let msg=s.getContent(),JDCODE=""
	let notify="",DPS="", spy=""
	
	JDCODE=msg.slice(3)
	
	let info=st.NolanDecode(JDCODE)
	if(info!=null)
		DPS="\n\n--本次解析服务由Nolan提供"
	else{
		info=st.WallDecode(JDCODE)
		if(info!=null)
			DPS="\n\n--本次解析服务由WALL提供"
		else{
			info=st.WindfggDecode(JDCODE)
			if(info!=null)
				DPS="\n\n--本次解析服务由Windfgg提供"
			else{
				s.reply("解析失败")
				s.continue()
				return		
			}		
		}	
	}
	
	let reply=st.ToHyperLink(s.getPlatform(),info.jumpUrl,info.title)
	s.recallMessage(tipid)
	if(s.getPlatform()=="tg"){
		if(cid==0){
			if(!st.SendToTG(uid,reply))
				s.reply("【"+title+"】\n"+url)
		}
		else{
			if(!st.SendToTG(cid,reply))
				s.reply("【"+title+"】\n"+url)
		}			
	}
	else
		s.reply(reply)	
	return
}

