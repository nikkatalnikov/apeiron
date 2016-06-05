###**LEAP.JS - reactive bindings for IO-actions and more.** 
Leap is a tiny library written in ES6 with RxJS to provide concise and robust infrastructure for driving **data layer abstractions**: **HTTP**, **SSE**, **WS**, other IO-actions and strictly evaluated data types **as multidirectional reactive streams** (ie. binding IO and Observable/Observer with ContT/StateT monad represented as Rx.Subject and vice versa).

[![Code Climate](https://img.shields.io/codeclimate/github/nikkatalnikov/leap.svg?style=flat-square)](https://codeclimate.com/github/nikkatalnikov/leap)
[![Latest Stable Version](https://img.shields.io/npm/v/leap-js.svg?style=flat-square)](https://www.npmjs.com/package/leap-js)
[![License](https://img.shields.io/npm/l/leap-js.svg?style=flat-square)](https://www.npmjs.com/package/leap-js)
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

1. HTTP sugar: AXIOS validations, AXIOS GET params, AXIOS authorization.
2. HTTP long-polling:  DL.poll(data, intreval, times) / DL.pollUntil(data, intreval, predicate).
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
