import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';


export class SocketAdapter extends IoAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const io = require('socket.io-client');
    const socket = io(`http://localhost:${port}`, options);
    // return {
    //   of: (namespace: string) => {
    //     return socket.of(namespace);
    //   },
    //   socket,
    // };
    return socket;
  }
}
