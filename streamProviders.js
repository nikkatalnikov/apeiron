import { Subscriber, Observable, Subject } from 'rxjs'
import axios from 'axios'
import { StreamAPI } from './streamAPI'

class StreamProvider {
  constructor(type, ...args) {
    Object.assign(this, { type }, ...args)
    this.errorStream = new Subject()
  }
}

class HTTPProvider extends StreamProvider {
  constructor(type, { endpoints, config }) {
    super(type, { endpoints, config })

    this.requestStream = new Subject()

    this.dataStream = this.requestStream
      .concatMap(data => Observable.fromPromise(HTTPProvider.callXHR(config, data)))
      .do(() => void 0, err => this.errorStream.next(err))
      .retry()
      .share()
  }

  static callXHR(config, { endpoint, data }) {
    const service = axios.create(config)
    const method = endpoint.method
    const handler = service[method].bind(service)
    let url = endpoint.url

    if (url.includes(':id')) {
      if (!data || !data.id) {
        return Promise.reject(new Error(`${url} request must have id`))
      }
      url = url.replace(':id', data.id)
    }
    return handler(url, data)
  }

  send(alias, data) {
    const endpoint = this.endpoints[alias]
    if (endpoint) {
      this.requestStream.next({ endpoint, data })
    } else {
      this.errorStream.next(new Error(`${alias} endpoint doesn't exist`))
    }
  }

  sendMany(list, delay = 0) {
    Observable
      .from(list)
      .concatMap(x => Observable.of(x).delay(delay))
      .subscribe(([alias, data]) => this.send(alias, data))
  }

  groupByMethod(method) {
    const endpoints = Object
      .keys(this.endpoints)
      .filter(x => this.endpoints[x].method === method)

    return this.groupByName(...endpoints)
  }

  groupByUrl(url) {
    const endpoints = Object
      .keys(this.endpoints)
      .filter(x => this.endpoints[x].url === url)

    return this.groupByName(...endpoints)
  }

  groupByName(...newEndpoints) {
    if (!newEndpoints.length) {
      this.errorStream.next(new Error('endpoints must be provided'))
      throw new Error('endpoints must be provided')
    }

    const endpoints = newEndpoints
      .map(x => {
        if (this.endpoints[x]) {
          return {
            [x]: this.endpoints[x],
          }
        }
        this.errorStream.next(new Error(`endpoint ${x} is not valid`))
        throw new Error(`endpoint ${x} is not valid`)
      })
      .reduceRight((x, acc) => Object.assign(acc, x), {})

    return new StreamAPI(this.type, {
      endpoints,
      config: this.config
    })
  }
}

class WSProvider extends StreamProvider {
  constructor(type, endpoint, protocol) {
    super(type, endpoint, protocol)

    this.service = WSProvider.fromWebSocket(endpoint, protocol)

    this.dataStream = this.service
      .concatMap(data => Observable.of(data))
      .do(() => void 0, err => this.errorStream.next(err))
      .retry()
      .share()
  }

  static fromWebSocket(endpoint, protocol) {
    const ws = new WebSocket(endpoint, protocol)
    const close = ws.close.bind(ws)

    const observable = Observable.create((wsObservable) => {
      ws.onerror = (err) => wsObservable.error(err)
      ws.onmessage = (data) => wsObservable.next(data)
      ws.onopen = (state) => wsObservable.next(state)
      ws.onclose = (state) => wsObservable.next(state)
    })

    const observer = Subscriber.create((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data))
      } },
      (err) => console.error(`Error: ${err}`),
      () => close())

    return Subject.create(observer, observable)
  }

  send(data) {
    this.service.next(data)
  }

  sendMany(list, delay = 0) {
    Observable
      .from(list)
      .concatMap(x => Observable.of(x).delay(delay))
      .subscribe(x => this.send(x))
  }

  close() {
    this.service.complete()
  }
}

class SSEProvider extends StreamProvider {
  constructor(type, endpoint, options) {
    super(type, endpoint, options)

    this.service = SSEProvider.fromSSE(endpoint, options)

    this.dataStream = this.service
      .concatMap(data => Observable.of(data))
      .do(() => void 0, err => this.errorStream.next(err))
      .retry()
      .share()
  }

  static fromSSE(endpoint, options) {
    const sse = new EventSource(endpoint, options)
    const close = sse.close.bind(sse)

    const observable = Observable.create((sseObservable) => {
      sse.onerror = (err) => sseObservable.error(err)
      sse.onmessage = (data) => sseObservable.next(data)
      sse.onopen = (state) => sseObservable.next(state)
    })
    const observer = Subscriber.create(
      () => void 0,
      (err) => console.error(`Error: ${err}`),
      () => close())

    return Subject.create(observer, observable)
  }
  close() {
    this.service.complete()
  }
}
/*
// TO BE IMPLEMENTED LATER:

class ObservableCollection {
  constructor(arr) {
    this.arr = arr
    this.dataStream = new Subject()
  }
  get() {
    return this.arr
  }
  push(...args) {
    this.arr.push(...args)
  }
  replay(delay = 0) {
    Observable
      .from(this.arr)
      .concatMap(x => Observable.of(x).delay(delay))
      .subscribe(x => this.dataStream.next(x))
  }
}

// TO BE IMPLEMENTED LATER:

class MutationObserver {
  constructor(structure) {
    this.observables = []
    this.checkDepth(structure)
    this.dataStream = this.observables[0].dataStream.merge(this.observables[1].dataStream)
  }
  checkDepth(obj) {
    const hasChildren = Object.keys(obj).length > 0 && obj.constructor === Object
    if (hasChildren) {
      console.log(obj)
      this.observables.push(MutationObserver.fromStructure(obj))
      Object.keys(obj).forEach((prop) => this.checkDepth(obj[prop]));
    }
  }
  static fromStructure(structure) {
    const mutationObservable = new BehaviorSubject({ data: structure })
    const handler = {
      set: (target, key, value) => {
        const prev = mutationObservable.getValue()
        const data = {
          [key]: value }
        mutationObservable.next({ data, prev: prev.data, action: 'SET' })
      },
      deleteProperty: (obj) => {
        mutationObservable.next({ prev: obj, action: 'DELETE' })
      }
    };
    const proxy = new Proxy(structure, handler)

    return { observableStructure: proxy, dataStream: mutationObservable }
  }
}
*/
export { HTTPProvider, WSProvider, SSEProvider }
