##TODO (by priority):

##1. HTTP sugar:
	AXIOS validations, AXIOS GET params, AXIOS authorization.

##2. HTTP long-polling: 
	DL.poll(data, intreval) / DL.pollUntil(data, intreval, predicate).

##3. HTTP: 
	DL.groupByName('ep1','ep2') -> (DL $ [ep1,ep2], DL epm)
	DL.groupByUrl(url) -> (DL $ [ep1..epn], DL epm)
	DL.groupByMethod(method) -> (DL $ [ep1..epn], DL epm)

##4. Notification API
	.create()
	.send()
	.close()

##5. Prepare tests with 100% coverage for streamProviders.js

##6. prepare npm bundle

##Future 
1. NodeJS libs/orms integration: ws, redis, mongoose, SSE (custom)
2. ObservableCollection
3. MutationObserver

##Examples:
	1. DL -> Controller -> Stateless Components (React)
	2. DL -> Stateless Services -> VM (Angular 1.5)
	3. Architecture guide: async MVC (DL -> Controller -> View)
