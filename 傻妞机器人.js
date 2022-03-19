#【傻妞后台挂起】
nohup ./sillyGirl 1>/dev/null 2>&1 &      


# 【启动Nolan】
nohup /root/.dotnet/dotnet /root/nolanjdc/NETJDC.dll --urls=http://*:5702 1>/root/nolanjdc/log 2>&1 &

#【青龙-oicq对接傻妞】
#后台挂起qq
 pm2 start "oicq 2083784635"
 
 
 
 #【花生壳内网穿透】
 /root/phddns/phtunnel --appid 13628 --appkey bcbdb5573a729ab3 -l  /root/PHTunnel.log &
 tail nohup.out -n50
 
 # 【natapp 内网穿透】
nohup ./natapp -authtoken=988db74ed23d243a -log=stdout -loglevel=ERROR &

 
 
 
 #【傻妞插件开发】
 
 // [rule: ^demo(.*)$] 使用正则匹配,括号中为期望匹配的值
// [rule: demo ?] 使用问号匹配
// [rule: demo] 直接匹配
// [cron: 36 11,17 * * *] 定时任务
// [admin: true] 是否只允许管理员使用
// [disable: false] 是否禁用
// [priority: 10] 匹配优先级
// [server: 1 ] 如果不指定rule和cron时,设置为非空则指定为一个空服务,否则这个js不会加载
//上下文获取
param(n)//获取rule中期望捕获的第n个字符串,中文需要使用 encodeURI(param(n))
ImType()//聊天来源类型如:qq,wx等,其中fake为特殊调用可能为cron调用
GetUserID()//发送人用户id
GetUsername()//发送人昵称
GetChatID()//群号
GetChatname()//群名
GetContent()//获取接受到的消息
isAdmin()//发送人是否管理员
//系统功能相关
cancall(name)//返回特殊调用的函数
call(name,value)//特殊调用
Debug(log)//打印日志
sleep(millisecond)//休眠
GroupBan(uid, time)//群禁言,需要在群聊才可用
GroupKick(uid, reject)//群踢人,reject为是否拉黑名单,需要在群聊才可用
request({
    url:"",//必须
    method:"",//get,post,put,delete,可选,默认get
    headers:{},//可选
    body:"",//可选
    dataType:"",//location=>重定向url,json=>尝试解析为对象,否则为body字符串,可选
    useproxy:false,//可选
})//发送请求
//存储相关 sillyGirl存储结构为 {mainKey1:{key1:value,key2:value},mainKey2:{key1:value,key2:value}}}
bucketGet(mainKey,key)//取值
bucketSet(mainKey,key,value)//存值
bucketKeys(mainKey)//获取所有key名称
get(key)//同bucketGet("otto",key)
set(key,value)//同bucketSet("otto",key,value)
//消息相关
input(time /*[,str]*/)//等待下一个消息,str不为空时可接受其他群的消息 str可选
breakIn(str)//生成一个新的消息向下传递,可以被所有命令处理(包括当前js,所以需要防止递归)
Continue()//消息继续向下传递，可以被其他命令处理
Delete()//撤回接受到的这条消息
image(string)//图片地址转可拼接消息字符串
push({
    imType:string,//发送到指定渠道,如qq,wx,必须有
    userID:"",//groupCode不为0时为@指定用户,可选
    groupCode:"",//可选
    content:string,//发送消息
    })//给指定im发送消息
notifyMasters(string)//通知管理员
sendText(string)//发送文本
sendImage(url)//发送图片
sendVideo(url)//发送视频



#【青龙-京东扩展库 命令】

专业名词解释：
青龙管理，通过此口令可以增加、删除、编辑、查看容器信息。
权重，账号会根据权重分配到各个普通容器，权重越大分配的越多。
聚合容器，此类容器会聚集所有账号包括wsck，区别于普通容器。设置两个以上的聚合容器，可以变相实现备份账号信息的功能。
转换容器，当存在多个聚合容器，wsck优先到转换容器。
异常，出现异常的容器是因为连接不上。
大车头，账号会排在首位，多个账号设置为pt_pin1&pt_pin2&pt_pin3...。
小车头，账号在指定容器排在首位。
大钉子，账号必定会出现在所有容器中。
小钉子，账号只会出现在指定容器。
迁移，通过此口令可以立即将所有账号按照规则分配。

