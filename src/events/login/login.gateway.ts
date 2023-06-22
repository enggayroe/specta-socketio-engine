import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, io } from 'socket.io-client';
import { Server } from 'socket.io';


@WebSocketGateway({
  // cors: true,
  namespace: 'login',
  transports: ['websocket'],
  // path: '/login',
  
})
export class LoginGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger = new Logger(LoginGateway.name);

  private socket: Socket;
  @WebSocketServer()
  server: Server;
  private adapter: any; // Menyimpan instance adapter

  constructor(
    ){
  }

  afterInit(server: any) {
    this.logger.debug('afterInit...');
    // console.log(`(afterInit)-(server): `, server);
    // Inisialisasi socket.io-client
    // Membuat instance socket.io-client
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.debug('handleConnection...');
  }

  handleDisconnect(client: any) {
    this.logger.debug('handleDisconnect...');
  }

  @SubscribeMessage('connect')
  handleMessage(client: any, payload: any): string {
    console.log('connect');
    return 'Hello world!';
  }

  @SubscribeMessage('error')
  handleError(client: any, payload: any): void {
    console.log(client);
    // return 'Hello world!';
  }
}
