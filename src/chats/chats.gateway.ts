import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InternalServerErrorException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Your frontend origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
})
export class ChatsGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() payload: any) {
    try {
      console.log(payload);
      this.server.emit('message', payload);
    } catch (error) {
      throw new InternalServerErrorException('WebSocket error');
    }
  }
}