import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { sanitizePhoneNumber } from 'utils/usefulfunction';
import { DatabaseService } from 'src/database/database.service';
@Injectable()
export class EventsService {
  constructor(private databaseService: DatabaseService) {}
  async manipulateOrder(orderData: any, domain: string) {
    try {
      console.log('Received order data:', orderData);

      const contact =
        orderData.billing_address?.phone || orderData.customer?.phone;
      console.log('Extracted contact:', contact);

      const sanitizedContact = sanitizePhoneNumber(contact);
      console.log('Sanitized contact:', sanitizedContact);

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      console.log('Checking broadcasts from:', threeDaysAgo);

      const latestBroadcast = await this.databaseService.broadcast.findFirst({
        where: {
          createdAt: {
            gte: threeDaysAgo,
          },
          Chat: {
            some: {
              receiverPhoneNo: sanitizedContact,
              Status: 'read',
            },
          },
          createdFor: {
            shopify_domain: domain,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log('Latest broadcast found:', latestBroadcast);

      if (latestBroadcast) {
        console.log('Fetching prospect for phone:', sanitizedContact);

        let prospect = await this.databaseService.prospect.findUnique({
          where: {
            phoneNo: sanitizedContact,
          },
        });

        console.log('Prospect found:', prospect);

        if (prospect && !prospect.shopify_id) {
          console.log(
            'Updating prospect with Shopify ID:',
            orderData.customer.id,
          );

          prospect = await this.databaseService.prospect.update({
            where: {
              phoneNo: sanitizedContact,
            },
            data: {
              shopify_id: orderData.customer.id.toString(),
            },
          });

          console.log('Updated prospect:', prospect);
        }

        console.log('Updating latest broadcast order count...');

        const isOrderUnique = await this.databaseService.order.findFirst({
          where: {
            customer_phoneno: sanitizedContact,
            BroadCastId: latestBroadcast.id,
          },
        });
        console.log('Is order unique:', isOrderUnique);
        if (!isOrderUnique) {
          await this.databaseService.broadcast.update({
            where: { id: latestBroadcast.id },
            data: {
              unique_order_created: { increment: 1 },
            },
          });

          console.log('Updated broadcast:');

          console.log('Creating new order entry...');
        }

        await this.databaseService.order.create({
          data: {
            shopify_id: orderData.id.toString(),
            customer_phoneno: sanitizedContact,
            propspect_id: prospect ? prospect.id : null, // Ensure prospect ID is mapped correctly
            status: orderData.financial_status,
            amount: orderData.current_total_price,
            Date: new Date(orderData.created_at),
            fromBroadcast: true,
            BroadCastId: latestBroadcast.id,
          },
        });

        console.log('Order created successfully.');
      } else {
        console.log('No recent broadcast found for this contact.');
      }
    } catch (error) {
      console.error('Error in manipulateOrder:', error);
    }
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
