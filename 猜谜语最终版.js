//猜谜语
// [rule: 猜谜语]
function result() {
	var su = request({
		url: "https://api.linhun.vip/api/miyu",
		dataType: "json"
	})
	sendText("谜题：" + su.name + "\n类型：" + su.type)
	var list = [su.Answer,su.Tips]
	return list
}
function main() {
	miyu = result()
	sendText("请输入正确答案：")
	word = input()
	answer = miyu[0]
	switch(word) {
		case miyu[0]:
			sendText("回答正确，请继续猜谜语\n退出，请回复【q】")
			return main()
			break
		case 'q':
			return sendText("已退出游戏")
			break
		case '答案':
			sendText("正确答案为：" + answer + "\n请继续猜谜语")
			return main()
			break
		case '提示':
			sendText("提示：" + miyu[1])
			sendText("请输入正确答案：")
			for(var i = 0; i < 6; i++){
				a = input()
				switch(a) {
					case miyu[0]:
						sendText("回答正确，请继续猜谜语\n退出，请回复【q】")
						return main()
						break
					case 'q':
						return sendText("已退出游戏")
						break
					case '答案':
						sendText("正确答案为：" + answer + "\n请继续猜谜语")
						return main()
						break
					default:
						sendText("回答错误，请输入正确答案：")
				}
			}
			return sendText("回答错误次数太多，已退出游戏，正确答案为：" + answer)
			break
		default:
			sendText("回答错误，输入【提示】可进行提醒\n请输入正确答案：")
			for(var i = 0; i < 6; i++){
				a = input()
				switch(a) {
					case miyu[0]:
						sendText("回答正确，请继续猜谜语\n退出，请回复【q】")
						return main()
						break
					case 'q':
						return sendText("已退出游戏")
						break
					case '提示':
						sendText("提示：" + miyu[1])
						sendText("请输入正确答案：")
						break
					case '答案':
						sendText("正确答案为：" + answer + "\n请继续猜谜语")
						return main()
						break
					default:
						sendText("回答错误，请输入正确答案：")
				}
			}
			return sendText("回答错误次数太多，已退出游戏，正确答案为：" + answer)		
	}
}
main()