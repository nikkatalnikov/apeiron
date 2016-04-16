TODO (by priority):

0. Add functional signatures if applicable.

1. HTTP: validations, GET params, authorization.

2. WS: .fromWebSocket(ws) + Node example

3. SSE: .fromSSE(sse) + Node example

4. MetaStream: (DL ('created', 'disposed'), sse/ws connection, HTTP head method)

5. HTTP long-polling: DL.poll() / DL.pollUntil(predicate)

6. Collection: .fromCollection()

7. HTTP: DL.extract('ep1','ep2') -> (DL [ep1,ep2], DL $ epn // [ep1, ep2])

8. HTTP: DL.groupBy('ep1','ep2') -> (DL [ep1,ep2], DL epn)

9. add tests and coverage

10. prepare .min.js bundle

11. NodeJS integration: Express, WS, SSE, Redis

Examples:

1. DL -> Controller -> Stateless Components (React)

2. DL -> Stateless Services -> VM (Angular 1.5)

Architecture guide: async MVC (DL -> Controller -> View)
