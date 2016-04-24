TODO (by priority):

0. Add functional signatures if applicable.

1. HTTP: AXIOS validations, AXIOS GET params, AXIOS authorization.

2. MetaStream: sse/ws connection state, HTTP headers.

3. HTTP long-polling: DL.poll(data, intreval) / DL.pollUntil(data, intreval, predicate).

4. Collection: .fromCollection(), mutation iterator 
	DL.fromCollection(coll):: coll -> (changedItem, originalItem)
	BehaviourSubject.getValue() -> coll

5. HTTP: 
	DL.groupByName('ep1','ep2') -> (DL $ [ep1,ep2], DL epm)
	DL.groupByUrl(url) -> (DL $ [ep1..epn], DL epm)
	DL.groupByMethod(method) -> (DL $ [ep1..epn], DL epm)

6. add tests and coverage

7. prepare .min.js bundle

8. NodeJS integration: Express, WS, SSE, Redis

Examples:

1. DL -> Controller -> Stateless Components (React)

2. DL -> Stateless Services -> VM (Angular 1.5)

Architecture guide: async MVC (DL -> Controller -> View)
