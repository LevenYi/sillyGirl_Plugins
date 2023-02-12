/**
 * @author 三藏
 * @version v1.0.0
 * @create_at 2022-09-08 14:41:33
 * @description 
 * @version v1.0.0
 * @title 群消息同步
 * @rule raw [\s\S]*
 * @priority 100
 * @public false
 * @disable true
 * @icon https://hi.kejiwanjia.com/wp-content/uploads/2022/01/telegram-plane-icon.png
 */

//请在消息框输入并发送：你好 佩奇
//建议同时打开浏览器控制台

//sender
const s = sender

var groups = [
 //   { platform: "qq", groupCode: "152312983" }, //QQ群  
    { platform: "qq", groupCode: "758657899" }, //QQ群      
    { platform: "pgm", groupCode: "-1001777694855" }, //TG群
    //{ platform: "wx", groupCode: xxxxxx }, //WX群
]


function main() {
    if(s.getChatId()){
        let find=groups.find(group=>group.platform==s.getPlatform() && group.groupCode==s.getChatId())
        if(find){
            console.log("群同步")
            if(find.platform=="qq"){
                s.continue()
                return
            }
            const sillyGirl=new SillyGirl()
            groups.forEach(group=>{
                if(group.groupCode!=s.getChatId()){
                    group["content"]=s.getContent()
                    sillyGirl.push(group)
                }
            })  
        }
    }
    s.continue()
    return
}

function getName(type) {
    switch (type) {
        case "wx": return "微信"
            break;
        case "tg": return "电报"
            break;
        case "qq": return "QQ"
            break;
        case "pgm":return "人形"
    }
}
main()