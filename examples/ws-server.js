const WebSocketServer = require('ws')
const wss = new WebSocketServer.Server({ port: 3001 })

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const date = (new Date()).toLocaleTimeString()
    ws.send(`Echo: ${date}, ${JSON.parse(message).data}`)
  })

  ws.on('close', (...args) => console.log(args, 'closed'))

  ws.send('i am started 1')
  setTimeout(() => ws.send('i am started 2'), 2000)
  setTimeout(() => ws.send('i am started 2'), 4000)
})

console.log('Sample echo WS server, port 3001')
