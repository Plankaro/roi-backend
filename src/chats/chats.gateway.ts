import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: `${process.env.CLIENT_URL}`,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
})
export class ChatsGateway {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatsGateway');

  // Subscribe to the receiver's phone number (business phone)
  @SubscribeMessage('subscribe')
  handleSubscription(
    @MessageBody() phoneNumber: string,
    @ConnectedSocket() client: Socket
  ) {
    try {
      client.join(phoneNumber);
      this.logger.log(`Client ${client.id} subscribed to ${phoneNumber}`);
      client.emit('subscribed', { phoneNumber, message: `Subscribed to ${phoneNumber}` });
    } catch (error) {
      this.logger.error(`Subscription error: ${error.message}`);
      throw new InternalServerErrorException('WebSocket subscription error');
    }
  }

  // Send messages to clients subscribed to the receiver's phone number
  sendMessageToSubscribedClients(phoneNumber: string, event: "prospect" | "messages" | "notification", data: any) {
    console.log("sending",event,phoneNumber)
    this.server.to(phoneNumber).emit(event, data);
  }
}
