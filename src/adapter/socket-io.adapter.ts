
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Observable } from 'rxjs';
import { ServerOptions } from 'socket.io';
import { Manager, io } from 'socket.io-client';

export class SocketIoAdapter extends IoAdapter {

  async connect(): Promise<void> {
    const pubClient = new Manager(`http://localhost:8081`);
    // const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect()]);

    // this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  create(port: number, options?: ServerOptions): any {
    const server = io(`http://localhost:8081`, {
      transports:['websocket']
    }); // Ganti dengan URL Socket.IO server Anda

    return server;
  }

  bindClientConnect(server: any, callback: (...args: any[]) => void): void {
    server.on('connect', callback);
  }

  bindClientDisconnect(client: any, callback: (...args: any[]) => void): void {
    client.on('disconnect', callback);
  }

  bindMessageHandlers(client: any, handlers: any[], process: (data: any) => Observable<any>): void {
    handlers.forEach(({ message, callback }) => {
      client.on(message, async (data: any, fn: (...args: any[]) => void) => {
        const response = await process(data).toPromise();
        fn(response);
      });
    });
  }

  


}
