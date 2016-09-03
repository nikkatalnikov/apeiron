<img src="https://github.com/nikkatalnikov/apeiron/raw/master/media/logo.png" width="300">

###**APEIRON.JS - reactive bindings for IO-actions and more.** 
Apeiron is a tiny library written in ES6 with RxJS to provide concise and robust infrastructure for driving **data layer abstractions**: **HTTP**, **SSE**, **WS**, other IO-actions **as multidirectional reactive streams** (ie. binding IO and Observable/Observer with Rx.Subject and vice versa).

[![Build Status](https://img.shields.io/travis/nikkatalnikov/apeiron/master.svg?style=flat-square)](https://travis-ci.org/nikkatalnikov/apeiron)
[![Code Climate](https://img.shields.io/codeclimate/github/nikkatalnikov/apeiron.svg?style=flat-square)](https://codeclimate.com/github/nikkatalnikov/apeiron)
[![Latest Stable Version](https://img.shields.io/npm/v/apeiron.svg?style=flat-square)](https://www.npmjs.com/package/apeiron)
[![Dependency Status](https://img.shields.io/david/nikkatalnikov/apeiron.svg?style=flat-square)](https://david-dm.org/nikkatalnikov/apeiron)
[![devDependency Status](https://img.shields.io/david/dev/nikkatalnikov/apeiron.svg?style=flat-square)](https://david-dm.org/nikkatalnikov/apeiron#info=devDependencies)
<!-- [![NPM Downloads](https://img.shields.io/npm/dm/apeiron.svg?style=flat-square)](https://www.npmjs.com/package/apeiron)
 -->
####**Motivation**
What is the differnrce between Apeiron and RxJS-DOM?

**Apeiron is not just a syntactic sugar to avoid boilerplate code. It is flexible and semantically clean abstraction for M(model) layer.**
* Apeiron provides unified and simple API for IO of any origin.
* Apeiron is accurate in terms of app architecture semantics: any IO is implied to be treated with Apeiron, which encourages best FP practices (side effect denotation with data type).
* Hence Apeiron implies good architecture: Model layer isolation, Model immutability, flattened dataStream and errorStream, and on the other hand allows high composability and decomposition.
* The barrier for entry into Apeiron is low: you may have no reactive or Haskell experience to operate **IO a** binding to **Stream a** quasi-impertively as usual chained methods.
* Apeiron has richer API both on HTTP and WS/SSE written in more functional style.
* **Apeiron plays great with RxJS** - dataStream and errorStream are merely RxJS Observables.

**HTTP features:**
* Apeiron HTTP relies on Axios library, which has richer API than RxJS-DOM.
* Apeiron HTTP endpoints config is declarative - you may think of it as dual to View framework router.
* On the other hand Apeiron HTTP is dynamic - you can create new Apeiron HTTP instances base on subsets of config. Check **GroupBy API**.

**WS/SSE features:**
* Apeiron WS automatically tries to reconnect.
* Apeiron WS handles WS life cycle for open, close, and error consistently - bound to dataStream/errorStream Observables and send/sendMany API.
* Apeiron WS send close command to the server when completed is called.
* Apeiron WS enforces a single instance of a socket regardless of the number of subscriptions.
* Apeiron WS gracefully buffers messages until underlying socket isn't open and then sends them asynchronously when it does open.

**ALSO:**
* Apeiron's end mission is **isomorphic development**: similar API for client and node.js (currently in development).

####**Install**

NPM:

```bash
npm i apeiron -S
```

then hook up APEIRON.js into project:

ES6:

```javascript
import { StreamAPI } from 'apeiron'
```

Node / Browserify:

```javascript
const StreamAPI = require('apeiron').StreamAPI
```

UMD:

```html
<script src="apeiron/dist/apeiron.min.js"></script>
```

####**Class API**
Import Apeiron:

```javascript
import { StreamAPI } from 'apeiron'
```

Create streamer instance with following data structures:

```haskell
StreamAPI :: TYPE -> OPTIONS -> Streamer

-- JS: const Streamer = new StreamAPI(TYPE, OPTIONS);
-- notice that args are not curried.

data TYPE = "HTTP" | "WS" | "SSE"

data OPTIONS = 
	HTTPOptions {
		config :: Maybe AxiosConfig, 
		endpoints :: ApeironEndopints
	} | 
	WSOptions {
		endpoint :: Url,
		protocol :: Protocol | [Protocol]
	} |
	SSEOptions {
		endpoint :: Url,
		withCredentials: Bool
	}
```
	
####**Streams API**

```haskell	
-- common interface
-- JS: Streamer.dataStream
dataStream :: Observable a
-- JS: Streamer.errorStream
errorStream :: Observable a

-- for SSE and WS only
-- JS: Streamer.metaStream
metaStream :: Observable a
```

####**Send API**

Send API is for HTTP and WS only. It tunnels data to IO () and returns dataStream reference.

```haskell	
-- Notice, that Data type differs for HTTP and WS (see examples below)

-- JS: Streamer.send(Data)
send :: Data -> Streamer.dataStream

-- JS: Streamer.send([Data1, Data2.. DataN], 1000) or Streamer.send([Data1, Data2.. DataN])
sendMany :: [Data] -> Maybe Delay -> Streamer.dataStream

-- for SSE and WS
-- JS: Streamer.close()
close :: IO ()
```

As send / sendMany returns Streamer.dataStream, it is easy to nest operations like:

```javascript
DL.send('getPosts')
	.filter(x => x.isActive)
	.subscribe(x => console.log('Data Stream:', x));
```

####**Group API - HTTP only**

Creates new Streamer instance with the endpoints matched by name (multiple args) / url (single arg) / method (single arg)

```haskell	
-- JS: Streamer.groupByName('ep1','ep2',...'epN')
groupByName :: Args [EP] -> Streamer

-- JS: Streamer.groupByUrl('posts')
groupByUrl :: Url -> Streamer

-- JS: Streamer.groupByMethod('put')
groupByMethod :: Method -> Streamer
```

####**Headers API - HTTP only**
Add and remove headers for all HTTP requests

```haskell
-- JS: Streamer.setHeader('common', 'AUTH', token)
setHeader :: HMethod -> Header -> Value -> ()

-- JS: Streamer.removeHeader('common', 'AUTH')
removeHeader :: HMethod -> Header -> ()
```

####**Type reference**

```haskell	
data Method = "post" | "put" | "patch" | "get" | "delete" | "head"
data HMethod = Method | "common"
type Url = String
type EP = String
type Header = String
type Value = String
type Delay = Int

data Data = HTTPData {
	endpoint :: EP,
	payload :: {
		data :: Maybe a,
		config :: Maybe AxiosConfig
	}} | 
	WSData {
		endpoint: EP,
		data: a
	}
```

####**Examples HTTP**
Prepare config (for config details check [AXIOS API](https://github.com/mzabriskie/axios#axios-api "AXIOS API")):

```javascript	
const config = {
  baseURL: 'http://localhost:3000'
};
```

Add endpoints declaratively:

```javascript
const endpoints = {
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
```

Create Apeiron instance:

```javascript
const StreamAPI = require('apeiron').StreamAPI;
const DL = new StreamAPI('HTTP', { endpoints, config });
```

Run REST API server and add subscription:

```javascript
DL.dataStream.subscribe(res => {
  console.log('Data Stream:');
  console.log(res.data);
});

DL.dataStream.subscribe(insertDataInDOM);

DL.errorStream.subscribe(err => {
  console.log('Error Stream:');
  console.error(err);
});

DL.errorStream.subscribe(err => {
  if (err.statusText) {
    $('#notifications').text(err.statusText);
  } else {
    $('#notifications').text(err);
  }
});

DL.errorStream.subscribe(err => {
  console.log('SSE Error Stream:');
  console.error(err);
});
```

Senders example:

```javascript	
DL.send('getPosts'); // possible no config for GET 

DL.send('getPost', {
    config: { id : 1 } // GET id denoted in config for url/:id	
});

DL.send('getPost', {
	config: { // GET url/:id with query params ?ID=123
		id : 1,
		params : { ID : 123 } 
	}
});

DL.send('addPost', {
	data: { a: '12345' }, // data is required for POST, PUT, PATCH
	config: {
		params: { ID: 123 }, // optional
		withCredentials: true, // optional
		headers: {'X-Requested-With': 'XMLHttpRequest'} // optional
	}
})

DL.send('removePost', {
	// data - ignored for GET, DELETE, HEAD
	config: {
		id: 12345, // required for DELETE, HEAD, optional for GET
		params: { ID: 12345 }, // optional
		withCredentials: true, // optional
		headers: {'X-Requested-With': 'XMLHttpRequest'} // optional
	}
})

// sendMany argument is the list of tuples :: [(endpoint, payload)]
// i.e. [[endpoint1, {data, config}], [endpoint2, {data, config}]]

DL.sendMany([
	['getPost', {config: {id: 1} }],
	['getPost', {config: {id: 9774} }]
]);
```

For config details check [AXIOS API](https://github.com/mzabriskie/axios#axios-api "AXIOS API")

####**Examples WS/SSE**
Create Apeiron instance:

```javascript
const StreamAPI = require('apeiron').StreamAPI;
const DLWS = new StreamAPI('WS', 'ws://localhost:3001');
```

Run server and add subscription:

```javascript
DLWS.dataStream
	.take(10)
	.do(() => void 0, () => void 0, () => {
		DLWS.close();
		console.log('DLWS stopped');
	})
	.subscribe((res) => {
		console.log('WS Data Stream:');
		res.type === 'message' ?
		  console.log(res.data) :
		  console.log(res.type);
	});

DLWS.errorStream
	.subscribe(err => {
	  console.log('SSE Error Stream:');
	  console.error(err);
	});
```

Senders example:

```javascript
DLWS.sendMany([{data:'1'},{data:'2'},{data:'3'}]);

setTimeout(() => {
  DLWS.send({data:'x'});
}, 3000)
```

Same way works for SSE.

Check more exmaples in /exmaples folder

####**License**
ISC

####**TODO (Beta-3 release)**

CLIENT (ClientAPI)

	1. StreamAPI -> ClientAPI
	2. bower package
	3. browser support
	4. WS reconnect
	5. HTTP.poll
	6. HTTP.pollUntil
	7. Notification API
	8. unit tests

####**TODO (Beta-4 release)**

SERVER (ServerAPI)

	1. SSE custom
	2. WS ws
	3. Regis redis
	4. Mongo mongodb
	5. unit tests

####**Future exmaples**
1. DL -> Controller -> Stateless Components (React)
2. DL -> Stateless Services -> VM (Angular 1.5)
3. Architecture guide: async MVC (DL -> Controller -> View)
