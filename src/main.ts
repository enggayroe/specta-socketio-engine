import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketAdapter } from './adapter/socket.adapter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket, io } from 'socket.io-client';
import { IoClientAdapter } from './adapter/io-client.adapter';
import { SocketIoAdapter } from './adapter/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors();
  // app.useWebSocketAdapter(new SocketAdapter(app).createIOServer(8081));

  // const redisIoAdapter = new SocketIoAdapter(app);
  // await redisIoAdapter.connect();

  // app.useWebSocketAdapter(redisIoAdapter);

  // app.useWebSocketAdapter(new SocketIoAdapter(app));
  // const SocketIoClientAdapter: Socket = io('http://localhost:8081');
  // app.useWebSocketAdapter(new IoClientAdapter(app))
  // app.useWebSocketAdapter(new SocketAdapter(app));
  // await app.listen(3000);
  await app.listen(3000, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
