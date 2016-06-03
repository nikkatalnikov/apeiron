var DLWS = new Leap.StreamAPI('WS', 'ws://localhost:3001');

DLWS.dataStream.subscribe(function (res) {
  console.log('WS Data Stream:');
  if (res.type === 'message') {
    console.log(res.data);
  } else {
    console.log(res.type);
  }
});

DLWS.errorStream.subscribe(function (err) {
  console.log('WS Error Stream:');
  console.error(err);
});

var DLSSE = new Leap.StreamAPI('SSE', 'http://localhost:3002/events');

DLSSE.dataStream.subscribe(function (res) {
  console.log('SSE Data Stream:');
  if (res.type === 'message') {
    console.log(res.data);
  } else {
    console.log(res.type);
  }
});

DLSSE.errorStream.subscribe(function (err) {
  console.log('SSE Error Stream:');
  console.error(err);
});

var credentials = {};
var config = {
  baseURL: 'http://localhost:3000'
};

var endpoints = {
  removePost: {
    url: '/posts/:id',
    method: 'delete'
  },
  addPost: {
    url: '/posts',
    method: 'post'
  },
  getPosts: {
    url: '/posts',
    method: 'get'
  },
  getPost: {
    url: '/posts/:id',
    method: 'get'
  },
  editPost: {
    url: '/posts/:id',
    method: 'put'
  }
}

var DL = new Leap.StreamAPI('HTTP', { endpoints, config, credentials });
DL.dataStream.subscribe(function (res) {
  console.log('Data Stream:');
  console.log(res.data);
});
DL.dataStream.subscribe(insertDataInDOM);
DL.errorStream.subscribe(function (err) {
  console.log('Error Stream:');
  console.error(err);
});
DL.errorStream.subscribe(function (err) {
  if (err.statusText) {
    $('#notifications').text(err.statusText);
  } else {
    $('#notifications').text(err);
  }
});

var appendObjectData = function (item) {
  var dataItemString = '';
  $.each(item, function (key, value) {
    dataItemString += '<i>' + key + '</i>: <i>' + value + '</i>; ';
  });
  $('#myData').append('<li>' + dataItemString + '</li>');
}

function insertDataInDOM(res) {
  $('#myData').empty();
  if (Array.isArray(res.data)) {
    res.data.forEach(appendObjectData);
  } else if (typeof res.data === 'object') {
    appendObjectData(res.data);
  } else {
    $('#myData').append('<li>' + res.data + '</li>');
  }
}
//Mock data
var mockGenerator = function () {
  var mockData = {
    text: chance.word(),
    id: chance.natural({ min: 7, max: 10000 }),
    date: chance.birthday({ string: true }),
    name: chance.name(),
    email: chance.email(),
    from: chance.country({ full: true })
  }
  DL.send('addPost', mockData);
  DL.send('getPosts');
}
var populatingTimeout;
var populateData = function () {
  populatingTimeout = setInterval(mockGenerator, 1000);
}
var stopPopulatingData = function () {
  clearInterval(populatingTimeout)
}
$('#populate').click(populateData);
$('#stopPopulating').click(stopPopulatingData);
