/**
 * @title 群晖DownloadStation助手
 * @create_at 2022-09-27 14:13:53
 * @description 群晖自带的DownloadStation 下载插件，需要填写群晖的web访问地址、用户名、密码。
 * @author leanfly
 * @version v1.0.0
 * @rule DS ?
 * @rule 群晖下载 ?
 * @priority 99
 */

// 声明sender
var s = sender

/***********配置填写开始************* */
// 声明群晖地址 http://ip:port
var syno = ''
// 声明用户名、密码
var username = ''
var passwd = ''
/***********配置填写结束************* */

// 构造请求参数
var optionLogin = {
    method: 'get',
    url: `${syno}/webapi/auth.cgi?api=SYNO.API.Auth&version=2&method=login&account=${username}&passwd=${passwd}&session=DownloadStation&format=cookie%20`
}
var optionTask = {
    method: 'Get',
    url: `${syno}/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=1&method=create&uri=${s.param(1)}&username=${username}&password=${passwd}`,
    headers: {
        cookie: ''
    }
}

// 功能实现
function main(){
    request(optionLogin, (error,response) => {
        if (error) {
            s.reply(`登录请求出错：${error}`)
        } else {
            if((JSON.parse(response.body)).success){
                optionTask.headers.cookie = `id=${(JSON.parse(response.body)).data.sid}`
                request(optionTask, (error, response) =>{
                    if(error){
                        s.reply(`任务添加请求失败：${error}`)
                    }else{
                        if((JSON.parse(response.body)).success){
                            s.reply('任务添加成功')
                        }else{
                            s.reply('任务添加失败')
                        }
                    }
                })
            }else{
                s.reply('登录失败')
            }
        }
        
    })
}

// 执行
main()
