import { Injectable } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { config } from './config';


@Injectable()
export class WsClient {
  socket: Socket;
  constructor() {
    // this.socket = io(`ws://${config.block_service_url}`, {
    //   reconnectionDelayMax: 10000,
    // });

    // this.socket.on('connect', () => {
    //     console.log("CONNECTED TO BLOCKSERVICE")
    
    //     // this.socket.emit('join', "con_weth_lst001");
    //     // this.socket.emit('join', "con_rocketswap_official_v1_1");
    // })
    
    // this.socket.on('new-state-changes-by-transaction', (data) => {
    //     console.log(data)
    // })
  }
}

