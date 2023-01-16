/**
 * @title 老版命令
 * @create_at 2020-09-13 16:46:02
 * @rule [存储操作:get,delete] [桶] [键]
 * @rule [存储操作:set] [桶] [键] [值]
 * @rule [存储操作:list,empty,lenof] [桶]
 * @rule [群回复操作:reply] [删除:delete] [关键词]
 * @rule [群回复操作:reply] [关键词] [回复语]
 * @rule id
 * @rule name
 * @rule time
 * @rule machineId
 * @rule replies
 * @rule mode
 * @rule 重启
 * @rule 启动时间
 * @rule 版本
 * @rule raw ^[qQ]{1,2}群$
 * @rule 菜单
 * @rule 公众号
 * @description 老版命令魔改自用版
 * @author 猫咪
 * @version v1.1.4
 * @public false
 * @icon https://cdn.heweather.com/img/plugin/190516/icon/c/100d.png
 */

const s = sender
const nick = () => new Bucket("sillyGirl").get("name", "傻妞")
const st=require("something")
function main() {
    if (s.param("群回复操作")) {
        if (!s.isAdmin()) {
            return
        }
        var chatId = s.getChatId()
        // if (chatId == 0) {
        //     s.reply("只能在群组中使用该功能哦~")
        //     return
        // }
        let rt = s.param("回复语")
        if (rt == "nil") rt = ""
        if (s.param("删除")) {
            rt = ""
        }
        console.log(s.param("关键词"), rt)
        //const reply = new Bucket(fmt.sprintf("reply%s%d", s.getPlatform(), chatId))
        const reply = new Bucket("reply")
        reply.set(s.param("关键词"), rt)
        s.reply("设置成功！")
        return
    }
    var stact = s.param("存储操作")
    if (stact) {
        if (!s.isAdmin()) {
            return
        }
        var bucket = new Bucket(s.param("桶"))
        var key = s.param("键")
        var value = s.param("值")
        switch (stact) {
            case "set":
                var old_value = bucket.get(key)
                bucket.set(key, value)
                s.reply("设置成功，你可以在60秒内“撤销”操作！")
                var ns = s.listen(60000, `^(撤销|撤回)$`)
                if (ns) {
                    bucket.set(key, old_value)
                    ns.reply("已撤销。")
                    return
                }
                break
            case "delete":
                var old_value = bucket.get(key)
                bucket.set(key, "")
                s.reply("删除成功，你可以在60秒内“撤销”操作！")
                var ns = s.listen(60000, `^(撤销|撤回)$`)
                if (ns) {
                    bucket.set(key, old_value)
                    ns.reply("已撤销。，")
                    return
                }
                break
            case "get":
                value = bucket.get(key, "<空>")
                s.reply(value)
                break
            case "list":
                var lines = []
                for (var key of bucket.keys()) {
                    lines.push(fmt.sprintf("%s: %s", key, bucket.get(key)))
                }
                s.reply(lines.length == 0 ? "<空>" : lines.join("\n"))
                break
            case "empty":
                var name = bucket.name()
                s.reply(`确认请在20秒内回复“${name}”`)
                var ns = s.listen(20000, `^${name}$`)
                if (!ns) {
                    s.reply("超时，取消操作！")
                    return
                }
                bucket.deleteAll()
                ns.reply("清空成功！")
                break
            case "lenof":
                s.reply(bucket.keys().length)
                break
        }
        return
    }
    var ids = [s.getMessageId()]
    if(s.getContent().match(/[qQ]{1,2}/))
        s.reply(image("https://raw.githubusercontent.com/LevenYi/bot_sources/main/QQ_Group.png"))
            
    switch (s.getContent()) {
        case "菜单":
            s.reply(image("https://raw.githubusercontent.com/LevenYi/bot_sources/main/sillyGirl_menu.png"))
            break
        case "公众号":
            s.reply(image("https://raw.githubusercontent.com/LevenYi/bot_sources/main/gzh_code.jpg"))
            break
        //我的ID
        case "id":
            let temp=st.ToEasyCopy(s.getPlatform(),"用户",s.getUserId())+"\n"
            temp+st.ToEasyCopy(s.getPlatform(),"群",s.getChatId())
            st.SendToTG(s.getUserId(),temp)
            break
        //群组ID
        case "groupCode":
            ids.push(s.reply(s.getChatId()))
            break
        //傻妞昵称
        case "name":
            ids.push(s.reply(nick()))
            break
        //时间
        case "time":
            ids.push(s.reply(time.now().format("2006-01-02 15:04:05")))
            break
        //机器码
        case "machineId":
            if (s.isAdmin()) {
                ids.push(s.reply(`${nick()}的机器码：${new Bucket("sillyGirl").get("machineId")}`))
            }
            break
        //群回复列表
        case "replies":
            if (s.isAdmin()) {
                const replies = new Bucket(fmt.sprintf("reply%s%d", s.getPlatform(), s.getChatId()))
                const lines = []
                for (var key of replies.keys()) {
                    lines.push(fmt.sprintf("%s === %s\n", key, replies.get(key)))
                }
                ids.push(s.reply(lines.join("\n")))
            }
            break
        //主从模式
        case "mode":
            ids.push(s.reply(`主人，现在回复你的${nick()}是${(new SillyGirl().isSlaveMode()) ? "分身" : "本体"}。`))
            break
        //重启傻妞
        case "重启":
            if (s.isAdmin()) {
                if (new SillyGirl().isSlaveMode()) {
                    ids.push(s.reply("Sorry，分身无法通过命令重启哦～"))
                    break
                }
                //ids.push(s.recallMessage(s.reply("即将重启！")))
                new Bucket("sillyGirl").set("reboot", fmt.sprintf("%v %v %v", s.getPlatform(), s.getChatId(), s.getUserId()))
            }
            break
        //启动时间
        case "启动时间":
            ids.push(s.reply(new Bucket("sillyGirl").get("started_at")))
            break
        //编译时间
        case "版本":
            var compiled_at = new Bucket("sillyGirl").get("compiled_at")
            if (compiled_at.indexOf(" ") == -1) {
                compiled_at = time.unixMilli(compiled_at).format("2006-01-02 15:04:05")
            }
            ids.push(s.reply(compiled_at))
            break
    }
    time.sleep(4000)
 //   s.recallMessage(ids)
}
main()