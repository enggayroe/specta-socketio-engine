import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { BehaviorSubject, Observable, Subject, filter, fromEvent, map, of, share, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs';
import { Manager, Socket, io as sio } from 'socket.io-client';
import { SOCKET_STATE } from 'src/shared/enums/socket.state.enum';

@Injectable()
export class SocketClientService implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(SocketClientService.name);
    private readonly _id: string = Math.random().toString(26).slice(2);


    destroy$: Subject<void> = new Subject<void>();

    // private socket: BehaviorSubject<any> = new BehaviorSubject(sio(`${'http://localhost:8081'}`, { transports: ['websocket'] }));
    // socket$ = this.socket.asObservable();

    private socket: BehaviorSubject<any> = new BehaviorSubject(false);
    socket$ = this.socket.asObservable();

    private emitAction = new Subject<any>();
    emitAction$ = this.emitAction.asObservable();

    connected$: Observable<Socket>;


    // private socket: Socket;

    constructor(
    ) {
        this.logger.debug(`SERVICE_ID: ${this._id}`);

        this.logger.debug('SocketClientService...');
        // const manager = new Manager("http://127.0.0.1:8081", {
        //     // transports: ['websocket', 'polling']
        // });
        // const manager = new Manager("http://172.17.0.3:8081", {
        //     autoConnect: true,
        //     transports: ['websocket']
        // });
        const manager = new Manager("http://localhost:8081", {
            autoConnect: true,
            transports: ['websocket']
        });

        const socket = manager.socket("/login"); // main namespace
        manager.open((err) => {
            if (err) {
                // an error has occurred
                console.error(`(manager)-(err): `, err?.message);
            } else {
                // the connection was successfully established
                console.log(`(manager): `, 'ok!');
            }
        });
        // this.socket = sio('http://localhost:8081', {
        //     transports: ['websocket'],
        // }); // Ganti URL dengan URL server Socket.IO Anda
        socket.on('connect', () => {
            console.log('Terhubung ke server Socket.IO');
            console.log(`client: `, socket?.id);
        });
        socket.on('error', () => {
            console.log('error ke server Socket.IO 222');
        });
        socket.on('disconnect', (reason, desc: any) => {
            console.log(`reason: `, reason);
            console.log(`desc: `, desc?.description);
        });
        // socket.io.on("open", () => {
        //     console.log('Terhubung ke server Socket.IO ------');
        // });
        socket.io.on("error", (error) => {
            // console.log(error?.message);
            console.error(`(socket.io)-(err): `, error?.message);
        });
        // socket.connect();

        this.socket.next(socket);

        this.connected$ = this.socket$
            .pipe(
                // tap((x: any) => console.log(`(SocketCheckService)-(connected$)-(tap1): `, x)),
                filter((x: any) => !!x),
                switchMap(socket =>
                    fromEvent(socket, SOCKET_STATE.CONNECT)
                        .pipe(
                            tap((x: any) => console.log(`(SocketClientService)-(connected$)-(tap2): `, x)),
                            map(() => socket),
                            tap(_ => {
                                // this.state.next(SOCKET_STATE.CONNECT)
                            }),
                        )
                ),
                share(),
                takeUntil(this.destroy$)
            );
        this.connected$.subscribe();

        // const fileNotif$ = this.socket$
        //     .pipe(
        //         // tap((x: any) => console.log(`(SocketCheckService)-(fileNotif$)-(tap1): `, x)),
        //         filter((x: any) => !!x),
        //         switchMap(socket =>
        //             fromEvent(socket, 'FILE_NOTIF')
        //                 .pipe(
        //                     tap((x: any) => console.log(`(SocketClientService)-(fileNotif$)-(tap2): `, x)),
        //                     // map(() => socket),
        //                     tap(_ => {

        //                     }),
        //                 )
        //         ),
        //         share(),
        //         takeUntil(this.destroy$)
        //     );
        // fileNotif$.subscribe();

        const reconnect$ = this.socket$
            .pipe(
                // tap((x: any) => console.log(`(SocketCheckService)-(reconnect$)-(tap1): `, x)),
                filter((x: any) => !!x),
                switchMap(socket =>
                    fromEvent(socket, SOCKET_STATE.RECONNECT)
                        .pipe(
                            tap((x: any) => console.log(`(SocketCheckService)-(reconnect$)-(tap2): `, x)),
                            map(() => socket),
                            tap(_ => {
                                // this.state.next(SOCKET_STATE.RECONNECT)
                            }),
                        )
                ),
                share(),
                takeUntil(this.destroy$)
            );
        reconnect$.subscribe();

        const reconnectError$ = this.socket$
            .pipe(
                // tap((x: any) => console.log(`(SocketCheckService)-(reconnectError$)-(tap1): `, x)),
                filter((x: any) => !!x),
                switchMap(socket =>
                    fromEvent(socket, SOCKET_STATE.RECONNECT_ERROR)
                        .pipe(
                            tap((x: any) => console.log(`(SocketCheckService)-(reconnectError$)-(tap2): `, x)),
                            map(() => socket),
                            tap(_ => {
                                // this.state.next(SOCKET_STATE.RECONNECT_ERROR)
                            }),
                        )
                ),
                share(),
                takeUntil(this.destroy$)
            );
        reconnectError$.subscribe();

        const disconnected$ = this.socket$
            .pipe(
                // tap((x: any) => console.log(`(SocketCheckService)-(disconnected$)-(tap1): `, x)),
                filter((x: any) => !!x),
                switchMap(socket =>
                    fromEvent(socket, SOCKET_STATE.DISCONNECT)
                        .pipe(
                            // tap((x: any) => console.log(`(SocketCheckService)-(disconnected$)-(tap2): `, x)),
                            tap(([reason, desc]) => console.log(`(SocketCheckService)-(disconnected$)-(tap2): `, reason, desc?.description)),
                            map(() => socket),
                            tap(_ => {
                                // this.state.next(SOCKET_STATE.DISCONNECT)
                            }),
                        )
                ),
                takeUntil(this.destroy$)
            );
        disconnected$.subscribe();

        const emitAction$ = this.emitAction$
            .pipe(
                // tap((x: any) => console.log(`(service)(SocketLogin)-(emitAction$)-(tap1): `, x)),
                withLatestFrom(this.connected$),
                // tap((x: any) => console.log(`(service)(SocketLogin)-(emitAction$)-(tap1): `, x)),
                // tap(([{ event, data }, socket]) => console.log(`(isUsernameExist$)-(tap2): `, socket, event, data)),
                tap(([{ key, value }, socket]) => {
                    // console.log(`(emitAction$)-(tap2): `, socket, key, value);
                    socket.emit(key, value);
                }),
                takeUntil(this.destroy$)
            );
        emitAction$.subscribe();

    }
    onModuleInit() {
        this.logger.debug('SocketClientService...onModuleInit');
    }
    onModuleDestroy() {

    }

    // listenOnEvent = (event: string): Observable<any> =>
    //     of(this.socket$).pipe(
    //         // tap((x: any) => console.log(`(SocketTransaksiService)-(listenOnConnect$)-(tap1): `, x)),
    //         filter((x: any) => !!x),
    //         switchMap((socket: Socket) => fromEvent(socket, event)),
    //         // tap((x: any) => console.log(`(login listenOnConnect$)-(tap2): `, x)),
    //         takeUntil(this.destroy$)
    //         // repeatWhen(complete => complete.pipe(delay(30000)))
    //     );

    listenOnEvent = (event: string): Observable<any> => this.socket$
        .pipe(
            // tap((x: any) => console.log(`(SocketTransaksiService)-(listenOnConnect$)-(tap1): `, x)),
            switchMap((socket: any) => fromEvent(socket, event)),
            // tap((x: any) => console.log(`(login listenOnConnect$)-(tap2): `, x)),
            takeUntil(this.destroy$),
            // repeatWhen(complete => complete.pipe(delay(30000)))
        );


    // connect() {
    //     const socket: Socket = this.socket.value;
    //     // const socket: SocketIOClient.Socket = this.socket.value;

    //     // console.log(`(SocketCheckService)-(connect): `, socket)
    //     console.log(`(SocketCheckService)-(connect): `, socket.disconnected);
    //     socket.connect();
    //     console.log(`(SocketCheckService)-(connect): `, socket.disconnected);
    //     if (socket.disconnected)
    //         socket.connect();
    // }

    // disconnect() {
    //     const socket: Socket = this.socket.value;
    //     // const socket: SocketIOClient.Socket = this.socket.value;

    //     // console.log(`(SocketCheckService)-(disconnect): `, socket)
    //     if (socket.connected)
    //         socket.disconnect();
    // }

    // emit(event: string, data: string) {
    //     console.log(`(service)(SocketLogin)-(emit)-(tap1): `, event, data)
    //     if (!!event && !!data)
    //         this.emitAction.next({ key: event, value: data })
    // }

    emit(event: string, data: string) {
        // console.log(`(service)(SocketLogin)-(emit)-(tap1): `, event, data)
        if (!!event && !!data)
            this.emitAction.next({ key: event, value: data })
    }

    // on(eventName: string, callback: (...args: any[]) => void): void {
    //     this.socket.on(eventName, callback);
    // }

    disconnect(): void {
        const socket: Socket = this.socket.value;
        if (socket.connected)
            socket.disconnect();
        // this.socket.disconnect();
    }

    getServiceId() {
        return this._id;
    }


}
