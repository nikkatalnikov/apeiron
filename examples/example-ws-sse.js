var Leap = require('leap-js');
var DLWS = new Leap.StreamAPI('WS', 'ws://localhost:3001');
var DLSSE = new Leap.StreamAPI('SSE', 'http://localhost:3002/events');

DLWS.dataStream
  .take(3)
  .doOnCompleted(function () {
    DLWS.close();
    console.log('DLWS stopped');
  })
  .subscribe(function (res) {
    console.log('WS Data Stream:');
    res.type === 'message' ?
      console.log(res.data) :
      console.log(res.type);
  });

DLWS.dataStream.subscribe(function (res) {
  insertDataInDOM('WS', res)
});

DLWS.errorStream.subscribe(function (err) {
  console.log('WS Error Stream:');
  console.error(err);
});
DLWS.errorStream.subscribe(function (err) {
  if (err.statusText) {
    $('#notifications').text(err.statusText);
  } else {
    $('#notifications').text(err);
  }
});

DLSSE.dataStream
  .take(6)
  .doOnCompleted(function () {
    DLSSE.close();
    console.log('DLSSE stopped');
  })
  .subscribe(function (res) {
    console.log('SSE Data Stream:');
    res.type === 'message' ?
      console.log(res.data) :
      console.log(res.type);
  });

DLSSE.dataStream.subscribe(function (res) {
  insertDataInDOM('SSE', res)
});

DLSSE.errorStream.subscribe(function (err) {
  console.log('SSE Error Stream:');
  console.error(err);
});

function insertDataInDOM(type, res) {
  $('#myData').append('<li>' + type + ' ' + (res.data || res.type) + '</li>');
}
