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

    this.service = axios.create(config)
      // AXIOS bug
    Object.assign(this.service.defaults, {
      headers: {
        common: {},
        post: {},
        put: {},
        patch: {},
        get: {},
        delete: {},
        head: {},
      },
    })

    this.requestStream = new Subject()

    this.dataStream = this.requestStream
      .concatMap(data => Observable.fromPromise(HTTPProvider.callXHR(this.service, data)))
      .do(() => void 0, err => this.errorStream.next(err))
      .retry()
      .share()
  }

  static callXHR(service, { endpoint, data, config }) {
    const bodylessMethods = ['get', 'delete', 'head']
    const method = endpoint.method
    const handler = service[method].bind(service)
    let url = endpoint.url

    if (url.includes(':id')) {
      if (!config.id) {
        return Promise.reject(new Error(`${url} request must have id`))
      }
      url = url.replace(':id', config.id)
    }
    return bodylessMethods.includes(method) ?
      handler(url, config) : handler(url, data, config)
  }

  send(alias, payload = {}) {
    const endpoint = this.endpoints[alias]
    if (endpoint) {
      this.requestStream.next({ endpoint, data: payload.data, config: payload.config })
    } else {
      this.errorStream.next(new Error(`${alias} endpoint doesn't exist`))
    }
  }

  sendMany(list, delay = 0) {
    if (!Number.isInteger(delay)) {
      this.errorStream.next(new Error(`${delay} is not integer`))
      throw new Error(`${delay} is not integer`)
    }

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
      config: this.config,
    })
  }

  setHeader(method, header, value) {
    Object.assign(this.service.defaults.headers[method], {
      [header]: value,
    })
  }

  removeHeader(method, header) {
    delete this.service.defaults.headers[method][header]
  }
}

class WSProvider extends StreamProvider {
  constructor(type, endpoint, protocol) {
    super(type, endpoint, protocol)

    this.buffer = []
    this.service = this.fromWebSocket(endpoint, protocol)

    this.dataStream = this.service
      .concatMap(data => Observable.of(data))
      .do(() => void 0, err => this.errorStream.next(err))
      .retry()
      .share()
  }

  fromWebSocket(endpoint, protocol) {
    const ws = new WebSocket(endpoint, protocol)
    const close = ws.close.bind(ws)

    const observable = Observable.create((wsObservable) => {
      ws.onerror = (err) => wsObservable.error(err)
      ws.onmessage = (data) => wsObservable.next(data)
      ws.onopen = (state) => wsObservable.next(state)
      ws.onclose = (state) => wsObservable.next(state)
    })

    const observer = Subscriber.create(
      (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          Observable
            .of(data)
            .startWith(...this.buffer)
            // side eff
            .do(() => {
              this.buffer = []
            })
            .filter(x => !!x)
            .subscribe(x => {
              if (x.code) {
                close(x.code, x.reason)
              } else {
                ws.send(JSON.stringify(x))
              }
            })
        } else {
          this.buffer = [...this.buffer, data]
        }
      },
      (err) => console.error(`Error: ${err}`),
      () => close())

    return Subject.create(observer, observable)
  }

  send(data) {
    this.service.next(data)
  }

  sendMany(list, delay = 0) {
    if (!Number.isInteger(delay)) {
      this.errorStream.next(new Error(`${delay} is not integer`))
      throw new Error(`${delay} is not integer`)
    }

    Observable
      .from(list)
      .concatMap(x => Observable.of(x).delay(delay))
      .subscribe(x => this.send(x))
  }

  close(code = 1000, reason) {
    this.send({ code, reason })
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
class MutationObserver extends StreamProvider {
  constructor(type, structure) {
    super(type)

    if (!Proxy) {
      throw new Error('Proxy API is not supported')
    }
    const service = new Subject()
    const proxied = new Proxy(structure, {
      set: function (target, prop, value) {
        const newStruct = JSON.parse(JSON.stringify(target));
        const oldStruct = JSON.parse(JSON.stringify(target));

        if (target[prop]) {
          oldStruct[prop] = target[prop]
        }
        newStruct[prop] = value;

        service.next([oldStruct, newStruct])
        return Reflect.set(target, prop, value)
      },
      deleteProperty: function (target, prop) {
        return Reflect.deleteProperty(target, prop)
      },
    })
    Object.assign(this, { structure: proxied }, { dataStream: service.asObservable() })
  }
}
*/
export { HTTPProvider, WSProvider, SSEProvider }
