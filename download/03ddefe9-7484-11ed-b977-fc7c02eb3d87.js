/*
* @author https://t.me/sillyGirl_Plugin
* @version v1.0.0
* @create_at 2022-09-08 15:06:22
* @description openAI人工智障，需设置token
* @title openAI
* @rule ai ?
 * @public false
*/

//请在openAI官网登陆完成后，点击右上角头像-View API keys创建token，并使用命令'set otto openAI_token ?'设置token

const s=sender

function main(){
    let token=(new Bucket("otto").get("openAI_token"))
    if(!token){
        s.reply("请使用命令'set otto openAI_token ?'设置openAI的token")
        return
    }
    let text=s.param(1)
    if(text.match(/(\u753b|\u6765)(\u5f20|\u4e2a)?\S+\u56fe?/)){
        let data=ImageGenerations(token,{
            "prompt": text,
            "n": 1,
            "size": "512x512"
        })
        try{
            s.reply(image(data.data[0].url))
        }
        catch(err){
            s.reply("未知错误:\n"+JSON.stringify(data))
        }
    }
    else
        Talk(token,text)
}




function Talk(token,text){
    let limit=50
    let stop=["q","闭嘴","退出"]
    while(limit-->0){
        let tipid=s.reply("请稍后..")
        let data=Completions(token,{
            "model": "text-davinci-003",
            "prompt": text,
            "max_tokens": 4000,
            "temperature": 0.5,
            "top_p": 1,
            "n": 1,
            "stream": false,
            "logprobs": null,
            //"stop": "\n"
        })
        s.recallMessage(tipid)
        //console.log(JSON.stringify(data))
        if(!data){
            s.reply("网络错误")
            break
        }
        else{
            if(data.error){
                s.reply(data.error.message)
                break
            }
            else{
                try{
                    s.reply(data.choices[0].text)
                }
                catch(err){
                    s.reply("未知错误\n"+JSON.stringify(data))
                    break
                }
            }
        }
        let next=s.listen(60*1000)
        if(!next || stop.indexOf(next.getContent())!=-1){
            s.reply("退出对话")
            break
        }
        else
            text=next.getContent()
    }
}

/*************
 {
  "prompt": string（描述提示）,
  "n": 图片生成数量,
  "size": 图片尺寸('256x256', '512x512', '1024x1024')
}
 *************/
function ImageGenerations(token,body){
	try{
		let data=request({
			url:"https://api.openai.com/v1/images/generations",
			method:"post",
			headers:{
				accept: "application/json",
				Authorization:"Bearer "+token
			},
            body:body
		})
		return JSON.parse(data.body)
	}
	catch(err){
		return null
	}
}



/**
 * body={
 *      model:使用模型,
 *      prompt:ai提示，无此项则开启新会话
 *      ...
 * }
 */

function Completions(token,body){
	try{
		let data=request({
			url:"https://api.openai.com/v1/completions",
			method:"post",
			headers:{
				accept: "application/json",
				Authorization:"Bearer "+token
			},
            body:body
		})
		return JSON.parse(data.body)
	}
	catch(err){
		return null
	}
}

function GetModels(token){
	try{
		let data=request({
			url:"https://api.openai.com/v1/models",
			method:"get",
			headers:{
				accept: "application/json",
				Authorization:"Bearer "+token
			}
		})
		return JSON.parse(data.body)
	}
	catch(err){
		return null
	}
}

main()