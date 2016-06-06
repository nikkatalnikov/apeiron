![alt text](https://github.com/nikkatalnikov/leap/tree/master/media/logo.png "LEAP.JS")

###**LEAP.JS - reactive bindings for IO-actions and more.** 
Leap is a tiny library written in ES6 with RxJS to provide concise and robust infrastructure for driving **data layer abstractions**: **HTTP**, **SSE**, **WS**, other IO-actions and strictly evaluated data types **as multidirectional reactive streams** (ie. binding IO and Observable/Observer with Rx.Subject and vice versa).

[![Build Status](https://img.shields.io/travis/nikkatalnikov/leap/master.svg?style=flat-square)](https://travis-ci.org/nikkatalnikov/leap)
[![Code Climate](https://img.shields.io/codeclimate/github/nikkatalnikov/leap.svg?style=flat-square)](https://codeclimate.com/github/nikkatalnikov/leap)
[![Latest Stable Version](https://img.shields.io/npm/v/leap-js.svg?style=flat-square)](https://www.npmjs.com/package/leap-js)
[![Dependency Status](https://img.shields.io/david/nikkatalnikov/leap.svg?style=flat-square)](https://david-dm.org/nikkatalnikov/leap)
[![devDependency Status](https://img.shields.io/david/dev/nikkatalnikov/leap.svg?style=flat-square)](https://david-dm.org/nikkatalnikov/leap#info=devDependencies)
[![NPM Downloads](https://img.shields.io/npm/dm/leap-js.svg?style=flat-square)](https://www.npmjs.com/package/leap-js)

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

####**Examples**
(coming soon)

####**TODO (by priority)**

0. HTTP sugar: AXIOS validations, AXIOS GET params, AXIOS authorization.

1. sendMany(data, interval) for HTTP and / SSE/WS.
	
	sendMany:: DL -> sendData -> maybeInterval -> IO () // sequence on list - concatMap
	
	sendManyC:: DL -> sendData -> IO () // concurrent on IO - flatMap

2. HTTP long-polling:  

	DL.poll(data, intreval, times) / DL.pollUntil(data, intreval, predicate).

3. HTTP: 
	
	DL.groupByName('ep1','ep2') -> (DL $ [ep1,ep2], DL epm)
	
	DL.groupByUrl(url) -> (DL $ [ep1..epn], DL epm)
	
	DL.groupByMethod(method) -> (DL $ [ep1..epn], DL epm)

4. Prepare tests with 100% coverage for streamProviders.js

####**What's next**
1. Notification API
2. NodeJS express integration: to be discussed
3. NodeJS libs/orms integration: ws, redis, mongoose, SSE (custom)
4. List a -> ObservableCollection (List a)
5. Object {a} -> MutationObserver (Object {a})

####**Future exmaples**
1. DL -> Controller -> Stateless Components (React)
2. DL -> Stateless Services -> VM (Angular 1.5)
3. Architecture guide: async MVC (DL -> Controller -> View)
