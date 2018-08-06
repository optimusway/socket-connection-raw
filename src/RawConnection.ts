import {IProxy} from "socket-connection";

export interface IRawSocketOptions {
  url: string;
  protocols: string[];
  actions: Map<string, any>;
}

export interface ISendData {
  data: string | Blob | ArrayBuffer | ArrayBufferView
}

export class RawConnection implements IProxy {
  private socket: WebSocket | null;
  private isAlive: boolean = false;
  private options: IRawSocketOptions;

  constructor(options: IRawSocketOptions) {
    this.options = options;
  }

  connect = () => {
    return new Promise(resolve => {
      if (this.socket) {
        console.info("Already connected");
        this.isAlive = true;
        resolve();
      }

      this.socket = new WebSocket(this.options.url, this.options.protocols);

      this.socket.onopen = () => {
        this.isAlive = true;
        console.info('Connected');
        resolve();
      };

      this.socket.onclose = (event: any) => {
        this.isAlive = false;
        if (event.wasClean) {
          console.warn("Connection closed");
        } else {
          console.error(
            `Connection lost, details: [${JSON.stringify(event.reason)}]`
          );
        }
      };

      this.socket.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        console.info('Data event was received');
        const {type} = data;
        const action = this.options.actions.get(type);
        if (!action) {
          console.info('You should specify this type of action');
        } else {
          action();
        }
      }
    });
  };

  close = () => {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('The connection was closed');
      }
      this.socket!.close();
      this.socket = null;
      this.isAlive = false;
      resolve();
    });
  };

  isConnected = () => this.isAlive;

  send = ({data}: ISendData) => {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('The connection was closed');
      }
      this.socket!.send(data);
      resolve();
    });
  };

}