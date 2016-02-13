import { Observable, Subject } from 'rx';
import { get } from 'axios';
import { STREAM_TYPE } from './consts.js';
// import { get, post, put, patch, delete, head } from 'axios';

const xhr = (reqData) => get(reqData.endpoint.url);

export default class StreamAPI {
	constructor(type, { endpoints, credentials }) {
		Object.assign(this, { endpoints }, { credentials });

		this.requestStream = new Subject();
		this.errorStream = new Subject();
		this.metaStream = new Subject();

		switch (type) {
			case STREAM_TYPE.HTTP: {
				this.dataStream = this.requestStream
					.concatMap(data => Observable.fromPromise(xhr(data)))
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
		const notFoundErr = new Error(`${alias} endpoint doesn't exist`);
		const foundSuggestions = Observable
							.fromArray(this.endpoints)
							.filter(endpoint => endpoint.alias === alias);
		const notFoundStream = foundSuggestions.isEmpty();
		foundSuggestions
			.subscribe(endpoint => this.requestStream.onNext({ endpoint, data }));
		notFoundStream
			.subscribe(isEmpty => isEmpty ? this.errorStream.onNext(notFoundErr) : void 0);
	}
}
