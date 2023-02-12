from http.server import HTTPServer, BaseHTTPRequestHandler
 
data = {'result': 'this is a test'}
host = ('192.168.31.5', 8888)
 
class Resquest(BaseHTTPRequestHandler):
    timeout = 5
    server_version = "Apache"   #设置服务器返回的的响应头 
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type","text/html")  #设置服务器响应头
        self.send_header("test1","This is test!")     #设置服务器响应头
        self.end_headers()
        buf = '''<!DOCTYPE HTML>
                <html>
                    <head>
                        <title>Get page</title>
                    </head>
                <body>
                    <form action="post_page" method="post">
                        username: <input type="text" name="username" /><br />
                        password: <input type="text" name="password" /><br />
                        <input type="submit" value="POST" />
                    </form>
                </body>
                </html>'''
        self.wfile.write(buf.encode())  #里面需要传入二进制数据，用encode()函数转换为二进制数据   #设置响应body，即前端页面要展示的数据
 
    def do_POST(self):
        path = self.path
        print(path)
        #获取post提交的数据
        datas = self.rfile.read(int(self.headers['content-length']))    #固定格式，获取表单提交的数据
        #datas = urllib.unquote(datas).decode("utf-8", 'ignore')
 
        self.send_response(200)
        self.send_header("Content-type","text/html")    #设置post时服务器的响应头
        self.send_header("test","This is post!")
        self.end_headers()
 
        html = '''<!DOCTYPE HTML>
        <html>
            <head>
                <title>Post page</title>  
            </head>
            <body>
                Post Data:%s  <br />
                Path:%s
            </body>
        </html>''' %(datas,self.path)
        self.wfile.write(html.encode())  #提交post数据时，服务器跳转并展示的页面内容
 
if __name__ == '__main__':
    server = HTTPServer(host)
    print("Starting server, listen at: %s:%s" % host)
    server.serve_forever()
