var WebSocketServer = require('ws');
var wss = new WebSocketServer.Server({ port: 3001 });

console.log('Sample echo WS server, port 3001');

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log(message);
    ws.send('Echo: ' + message);
  });

  ws.on('close', function () {
    console.log('closed');
  });

  ws.send('i am started 1');
  setTimeout(function () { ws.send('i am started 2') }, 2000);
  setTimeout(function () { ws.send('i am started 3') }, 4000);
});
