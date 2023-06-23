import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketClientService } from './services/socket-client/socket-client.service';
import { LoginGateway } from './events/login/login.gateway';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalApiService } from './services/external-api/external-api.service';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'mssql',
    //   host: 'localhost',
    //   port: 1433,
    //   username: 'sa',
    //   password: 'yourStrong(_)Password',
    //   database: 'test',
    //   entities: [],
    //   // entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   // synchronize: true,
    //   synchronize: false,
    //   options: {
    //     encrypt: true,
    //     trustServerCertificate: true,
    //   },
    // }),
    SharedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SocketClientService,
    ExternalApiService,
  ],
})
export class AppModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer): any {
    consumer.apply().forRoutes('*');
  }
}

