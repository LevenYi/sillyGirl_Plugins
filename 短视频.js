// [rule: 扭一扭 ?(\d?)$]
// [rule: 短视频 (.{2}) ?(\d)?$]
// [priority: 10]

function main() {
    let num 
    let type = "热舞"
    if(GetContent().indexOf("扭一扭")>-1){
        num= parseInt(param(1)||1)
    }else{
        let arr=["网红","明星","热舞","风景","游戏","动物"]
        if(arr.indexOf(param(1))>-1){
            num =parseInt(param(2)||1)
        }else{
            sendText("请选择类型,只支持:网红、明星、热舞、风景、游戏、动物")
            return
        }
    }
    if (! num){
      num = 1
    }
    if (num > 5) {
      sendText("身体重要!")
      num=5
    }

    let doSendVideo=true
    if(ImType().indexOf("wx")>-1){
        if("true"!=get("nynSendToWx")){
            doSendVideo=false
        }
    }
        
    let url = "http://xiaoapi.cn/api/jingxuanshipin.php?type="+encodeURI(type)
    for (var i=0;i< num;i++){
        let red = request({
            url: url
        }
        ,(e,i,b)=>{
            if(e||i["statusCode"]!=200){
                sendText(`接口错误:${JSON.stringify([e,i,b])}`)
                return
            }
            b=(b+"")
            b = b.substring(b.indexOf("链接：")+3)
            if(doSendVideo){
                sendVideo(b)    
            }else{
                sendText(b)
            }
        })
        
    }
}
main()
