![alt text](https://github.com/nikkatalnikov/leap/raw/master/media/logo.png "LEAP.JS")

###**LEAP.JS - reactive bindings for IO-actions and more.** 
Leap is a tiny library written in ES6 with RxJS to provide concise and robust infrastructure for driving **data layer abstractions**: **HTTP**, **SSE**, **WS**, other IO-actions **as multidirectional reactive streams** (ie. binding IO and Observable/Observer with Rx.Subject and vice versa).

[![Build Status](https://img.shields.io/travis/nikkatalnikov/leap/master.svg?style=flat-square)](https://travis-ci.org/nikkatalnikov/leap)
[![Code Climate](https://img.shields.io/codeclimate/github/nikkatalnikov/leap.svg?style=flat-square)](https://codeclimate.com/github/nikkatalnikov/leap)
[![Latest Stable Version](https://img.shields.io/npm/v/leap-js.svg?style=flat-square)](https://www.npmjs.com/package/leap-js)
[![Dependency Status](https://img.shields.io/david/nikkatalnikov/leap.svg?style=flat-square)](https://david-dm.org/nikkatalnikov/leap)
[![devDependency Status](https://img.shields.io/david/dev/nikkatalnikov/leap.svg?style=flat-square)](https://david-dm.org/nikkatalnikov/leap#info=devDependencies)
[![NPM Downloads](https://img.shields.io/npm/dm/leap-js.svg?style=flat-square)](https://www.npmjs.com/package/leap-js)

####**Motivation**
Why should you prefer Leap over RxJS-DOM? There are several reasons (WIP for some features, check changelog).

**LEAP is not just a syntactic sugar. It is clever, semantically clear abstraction.**
* Leap provides unified and simpler API for IO of any origin.
* Leap is accurate in terms of app architecture semantics: any IO is implied to be treated with Leap, which enforces separation of concerns based on data TYPE.
* As a result, barrier for entry into Leap is lower: you may have no reactive or Haskell experience to operate monadic operation of **IO a** binding to **Stream a** quasi-impertively as instances with methods.
* For simple or small apps full RxJS may be an overhead (see above).
* Leap implies good architecture practices: Model layer isolation, Model immutability, flattened dataStream and errorStream, radical composability, etc.
* Leap has richer API both on HTTP and WS/SSE written in more functional style.
* **Leap plays great with RxJS** - dataStream and errorStream are merely RxJS Observables.

**HTTP features:**
* Leap HTTP relies on Axios library, which has better API than RxJS-DOM.
* Leap HTTP endpoints config is declarative - you may think of it as dual to View framework router.
* On the other hand Leap HTTP is dynamic - you can create new Leap HTTP instances base on subsets of config. See **GroupBy API**

**WS features:**
* Leap WS automatically tries to reconnect.
* Leap WS handles WS life cycle for open, close, and error consistently - bound to dataStream/errorStream Observables and send/sendMany API.
* Leap WS send close command to the server when completed is called.
* Leap WS enforces a single instance of a socket regardless of the number of subscriptions.
* Leap WS buffers messages until underlying socket isn't open and then sends them asynchronously when it does open.

**ALSO:**

* Leap's code is shorter and more human readable than RxJS-DOM, which grants better debugging experience.
* Leap's end mission is **isomorphic development**: similar API for client and node.js (currently in development).

####**Install**
NPM:

	npm i leap-js -S

then hook up Leap.js into project:

ES6:

	import { StreamAPI } from 'leap-js'

Node / Browserify:

	const StreamAPI = require('leap-js').StreamAPI

UMD:

	<script src="leap/dist/leap.min.js"></script>

####**API**
Import Leap:

	import { StreamAPI } from 'leap-js'

Create streamer instance with following data structures:

	StreamAPI :: TYPE -> OPTIONS -> Streamer
	
	-- JS: const Streamer = new StreamAPI(TYPE, OPTIONS);
	-- notice that args are not curried.

	data TYPE = "HTTP" | "WS" | "SSE"

	data OPTIONS = 
		HTTPOptions {
			config :: AxiosConfig, 
			endpoints :: LeapEndpointsHash
		} | 
		WSOptions {
			endpoint :: Url,
			protocol :: Protocol | [Protocol]
		} |
		SSEOptions {
			endpoint :: Url,
			withCredentials: Bool
		}

API:

	-- consider all above as curried 
	-- with current Streamer instance already partially applied  
	
	-- common
	-- JS: Streamer.dataStream ...
	dataStream :: Observable a
	errorStream :: Observable a

	-- for HTTP and WS
	send :: Data -> IO ()
	sendMany :: [Data] -> Maybe Delay -> IO ()
	
	-- for SSE and WS
	close :: IO ()

	
	-- Group API - HTTP only
	-- creates new Streamer instance with the endpoints matched by:
	-- name (multiple args) / url (single arg) / method (single arg)

	-- JS: Streamer.groupByName('ep1','ep2',...'epN')
	groupByName :: [EP] -> Streamer
	groupByName eps = StreamAPI "HTTP" HTTPOptions { endpoints :: matchedEps, ... }
			where matchedEps = filter (pred eps) (endpoints Streamer)

	groupByUrl :: Url -> Streamer
	groupByMethod :: Method -> Streamer

####**Examples HTTP**
Prepare config (for config details check [AXIOS API](https://github.com/mzabriskie/axios#axios-api "AXIOS API")):

	const config = {
	  baseURL: 'http://localhost:3000'
	};

Add endpoints declaratively:

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

Create Leap instance:

	const StreamAPI = require('leap-js').StreamAPI;
	const DL = new StreamAPI('HTTP', { endpoints, config });

Run REST API server and add subscription:

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


Senders example:
	
	DL.send('getPosts');
	DL.send('getPost', {id:60});
	DL.sendMany([['getPosts', {id: 1}],['getPosts', {id: 2}]]);


####**Examples WS/SSE**
Create Leap instance:

	const StreamAPI = require('leap-js').StreamAPI;
	const DLWS = new StreamAPI('WS', 'ws://localhost:3001');

Run server and add subscription:

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


Senders example:
	
	DLWS.sendMany([{data:'1'},{data:'2'},{data:'3'}]);

	setTimeout(() => {
	  DLWS.send({data:'x'});
	}, 3000)

Same way works for SSE.

Check more exmaples in /exmaples folder

####**License**
ISC

####**TODO (Beta-1 release)**

CLIENT (ClientAPI)

	1. HTTPS check
	2. HTTP query params
	3. WSS check
	4. WS reconnect :: Maybe Interval

####**TODO (Beta-2 release)**

CLIENT (ClientAPI)

	1. HTTP.poll
	2. HTTP.pollUntil
	3. Notification API

SERVER (ServerAPI)

	1. SSE custom
	2. WS ws
	3. Regis redis
	4. Mongo mongodb

####**Future exmaples**
1. DL -> Controller -> Stateless Components (React)
2. DL -> Stateless Services -> VM (Angular 1.5)
3. Architecture guide: async MVC (DL -> Controller -> View)
