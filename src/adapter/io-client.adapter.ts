import { WebSocketAdapter, INestApplicationContext } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets'

import { isFunction } from '@nestjs/common/utils/shared.utils';
import { fromEvent, Observable } from 'rxjs';
import { filter, first, map, mergeMap, share, takeUntil } from 'rxjs/operators';
import { Socket, io } from 'socket.io-client';

export class IoClientAdapter implements WebSocketAdapter {
    private io;
    constructor(private app: INestApplicationContext) {

    }

    create(port: number, options?: any) {
        const client = io("http://localhost:8081" , options || {})
        this.io = client;
        return client;
    }

    bindClientConnect(server: Socket, callback: Function) {
        this.io.on('connect', callback);
    }

    bindClientDisconnect(client: Socket, callback: Function) {
        console.log("it disconnect")
        //client.on('disconnect', callback);
    }

    public bindMessageHandlers(
        client: any,
        handlers: MessageMappingProperties[],
        transform: (data: any) => Observable<any>,
    ) {
        const disconnect$ = fromEvent(this.io, 'disconnect').pipe(
            share(),
            first(),
        );

        handlers.forEach(({ message, callback }) => {
            const source$ = fromEvent(this.io, message).pipe(
                mergeMap((payload: any) => {
                    const { data, ack } = this.mapPayload(payload);
                    return transform(callback(data, ack)).pipe(
                        filter((response: any) => !!response),
                        map((response: any) => [response, ack]),
                    );
                }),
                takeUntil(disconnect$),
            );
            source$.subscribe(([response, ack]) => {
                if (response.event) {
                    return client.emit(response.event, response.data);
                }
                isFunction(ack) && ack(response);
            });
        });
    }

    public mapPayload(payload: any): { data: any; ack?: Function } {
        if (!Array.isArray(payload)) {
            return { data: payload };
        }
        const lastElement = payload[payload.length - 1];
        const isAck = isFunction(lastElement);
        if (isAck) {
            const size = payload.length - 1;
            return {
                data: size === 1 ? payload[0] : payload.slice(0, size),
                ack: lastElement,
            };
        }
        return { data: payload };
    }

    close(server: Socket) {
        this.io.close()
    }
}

function isNil(response: any) {
    throw new Error("Function not implemented.");
}
