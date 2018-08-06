import {IProxy} from "socket-connection";

export interface IRawSocketOptions {
  url: string;
  protocols: string[];
}

export interface ISendData {
  data: string | Blob | ArrayBuffer | ArrayBufferView
}

export class RawConnection implements IProxy {
  private socket: WebSocket;
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
      }
    });
  };

  close = () => {
    return new Promise(resolve => {
      this.socket.close();
      this.isAlive = false;
      resolve();
    });
  };

  isConnected = () => this.isAlive;

  send = ({data}: ISendData) => {
    return new Promise(resolve => {
      this.socket.send(data);
      resolve();
    });
  }

}