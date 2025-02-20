import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { sanitizePhoneNumber } from 'utils/usefulfunction';
import { DatabaseService } from 'src/database/database.service';
@Injectable()
export class EventsService {
  constructor(private databaseService: DatabaseService) {}
  async manipulateOrder(orderData: any) {
    try {
      console.log("order",orderData);
      const contact =
        orderData.billing_address.phone || orderData.customer.phone;
      const sanitizedContact = sanitizePhoneNumber(contact);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      console.log(orderData);
      const latestBroadcast = await this.databaseService.broadcast.findFirst({
        where: {
          createdAt: {
            gte: threeDaysAgo,
          },
          BroadCast_Contacts: {
            some: {
              phoneNo: sanitizedContact,
              Chat: {
                Status: 'read',
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (latestBroadcast) {
        // Update only that broadcast record by its unique ID
        await this.databaseService.broadcast.update({
          where: { id: latestBroadcast.id },
          data: {
            order_created: { increment: 1 },
          },
      });
       
      } else {
        console.log("no broadcast found");
      }
    } catch (error) {}
  }

  findAll() {
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
