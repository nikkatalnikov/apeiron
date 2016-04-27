const http = require('http');

const sendSSE = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  req.on('close', () => {
    console.log('SSE closed');
    clearInterval(intervalId);
  });

  const intervalId = setInterval(function () {
    let data = (new Date()).toLocaleTimeString();
    res.write(`data: ${data}\n\n`);
  }, 2000);
}

http.createServer((req, res) => {
  if (req.headers.accept && req.headers.accept == 'text/event-stream') {
    if (req.url == '/events') {
      sendSSE(req, res);
    } else {
      res.writeHead(404);
      res.end();
    }
  }
}).listen(3002);

console.log('Sample SSE server, port 3002');
