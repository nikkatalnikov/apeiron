var Leap = require('leap-js');
var DLWS = new Leap.StreamAPI('WS', 'ws://localhost:3001');
var DLSSE = new Leap.StreamAPI('SSE', 'http://localhost:3002/events');

DLWS.send({ data: '01' })
  .take(11)
  .do(function() {
    // body...
  }, function() {
    // body...
  }, function() {
    DLWS.close(1000, 'Enough for today');
  })
  .subscribe(function(res) {
    console.log('WS Data Stream:');
    res.type === 'message' ?
      console.log(res.data) :
      console.log(res.type);
  }, () => void 0, () => console.log('DLWS stopped'));


DLWS.errorStream.subscribe(function(err) {
  console.log('WS Error Stream:');
  console.error(err);
});
DLWS.errorStream.subscribe(function(err) {
  if (err.statusText) {
    $('#notifications').text(err.statusText);
  } else {
    $('#notifications').text(err);
  }
});

DLSSE.dataStream
  .take(10)
  .do(function() {
    // body...
  }, function() {
    // body...
  }, function() {
    DLSSE.close();
  })
  .subscribe(function(res) {
    console.log('SSE Data Stream:');
    res.type === 'message' ?
      console.log(res.data) :
      console.log(res.type);
  }, () => void 0, () => console.log('DLSSE stopped'));

DLSSE.dataStream.subscribe(function(res) {
  insertDataInDOM('SSE', res)
});

DLSSE.errorStream.subscribe(function(err) {
  console.log('SSE Error Stream:');
  console.error(err);
});

function insertDataInDOM(type, res) {
  $('#myData').append('<li>' + type + ' ' + (res.data || res.type) + '</li>');
}

DLWS
  .send({ data: '02' })
  .subscribe(function(res) {
    insertDataInDOM('WS', res)
  });

DLWS.send({ data: '03' });
setTimeout(() => DLWS.send({ data: 't1' }), 1)
DLWS.send({ data: '04' });
DLWS.send({ data: '05' });
setTimeout(() => DLWS.send({ data: 't2' }), 2)
setTimeout(() => DLWS.send({ data: 't3' }), 3)

