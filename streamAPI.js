import { HTTPProvider, WSProvider, SSEProvider } from './streamProviders'
import { STREAM_TYPE } from './consts'

export class StreamAPI {
  constructor(type, ...args) {
    let streamInstance
    switch (type) {
      case STREAM_TYPE.HTTP:
        streamInstance = new HTTPProvider(type, ...args)
        this.send = streamInstance.send.bind(streamInstance)
        break
      case STREAM_TYPE.WS:
        streamInstance = new WSProvider(type, ...args)
        this.send = streamInstance.send.bind(streamInstance)
        this.close = streamInstance.close.bind(streamInstance)
        break
      case STREAM_TYPE.SSE:
        streamInstance = new SSEProvider(type, ...args)
        this.close = streamInstance.close.bind(streamInstance)
        break
      // case STREAM_TYPE.COLLECTION:
      //   streamInstance = new ObservableCollection(...args)
      //   this.replay = streamInstance.replay.bind(streamInstance)
      //   break
      // case STREAM_TYPE.STRUCTURE:
      //   streamInstance = new MutationObserver(...args)
      //   this.observableStructure = streamInstance.observableStructure
      //   break
      default:
        throw new Error(`${type} type of protocol doesn't exist`)
    }
    this.dataStream = streamInstance.dataStream
    this.errorStream = streamInstance.errorStream
  }
}
