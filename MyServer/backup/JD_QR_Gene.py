#!/usr/bin/python
# -*- coding: UTF-8 -*-
# 文件名：server.py
 
import socket               # 导入 socket 模块
import base64
     
HOST = socket.gethostname() # 获取本地主机名
PORT = 8888                # 设置端口


def get_response(str):
    data = "HTTP/1.1 200 " + "\r\n\r\n" + str  # 构造文件存在时的响应数据
    return data.encode()

def get_request(req):
	data=req.decode()
	temp=data.split('\n')
	return temp[-1]



def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:  # AF_INET表示地址是用ipv4协议，SOCK_STREAM表示我们这是TCP连接
        s.bind((HOST, PORT))  # 这个socket绑定这个端口
        s.listen(1)  # 监听此端口，参数为1表示只接收1个连接，这里会阻塞

        while True:
            conn,addr = s.accept()     # 建立客户端连接
            print('Connected by', addr)
            req = conn.recv(1024)  # 接收数据，数据的最大值为1024bit
            data=get_request(req)
            if data:
                print('['+data+']')  # 打印一下请求的数据
                file = open("qr.jpg", "wb+")
                file.write(base64.b64decode(data))
                file.close()
                conn.sendall(get_response("ok"))
            else:
                print('noting')
                conn.sendall(get_response("failed"))
            conn.close()                # 关闭连接
'''
        conn, addr = s.accept()  # 如果接收到连接，获取这个连接对象和它的地址
        while conn:
            with conn:
                print('Connected by', addr)
                req = conn.recv(1024)  # 接收数据，数据的最大值为1024bit
                data=get_request(req)
                print('['+data+']')  # 打印一下请求的数据
				if data:
					file = open("qr.jpg", "wb+")
					file.write(base64.b64decode(data))
					file.close()
					conn.sendall(get_response("ok"))

            conn, addr = s.accept()
'''


if __name__ == '__main__':
    main()