^

##傻妞配置命令

set sillyGirl name 傻妞
#设置傻妞后台密码 ip:端口/admin
set sillyGirl webpwd Leven@315
#傻妞http服务是否开启，默认false，开启改为true
set sillyGirl enable_http_server true
# 傻妞http服务端口
set sillyGirl port 80
# 傻妞消息撤回等待时间，单位秒
set sillyGirl duration 5
# 傻妞自动升级是否通知
set sillyGirl update_notify false
# 傻妞内置赞赏码
set sillyGirl appreciate https://gitee.com/leven_yi/my-source/raw/master/appreciate.jpg
# 设置青龙openapi的client_id参数
set qinglong client_id kn-qLj9u_op0
# 设置青龙openapi的client_secret参数
set qinglong client_secret O3wfndGl0OIGH5cM_8Aw_9aV
# 青龙是否开启自动隐藏重复任务功能
set qinglong autoCronHideDuplicate flase
# 设置青龙面板地址
set qinglong host http://192.168.31.2:5700
# 设置qq登录账号
#set qq uin 10000 #这里建议注释，直接后台弹出二维码登陆
# 设置qq登录密码
#set qq password 123456789 #这里建议注释，直接后台弹出二维码登陆
# 设置监听群聊号码，默认监听所有
set qq groupCode ?
# 设置是否自动同意好友请求
set qq auto_friend true
# 是否对自己发出的消息进行回复
set qq onself true
# 设置qq管理员
set qq masters 2083784635&3176829386&2317127770
# 设置接受通知的qq账号，默认管理员接受
set qq notifier q1&q2&q3...
# 设置qq设备信息(自动生成)
#set qq device.json ?    #这里建议注释，直接后台弹出二维码登陆
# 设置qq登录令牌(自动生成)
#set qq session.token ?  #这里建议注释，直接后台弹出二维码登陆
# 设置telegram机器人token
set tg token 5081915653:AAGZQvczHS7QYBjwxYwD_8nex169j1sAgWY
# 设置telegram机器人代理
set tg url https://tg-bot.levenyi.workers.dev
# 设置telegram机器人管理员
set tg masters t1&t2&t3...
# 设置接受通知的telegram账号，默认管理员接受
set tg notifier t1&t2&t3...
# 设置微信公众平台app_id
set wxmp app_id wx0049bf3e751a6c72
# 设置微信公众平台app_secret
set wxmp app_secret 4c396a79fc6e78f28808519112f163e8
# 设置微信公众平台token
set wxmp token wxgzhLeven315
# 设置微信公众平台encoding_aes_key
set wxmp encoding_aes_key Ft7Oh7G6VZCT1Ci7Lr2PNgp4zlwlZSUqdInwDt61D2H
# 设置微信公众平台管理员
set wxmp masters w1&w2&w3...
# 设置公众号关注事件回复
set wxmp subscribe_reply 感谢关注！
# 设置公众号默认回复
set wxmp default_reply 无法回复该消息

docker run -dit \
  -v $PWD/ql2/config:/ql/config \
  -v $PWD/ql2/log:/ql/log \
  -v $PWD/ql2/db:/ql/db \
  -v $PWD/ql2/repo:/ql/repo \
 -v $PWD/ql2/deps:/ql/deps \
  -v $PWD/ql2/raw:/ql/raw \
  -v $PWD/ql2/scripts:/ql/scripts \
  -v $PWD/ql2/jbot:/ql/jbot \
  -p 6700:5700 \
  -p 6701:5701 \
  --name qinglong2 \
  --hostname qinglong2 \
  --restart unless-stopped \
whyour/qinglong:2.10.12
