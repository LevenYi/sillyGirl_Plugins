// [rule: raw ^/banme$]
if (ImType() == "qq") {
     var random = Math.ceil(Math.random() * 2000)
     var userId = GetUserID()
     var userName = GetUsername()
     GroupBan(userId, +random)
     sendText("恭喜[CQ:at,qq=" + userId + ",text=@" + userName + "]获得" + random + "秒禁言套餐。")
}
