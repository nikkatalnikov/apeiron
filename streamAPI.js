import { HTTPProvider, WSProvider, SSEProvider } from './streamProviders';
import { STREAM_TYPE } from './consts';

export class StreamAPI {
  constructor(type, ...args) {
    let streamInstance;
    switch (type) {
      case STREAM_TYPE.HTTP:
        streamInstance = new HTTPProvider(type, ...args);
        break;
      case STREAM_TYPE.WS:
        streamInstance = new WSProvider(type, ...args);
        break;
      case STREAM_TYPE.SSE:
        streamInstance = new SSEProvider(type, ...args);
        break;
      default:
        throw new Error(`${type} type of protocol doesn't exist`);
    }
    this.dataStream = streamInstance.dataStream;
    this.errorStream = streamInstance.errorStream;
    this.send = streamInstance.send.bind(streamInstance);
  }
}
