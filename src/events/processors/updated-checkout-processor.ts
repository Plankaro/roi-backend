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
     const {checkOutData, domain } = job.data;
     if(!checkOutData?.token) return
     const checkifavailabe = await this.databaseService.checkout.findUnique({
       where: {
         shopify_id:`${checkOutData.id}`,
       }
     })
     if(!checkifavailabe) return
 
     const updatedCheckout = await this.databaseService.checkout.update({
       where: {
         shopify_id:`${checkOutData.id}`,
       },
       data:{
       completedAt:checkOutData.completed_at,
     
       gateway: checkOutData.gateway,
       createdAt: checkOutData.created_at,
       
       landingSite: checkOutData.landing_site,
       
       currency: checkOutData.currency,
       
      
       lineItems: checkOutData.line_items,
       name: checkOutData.name,
       abandonedCheckoutUrl: checkOutData.abandoned_checkout_url,
       discountCodes: checkOutData.discount_codes,
       taxLines: checkOutData.tax_lines,
       presentmentCurrency: checkOutData.presentment_currency,
       sourceName: checkOutData.source_name,
       totalLineItemsPrice: checkOutData.total_line_items_price,
       totalTax: checkOutData.total_tax,
       totalDiscounts: checkOutData.total_discounts,
       subtotalPrice: checkOutData.subtotal_price,
       totalPrice: checkOutData.total_price,
       totalDuties: checkOutData.total_duties,

       customer: checkOutData.customer,
       
       source: checkOutData.source,
       closedAt: checkOutData.closed_at,
      
       shipping_address: checkOutData.shipping_address,
       billingAddress: checkOutData.billing_address, // ensure this key exists on checkOutData
   
      
       processedAt: checkOutData.processed_at,
       
       }
     })
     console.log('Checkout updated successfully.');
   
   } catch (error) {
     console.error('Error in updating checkout:', error);
   }
}
}
