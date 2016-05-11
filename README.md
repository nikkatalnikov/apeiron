##TODO (by priority):

##1. HTTP sugar:
	AXIOS validations, AXIOS GET params, AXIOS authorization.

##2. HTTP long-polling: 
	DL.poll(data, intreval) / DL.pollUntil(data, intreval, predicate).

##3. HTTP: 
	DL.groupByName('ep1','ep2') -> (DL $ [ep1,ep2], DL epm)
	DL.groupByUrl(url) -> (DL $ [ep1..epn], DL epm)
	DL.groupByMethod(method) -> (DL $ [ep1..epn], DL epm)

##4. Collection: .fromCollection(), mutation iterator 
	DL.fromCollection(coll):: coll -> (changedItem, originalItem)
	BehaviourSubject.getValue() -> coll

##6. Prepare tests with 100% coverage for streamProviders.js

##7. prepare npm bundle

##8. NodeJS integration: Express, WS, SSE, Redis

##Examples:
	1. DL -> Controller -> Stateless Components (React)
	2. DL -> Stateless Services -> VM (Angular 1.5)
	3. Architecture guide: async MVC (DL -> Controller -> View)
