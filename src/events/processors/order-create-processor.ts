import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { sanitizePhoneNumber } from 'utils/usefulfunction';

export interface ShopifyOrderWebhook {
  id: number;
  admin_graphql_api_id: string;
  app_id: number;
  browser_ip: string;
  buyer_accepts_marketing: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string;
  checkout_id: number;
  checkout_token: string;
  client_details: ClientDetails;
  closed_at: string | null;
  company: string | null;
  confirmation_number: string;
  confirmed: boolean;
  contact_email: string;
  created_at: string;
  currency: string;
  current_shipping_price_set: any;
  current_subtotal_price: string;
  current_subtotal_price_set: any;
  current_total_additional_fees_set: any | null;
  current_total_discounts: string;
  current_total_discounts_set: any;
  current_total_duties_set: any | null;
  current_total_price: string;
  current_total_price_set: any;
  current_total_tax: string;
  current_total_tax_set: any;
  customer_locale: string;
  device_id: string | null;
  discount_codes: any[]; // refine if needed
  duties_included: boolean;
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillment_status: string | null;
  landing_site: string;
  landing_site_ref: string | null;
  location_id: string | null;
  merchant_business_entity_id: string;
  merchant_of_record_app_id: string | null;
  name: string;
  note: string | null;
  note_attributes: any[]; // refine if needed
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_additional_fees_set: any | null;
  original_total_duties_set: any | null;
  payment_gateway_names: string[];
  phone: string;
  po_number: string | null;
  presentment_currency: string;
  processed_at: string;
  reference: string | null;
  referring_site: string;
  source_identifier: string | null;
  source_name: string;
  source_url: string | null;
  subtotal_price: string;
  subtotal_price_set: any;
  tags: string;
  tax_exempt: boolean;
  tax_lines: any;
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_cash_rounding_payment_adjustment_set: any;
  total_cash_rounding_refund_adjustment_set: any;
  total_discounts: string;
  total_discounts_set: any;
  total_line_items_price: string;
  total_line_items_price_set: any;
  total_outstanding: string;
  total_price: string;
  total_price_set: any;
  total_shipping_price_set: any;
  total_tax: string;
  total_tax_set: any;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: string | null;
  billing_address: any;
  customer: any;
  discount_applications: any[];
  fulfillments: any[];
  line_items: any[];
  payment_terms: any;
  refunds: any[];
  shipping_address: any;
  shipping_lines: any[];
  returns: any[];
}

export interface ClientDetails {
  accept_language: string;
  browser_height: number | null;
  browser_ip: string;
  browser_width: number | null;
  session_hash: string | null;
  user_agent: string;
}

export interface MoneySet {
  shop_money: Money;
  presentment_money: Money;
}

export interface Money {
  amount: string;
  currency_code: string;
}

export interface TaxLine {
  price: string;
  rate: number;
  title: string;
  price_set: MoneySet;
  channel_liable: boolean;
}

export interface Address {
  first_name: string;
  address1: string;
  phone: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  last_name: string;
  address2: string | null;
  company: string | null;
  latitude?: number;
  longitude?: number;
  name: string;
  country_code: string;
  province_code: string;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  state: string;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  phone: string;
  currency: string;
  tax_exemptions: any[];
  admin_graphql_api_id: string;
  default_address: Address;
}

export interface LineItem {
  id: number;
  admin_graphql_api_id: string;
  current_quantity: number;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: string | null;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: MoneySet;
  product_exists: boolean;
  product_id: number;
  properties: any[];
  quantity: number;
  requires_shipping: boolean;
  sales_line_item_group_id: string | null;
  sku: string;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: MoneySet;
  variant_id: number;
  variant_inventory_management: string;
  variant_title: string;
  vendor: string;
  tax_lines: TaxLine[];
  duties: any[];
  discount_allocations: any[];
}

export interface ShippingLine {
  id: number;
  carrier_identifier: string | null;
  code: string;
  current_discounted_price_set: MoneySet;
  discounted_price: string;
  discounted_price_set: MoneySet;
  is_removed: boolean;
  phone: string | null;
  price: string;
  price_set: MoneySet;
  requested_fulfillment_service_id: string | null;
  source: string;
  title: string;
  tax_lines: any[]; // refine if needed
  discount_allocations: any[];
}

export interface JobData {
  orderData: ShopifyOrderWebhook;
  domain: string;
}

@Processor('createOrderQueue')
@Injectable()
export class CreateOrderQueue extends WorkerHost {
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }
  async process(job: Job<any>): Promise<void> {
    try {
      const { orderData, domain } = job.data as JobData;

 
      const contact =
        orderData.billing_address?.phone || orderData.customer?.phone;

      const sanitizedContact = sanitizePhoneNumber(contact);

      const order_created = await this.databaseService.order.create({
        data: {
          shopify_id: orderData.id.toString(),
          customer_phoneno: sanitizedContact,
          // propspect_id: prospect ? prospect.id : null, // Ensure prospect ID is mapped correctly
          status: orderData.financial_status,
          amount: orderData.current_total_price,
          Date: new Date(orderData.created_at),
          // fromBroadcast: true,
          // BroadCastId: latestBroadcast.id,/
          shopify_store: domain,
          order_status_url: orderData.order_status_url,
          processed_at: orderData.processed_at,
          cancel_reason: orderData.cancel_reason,
          cancelled_at: orderData.cancelled_at,
          cart_token: orderData.cart_token,
          checkout_id: String(orderData.checkout_id),
          checkout_token: orderData.checkout_token,
          closed_at: orderData.closed_at,
          confirmation_number: orderData.confirmation_number,
          confirmed: orderData.confirmed,
          contact_email: orderData.contact_email,
          created_at: orderData.created_at,
          currency: orderData.currency,
          discount_codes: orderData.discount_codes,
          fulfillment_status: orderData.fulfillment_status,
          fulfillments :orderData.fulfillments,
          landing_site: orderData.landing_site,
          updated_at: orderData.updated_at,
          total_weight: orderData.total_weight,
          merchant_business_entity_id: orderData.merchant_business_entity_id,
          name: orderData.name,
          order_number: orderData.order_number,
          shipping_lines: orderData.shipping_lines,
          shipping_address: orderData.shipping_address,
        },
      });

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const latestBroadcast = await this.databaseService.broadcast.findFirst({
        where: {
          createdAt: {
            gte: threeDaysAgo,
          },
          Chat: {
            some: {
              receiverPhoneNo: sanitizedContact,
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

      if (latestBroadcast) {
        let prospect = await this.databaseService.prospect.findUnique({
          where: {
            phoneNo: sanitizedContact,
          },
        });

        if (prospect && !prospect.shopify_id) {
          prospect = await this.databaseService.prospect.update({
            where: {
              phoneNo: sanitizedContact,
            },
            data: {
              shopify_id: orderData.customer.id.toString(),
            },
          });
        }

        const isOrderUnique = await this.databaseService.order.findFirst({
          where: {
            customer_phoneno: sanitizedContact,
            BroadCastId: latestBroadcast.id,
          },
        });

        if (!isOrderUnique) {
          await this.databaseService.broadcast.update({
            where: { id: latestBroadcast.id },
            data: {
              unique_order_created: { increment: 1 },
            },
          });
        }

        await this.databaseService.order.update({
          where: {
            id: order_created.id,
          },
          data: {
            propspect_id: prospect ? prospect.id : null,
            fromBroadcast: true,
            BroadCastId: latestBroadcast.id, /// Ensure
          },
        });
      } else {
        console.log('No recent broadcast found for this contact.');
      }
    } catch (error) {
      console.error('Error in manipulateOrder:', error);
    }
  }
}
