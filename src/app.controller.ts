import { Controller, Get, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { SocketClientService } from './services/socket-client/socket-client.service';
import { Subject, catchError, delay, filter, from, mergeMap, observeOn, queueScheduler, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { SOCKET_LOGIN_LISTEN } from './shared/enums/socket-login-listen.enum';
import { SOCKET_STATE } from './shared/enums/socket.state.enum';
import { UtilService } from './shared/util/util.service';
import { ExternalApiService } from './services/external-api/external-api.service';
import axios from 'axios';


@Controller()
export class AppController implements OnModuleInit, OnModuleDestroy {

  private readonly logger = new Logger(AppController.name);
  _destroy$: Subject<void> = new Subject<void>();

  queueAction: Subject<any> = new Subject<any>();
  queueAction$ = this.queueAction.asObservable();

  constructor(
    private readonly appService: AppService,
    private readonly _socketClientService: SocketClientService,
    private readonly _utilService: UtilService,
    private readonly _externalApiService: ExternalApiService,
  ) {

    this.logger.debug(`_socketClientService... id: ${this._socketClientService.getServiceId()}`);

    const wsLoginConnected$ = this._socketClientService.connected$
      .pipe(
        // tap((x: any) => console.log(`(wsLoginConnected)-(tap1): `, x)),
        // // filter((x:any) => x === SOCKET_STATE.CONNECT),
        // tap((x: any) => console.log(`(ChainComponent)-(wsConnected$)-(tap2): `, x)),
        tap((x: any) => {
          // const currentUser = this._authService.currentUserValue;
          // console.log(`(ChainComponent)-(currentUserValue): `, currentUser);
          const socketData = {
            username: 'engine_app',
            role: 'ROLE_SYSTEM',
          };
          this._socketClientService.emit(SOCKET_LOGIN_LISTEN.USER_ADD, JSON.stringify(socketData));
        }),
        takeUntil(this._destroy$)
      );
    wsLoginConnected$.subscribe();
    // this._socketClientService.connect();

    async function fetchDataFromApi(filename: string): Promise<any> {
      const response = await axios.get(`http://127.0.0.1:8082/api/queue/${filename}`);
      return response.data;
    }

    // Gunakan operator mergeMap untuk melakukan panggilan API dan menggabungkan hasilnya
    const queueResult$ = this.queueAction$.pipe(
      tap((x: any) => console.log(`(queueResult$)-(tap1): `, x)),
      delay(5000),
      mergeMap((id) => from(fetchDataFromApi(id)).pipe(observeOn(queueScheduler)).pipe(
        catchError((err: any, caught) => {
          console.error('[fetchDataFromApi$](err): ', err);
          // if (err instanceof HttpErrorResponse)
          //   this._toastr.error(`callLog service: ${this.errorHttpMessage(err)}`);
          return throwError(() => new Error('error'));
        }),
        takeUntil(this._destroy$)
      )),
      tap((x: any) => {

      }),
      tap((x: any) => console.log(`(queueResult$)-(tap2): `, x)),
      catchError((err: any, caught) => {
        console.error('[queueResult$](err): ', err);
        // if (err instanceof HttpErrorResponse)
        //   this._toastr.error(`callLog service: ${this.errorHttpMessage(err)}`);
        return throwError(() => new Error('error'));
      }),
      takeUntil(this._destroy$)
    );

    // // Subscribe ke observable yang telah dijadwalkan dalam antrian
    // result$.subscribe((data) => {
    //   console.log('Response:', data);
    // });
    queueResult$.subscribe();

    // const fileNotif$ = this._socketClientService.connected$
    //   .pipe(
    //     // tap((x: any) => console.log(`(fileNotif$)-(tap1): `, x)),
    //     filter((x: any) => !!x),
    //     switchMap((x) =>
    //       this._socketClientService.listenOnEvent(
    //         `FILE_NOTIF`
    //       )
    //     ),
    //     tap(x => console.log(`(fileNotif$)-(tap2): `, x)),
    //     // map(x => this._utilService.safelyParseJSON(x)),
    //     // tap(x => console.log(`(fileNotif$)-(tap3): `, this._utilService.safelyParseJSON(x))),
    //     tap((res: string) => {
    //       const notif: { key: string; value: any } =
    //         this._utilService.safelyParseJSON(res);
    //       console.log(`(fileNotif$)-(notif): `, notif);

    //       switch (notif.key) {
    //         case `FILE_UPLOAD`:
    //           console.log(`(fileNotif$)-(FILE_UPLOAD): `, notif?.value);
    //           // this._chatService.spvRoomValue = !!notif?.value
    //           //   ? notif?.value
    //           //   : null;

    //           this.queueAction.next(notif?.value?.file?.filename);
    //           // this._socketClientService.emit(
    //           //   `ENGINE_FILE_NOTIF`,
    //           //   JSON.stringify({ key: 'FILE_UPLOAD_SUCCESS', value: { ...notif?.value?.file } })
    //           // );
    //           break;
    //       }
    //     }),
    //     // tap(x => console.log(`(fileNotif$)-(tap3): `, x)),
    //     takeUntil(this._destroy$)
    //   );
    // fileNotif$.subscribe();

    const testNotif$ = this._socketClientService.connected$
      .pipe(
        // tap((x: any) => console.log(`(testNotif$)-(tap1): `, x)),
        filter((x: any) => !!x),
        switchMap((x) =>
          this._socketClientService.listenOnEvent(
            `FILE_NOTIF2`
          )
        ),
        tap(x => console.log(`(testNotif$)-(tap2): `, x)),
        // map(x => this._utilService.safelyParseJSON(x)),
        // tap(x => console.log(`(testNotif$)-(tap3): `, this._utilService.safelyParseJSON(x))),
        tap((res: string) => {
          const notif: { key: string; value: any } =
            this._utilService.safelyParseJSON(res);
          console.log(`(testNotif$)-(notif): `, notif);
          this._socketClientService.emit(
            `ENGINE_FILE_NOTIF2`,
            JSON.stringify({ key: 'FILE_UPLOAD_PROGRESS', value: { ...notif?.value } })
          );
          setTimeout(() => {
            this._socketClientService.emit(
              `ENGINE_FILE_NOTIF2`,
              JSON.stringify({ key: 'FILE_UPLOAD_SUCCESS', value: { ...notif?.value } })
            );
          }, 5000);

          // switch (notif.key) {
          //   case `FILE_UPLOAD`:
          //     console.log(`(testNotif$)-(FILE_UPLOAD): `, notif?.value);
          //     // this._chatService.spvRoomValue = !!notif?.value
          //     //   ? notif?.value
          //     //   : null;

          //     this.queueAction.next(notif?.value?.file?.filename);
          //     // this._socketClientService.emit(
          //     //   `ENGINE_FILE_NOTIF`,
          //     //   JSON.stringify({ key: 'FILE_UPLOAD_SUCCESS', value: { ...notif?.value?.file } })
          //     // );
          //     break;
          // }
        }),
        // tap(x => console.log(`(testNotif$)-(tap3): `, x)),
        takeUntil(this._destroy$)
      );
    testNotif$.subscribe();

  }

  onModuleInit() {
    this.logger.debug('onModuleInit...');
  }

  onModuleDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
    this.queueAction.complete();
  }

  @Get('send')
  send(): string {
    this._socketClientService.emit('pesan', 'Hello, Socket.IO!');
    return 'Pesan dikirim ke server Socket.IO';
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('data')
  async fetchData(): Promise<any> {
    return this._externalApiService.fetchDataFromExternalApi();
  }
}
