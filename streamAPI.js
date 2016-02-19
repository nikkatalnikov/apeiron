import { Observable, Subject } from 'rx';
import axios from 'axios';
import { STREAM_TYPE } from './consts.js';

// TODO: externalize
const callXHR = (service, { endpoint, data }) => {
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
};

export default class StreamAPI {
	constructor(type, { endpoints, config, credentials }) {
		Object.assign(this, { endpoints }, { credentials });

		this.requestStream = new Subject();
		this.errorStream = new Subject();
		this.metaStream = new Subject();

		switch (type) {
			case STREAM_TYPE.HTTP: {
				this.xhrService = axios.create(config);
				this.dataStream = this.requestStream
					.concatMap(data => Observable.fromPromise(callXHR(this.xhrService, data)))
					.doOnError(err => this.errorStream.onNext(err))
					.retry()
					.share();
				break;
			}
			case STREAM_TYPE.WS: {
				this.dataStream = this.requestStream
					.concatMap(data => Observable.fromWebSocket(data))
					.doOnError(err => this.errorStream.onNext(err))
					.retry()
					.share();
				break;
			}
			case STREAM_TYPE.COLLECTION: {
				this.dataStream = this.requestStream
					.concatMap(data => Observable.fromArray(data))
					.share();
				break;
			}
			default: {
				return new Error(`${type} type of protocol doesn't exist`);
			}
		}
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
