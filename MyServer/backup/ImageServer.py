from flask import Flask, request, send_file
import base64

app = Flask(__name__)

VALID_TOKEN = 'your-token-here'

@app.route('/create-qr', methods=['POST'])
def create_qr():
    try:
        token = request.headers.get('Authorization')
        if token != VALID_TOKEN:
            return 'Unauthorized', 401
        data = request.get_json()
        image_string = data['image']
        image_data = base64.b64decode(image_string)
        with open('/root/qr.jpg', 'wb') as f:
            f.write(image_data)
        return 'Success'
    except Exception as e:
        return str(e)

@app.route('/get-qr')
def get_qr():
    try:
        token = request.headers.get('Authorization')
        if token != VALID_TOKEN:
            return 'Unauthorized', 401
        return send_file('/root/qr.jpg', mimetype='image/jpeg')
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    app.run()
