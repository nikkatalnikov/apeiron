import { Observer, Observable, Subject } from 'rx-lite';
import axios from 'axios';

class StreamProvider {
  constructor(type, ...args) {
    Object.assign(this, { type }, ...args);
    this.errorStream = new Subject();
  }
}

class HTTPProvider extends StreamProvider {
  constructor(type, { endpoints, config, credentials }) {
    super(type, { endpoints, credentials });

    this.requestStream = new Subject();

    this.dataStream = this.requestStream
      .concatMap(data => Observable.fromPromise(HTTPProvider.callXHR(config, data)))
      .doOnError(err => this.errorStream.onNext(err))
      .retry()
      .share();
  }

  static callXHR(config, { endpoint, data }) {
    const service = axios.create(config);
    const method = endpoint.method;
    const handler = service[method].bind(service);
    let url = endpoint.url;

    if (url.includes(':id')) {
      if (!data || !data.id) {
        return Promise.reject(new Error(`${url} request must have id`));
      }
      url = url.replace(':id', data.id);
    }
    return handler(url, data);
  }

  send(alias, data) {
    const endpoint = this.endpoints[alias];
    if (endpoint) {
      this.requestStream.onNext({ endpoint, data });
    } else {
      this.errorStream.onNext(new Error(`${alias} endpoint doesn't exist`));
    }
  }
}

class WSProvider extends StreamProvider {
  constructor(type, endpoint, protocol) {
    super(type, endpoint, protocol);

    this.service = WSProvider.fromWebSocket(endpoint, protocol);

    this.dataStream = this.service
      .concatMap(data => Observable.just(data))
      .doOnError(err => this.errorStream.onNext(err))
      .retry()
      .share();
  }

  static fromWebSocket(endpoint, protocol) {
    const ws = new WebSocket(endpoint, protocol);
    const close = ws.close.bind(ws);

    const observable = Observable.create((wsObservable) => {
      ws.onerror = (err) => wsObservable.onError(err);
      ws.onmessage = (data) => wsObservable.onNext(data);
      ws.onopen = (state) => wsObservable.onNext(state);
      ws.onclose = (state) => wsObservable.onNext(state);
    });

    const observer = Observer.create((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }, 
    () => console.error('Error: ' + err), 
    () => close());

    return Subject.create(observer, observable);
  }

  send(data) {
    this.service.onNext(data);
  }

  close() {
    this.service.onCompleted();
  }
}

class SSEProvider extends StreamProvider {
  constructor(type, endpoint, options) {
    super(type, endpoint, options);

    this.service = SSEProvider.fromSSE(endpoint, options);

    this.dataStream = this.service
      .concatMap(data => Observable.just(data))
      .doOnError(err => this.errorStream.onNext(err))
      .retry()
      .share();
  }

  static fromSSE(endpoint, options) {
    const sse = new EventSource(endpoint, options);
    const close = sse.close.bind(sse);

    const observable = Observable.create((sseObservable) => {
      sse.onerror = (err) => sseObservable.onError(err);
      sse.onmessage = (data) => sseObservable.onNext(data);
      sse.onopen = (state) => sseObservable.onNext(state);
      sse.onclose = (state) => sseObservable.onNext(state);
    });
    const observer = Observer.create(
    () => void 0,
    () => console.error('Error: ' + err), 
    () => close());

    return Subject.create(observer, observable);
  }
  close() {
    this.service.onCompleted();
  }
}

export { HTTPProvider, WSProvider, SSEProvider };
