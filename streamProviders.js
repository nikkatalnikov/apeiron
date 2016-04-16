import { Observer, Observable, Subject } from 'rx-lite';
import axios from 'axios';

class StreamProvider {
  constructor(type, ...args) {
    Object.assign(this, { type }, ...args);
    this.requestStream = new Subject();
    this.errorStream = new Subject();
  }
}

class HTTPProvider extends StreamProvider {
  constructor(type, { endpoints, config, credentials }) {
    super(type, { endpoints, credentials });

    this.service = axios.create(config);

    this.dataStream = this.requestStream
      .concatMap(data => Observable.fromPromise(this.callXHR(data)))
      .doOnError(err => this.errorStream.onNext(err))
      .retry()
      .share();
  }

  callXHR({ endpoint, data }) {
    const method = endpoint.method;
    const handler = this.service[method].bind(this.service);
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

    this.service = this.fromWebSocket(endpoint, protocol);

    this.dataStream = this.service
      .concatMap(data => Observable.just(data))
      .doOnError(err => this.errorStream.onNext(err))
      .retry()
      .share();
  }

  fromWebSocket(endpoint, protocol) {
    const ws = new WebSocket(endpoint, protocol);

    const observable = Observable.create((wsObservable) => {
      ws.onerror = (err) => wsObservable.onError(err);
      ws.onmessage = (data) => wsObservable.onNext(data);
      ws.onopen = (state) => wsObservable.onNext(state);
      ws.onclose = (state) => wsObservable.onNext(state);
    })

    const observer = Observer.create((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    })

    return Subject.create(observer, observable);
  }

  send(data) {
    this.service.observer.onNext(data);
  }
}

export { HTTPProvider, WSProvider };
