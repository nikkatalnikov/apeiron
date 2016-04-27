const WebSocketServer = require('ws');
const wss = new WebSocketServer.Server({ port: 3001 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(message);
    ws.send('Echo: ' + message);
  });

  ws.on('close', () => console.log('closed'));

  ws.send('i am started 1');
  setTimeout(() => ws.send('i am started 2'), 2000);
  setTimeout(() => ws.send('i am started 2'), 4000);
});

console.log('Sample echo WS server, port 3001');
