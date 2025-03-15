import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobData } from './checkout-create-processor';
import { sanitizePhoneNumber } from 'utils/usefulfunction';
@Processor('updatedCheckoutQueue')
@Injectable()
export class UpdatedCheckoutQueue extends WorkerHost {
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }
  
  async process(job: Job): Promise<any> {
   try {
     const {checkoutData, domain } = job.data;

     if(!checkoutData.token) return
 
     const updatedCheckout = await this.databaseService.checkout.update({
       where: {
         shopify_id:`${checkoutData.id}`,
       },
       data:{
         token:checkoutData.token,
         cartToken:checkoutData.cart_token,
         email:checkoutData.email,
         gateway:checkoutData.gateway,
         createdAt:checkoutData.created_at,
         updatedAt:checkoutData.updated_at,
         landingSite:checkoutData.landing_site,
         shippingAddress:checkoutData.shipping_address,
         shippingLines:checkoutData.shipping_lines,
         phone:sanitizePhoneNumber(checkoutData?.customer?.phone),
         customerLocale:checkoutData.customer_locale,
         lineItems:checkoutData.line_items,
         name:checkoutData.name,
         abandonedCheckoutUrl:checkoutData.abandoned_checkout_url,
         discountCodes:checkoutData.discount_codes,
         taxLines:checkoutData.tax_lines,
         customer:checkoutData.customer,
         presentmentCurrency:checkoutData.presentment_currency,
         sourceName:checkoutData.source_name,
         totalLineItemsPrice:checkoutData.total_line_items_price,
         totalTax:checkoutData.total_tax,
         totalDiscounts:checkoutData.total_discounts,
         subtotalPrice:checkoutData.subtotal_price,
         totalPrice:checkoutData.total_price,
         totalDuties:checkoutData.total_duties,
         userId:checkoutData.user_id,
         for_campaign: false,
         sourceUrl:checkoutData.source_url,
         source:checkoutData.source,
         closedAt:checkoutData.closed_at,
         taxesIncluded:checkoutData.taxes_included,
         totalWeight:checkoutData.total_weight,
         currency:checkoutData.currency,
         completedAt:checkoutData.completed_at
       }
     })
     console.log('Checkout updated successfully.');
   
   } catch (error) {
     console.error('Error in updating checkout:', error);
   }
}
}
