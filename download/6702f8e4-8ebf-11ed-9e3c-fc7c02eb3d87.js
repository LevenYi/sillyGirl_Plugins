/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.0
* @create_at 2022-09-08 15:06:22
* @description 获取京东短链真实链接,直接发送短链即可
* @title 京东短链转长链
* @platform qq wx tg pgm sxg
* @rule raw [\s\S]*https://u\.jd\.com/\w+[\s\S]*
* @admin true
* @public false
* @priority 9
*/

const s = sender

function main(){
    let notify=s.getContent()
    let urls=s.getContent().match(/https:\/\/u\.jd\.com\/\w+/g)
    if(!urls)
        s.reply("something wrong!")
    for(let i=0;i<urls.length;i++){
        let data= request(urls[i])
        let url=data.body.match(/(?<=hrl=')https:\/\/u\.jd\.com[^']+/)
        if(url){
            url=url[0]
            data=request({
                url:url,
                method:"get",
                allowredirects: false, 
            })
            if(data.status==302){
                notify=notify.replace(urls[i],data.headers["Location"])
                //console.log(urls[i]+"\n\n"+data.headers["Location"])
            }
        }
        sleep(100)
    }
    s.reply(notify)
    s.setContent("短链转链"+notify)
    s.continue()
    return
}


main()