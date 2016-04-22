var http = require('http');

http.createServer(function (req, res) {
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

function sendSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  var id = (new Date()).toLocaleTimeString();

  setInterval(function () {
    constructSSE(res, id, (new Date()).toLocaleTimeString());
  }, 2000);

  constructSSE(res, id, (new Date()).toLocaleTimeString());
}

function constructSSE(res, id, data) {
  res.write('id: ' + id + '\n');
  res.write('data: ' + data + '\n\n');
}
