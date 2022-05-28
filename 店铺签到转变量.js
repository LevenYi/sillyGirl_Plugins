//店铺签到转变量
//[rule:外发店铺签到筛选 ?]
function main(){
	var txt=param(1);
	var reg=/\b[0-9A-Z]+\n/g;
	var match_temp=txt.match(reg);
	sendText(match_temp);
	return
}

main()