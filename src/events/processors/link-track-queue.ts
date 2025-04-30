import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { decrypt, getMetaPixelConfig, getShopifyConfig, getgoogleAnalyticsConfig, sanitizePhoneNumber } from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';

import _ from 'lodash';
import { graphql } from 'graphql';
import { randomUUID } from 'crypto';
import axios from 'axios';
import { Buisness } from 'src/buisness/entities/buisness.entity';

@Injectable()
@Processor('linktrackQueue')
export class LinkTrackQueue extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly shopifyService: ShopifyService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    const { orderId } = job.data;
    Logger.log('⚡️ [process] LinkTrackQueue job with data:', job.data);

    const getOrder = await this.databaseService.order.findUnique({
      where: { id: orderId },
      include: { Checkout: true },
    });

    if (!getOrder) {
      Logger.log('⚠️ [process] Order not found for ID:', orderId);
      return;
    }

    const now = new Date();
    const twentySixHoursAgo = new Date(now.getTime() - 26 * 60 * 60 * 1000);
    const seventyFourHoursAgo = new Date(now.getTime() - 74 * 60 * 60 * 1000);
    const twoHoursAgo = new Date(); //for test
    // const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const findBusiness = await this.databaseService.business.findUnique({
      where: { shopify_domain: getOrder.shopify_store },
    });

    if (!findBusiness) {
      console.warn(
        '⚠️ [process] Business not found for store:',
        getOrder.shopify_store,
      );
      return;
    }

    const config = getShopifyConfig(findBusiness);

    const order:any = await this.getOrderById(getOrder.shopify_id, config);

    if (!order) {
      console.warn(
        '⚠️ [process] No order returned from Shopify for ID:',
        getOrder.shopify_id,
      );
      return;
    }

    if (order.customerJourney) {
      const firstSource =
        order.customerJourney.firstVisit?.utmParameters?.source;
      const lastSource = order.customerJourney.lastVisit?.utmParameters?.source;

      const isFromRoiMagnet =
        firstSource === 'roi_magnet' || lastSource === 'roi_magnet';
console.log('isFromRoiMagnet',isFromRoiMagnet)
      if (!isFromRoiMagnet) {
        return;
      }

      const sanitizedPhone = sanitizePhoneNumber(getOrder.customer_phoneno);
      // Attempt to find existing link
      const findLink = await this.databaseService.linkTrack.findFirst({
        where: {
          checkout_id: getOrder.db_checkout_id,
          prospect: { phoneNo: sanitizedPhone },
          buisness: { id: findBusiness.id },
          order_generated: false,
          is_test_link: false,
          chat: {
            createdAt: { gte: seventyFourHoursAgo, lte: twoHoursAgo },
            Status: 'read',
          },
          last_click: { gte: twentySixHoursAgo, lte: twoHoursAgo },
        },
        orderBy: {
          last_click: 'desc', // ↪️ sort so the newest click comes first
        },
        include: { Order: true,campaign: true },
      });
      console.log('findLink',findLink)

      if (findLink) {
        const update = await this.databaseService.linkTrack.update({
          where: { id: findLink.id },
          data: {
            order_generated: true,
            Order: { connect: { id: orderId } },
          },
        });
        
        if(findBusiness.is_google_analytics_connected){
          const type = findLink.campaign
          
            
          
        }
      

        return;
      }

      // Fallback to matching by phone number

      const findUrl = await this.databaseService.linkTrack.findFirst({
        where: {
          prospect: { phoneNo: sanitizedPhone },
          buisness: { id: findBusiness.id },
          checkout_id: null,
          order_generated: false,
          is_test_link: false,
          // chat: {
          //   createdAt: { gte: seventyFourHoursAgo, lte: twoHoursAgo },
          //   Status: 'read',
          // },
          last_click: { gte: twentySixHoursAgo, lte: twoHoursAgo },
        },
        orderBy: {
          last_click: 'desc', // ↪️ sort so the newest click comes first
        },
      });
console.log('findUrl',findUrl)
      if (findUrl) {
        const update = await this.databaseService.linkTrack.update({
          where: { id: findUrl.id },
          data: {
            order_generated: true,
            Order: { connect: { id: getOrder.id } },
          },
        });
        console.log(update);

       const res = await this.trackGa4Event(
          "campaign",
          Number(getOrder.amount),
          getOrder.created_at,
          findLink?.campaign?.name || 'ROI Magnet',
          findBusiness
        )
        Logger.log('res',res)

        return;
      }
    }
  }

  async getOrderById(
    orderId: string,
    config: any
  ): Promise<{
    customerJourney: {
      firstVisit?: { /* …utmParameters & occurredAt… */ }
      lastVisit?: { /* …utmParameters & occurredAt… */ }
    }
    amount: number
    phone: string | null
  } | null> {
    console.log(`Fetching minimal order data for ${orderId}`);
  
    const query = /* GraphQL */ `
      query getMinimalOrder($id: ID!) {
        order(id: $id) {
          customerJourney {
            firstVisit {
              occurredAt
              utmParameters {
                campaign
                content
                medium
                source
                term
              }
            }
            lastVisit {
              occurredAt
              utmParameters {
                campaign
                content
                medium
                source
                term
              }
            }
          }
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            phone
          }
        }
      }
    `;
    const variables = { id: `gid://shopify/Order/6241744486652` };
  
    try {
      const { data, errors } = await this.shopifyService.executeGraphQL(
        query,
        variables,
        config
      );
  
      if (errors?.length) {
        console.error(`GraphQL errors fetching minimal order:`, errors);
        return null;
      }
      const order = data?.order;
      if (!order) {
        console.warn(`No order returned for ${orderId}`);
        return null;
      }
  
      const customerJourney = order.customerJourney;
      console.log('customerJourney', customerJourney);
      const amount = parseFloat(order.totalPriceSet.shopMoney.amount);
      const phone = order.customer?.phone ?? null;
  
      console.log(
        `Got minimal order data — amount: ${amount}, phone: ${phone}`
      );
      return { customerJourney, amount, phone };
    } catch (err: any) {
      console.error(
        `Error in getOrderById minimal fetch for ${orderId}:`,
        err.stack || err.message
      );
      throw err;
    }
  }
  



 async  trackGa4Event(
    type: string,
    order_amount: number,
    createdAt: string | Date,
    name: string,
    business: any
  ): Promise<void> {

    const config = getgoogleAnalyticsConfig(business);
    const {mesurementId, apiSecret} = config
    if(!mesurementId || !apiSecret) {
      return
    }
    
    const endpoint =
      `https://www.google-analytics.com/mp/collect` +
      `?measurement_id=${mesurementId}` +
      `&api_secret=${apiSecret}`;
  
    // Use crypto.randomUUID() for a v4 UUID
    const clientId = randomUUID();
  
    // GA4 expects timestamp in microseconds
    const timestampMicros =
      (new Date(createdAt).getTime() || Date.now()) * 1000;
  
    const payload = {
      client_id:        clientId,
      timestamp_micros: timestampMicros,
      events: [
        {
          name: type,
          params: {
            name,
            order_amount,
          },
        },
      ],
    };
    Logger.log('payload',payload)
  
    try {
      const res = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' }, 
      });
      console.log(res);

      if (res.status !== 204) {
        console.warn(`GA4 responded with status ${res.status}`, res.data);
      }
      return res.data;
    } catch (err: any) {
      console.error('Error sending GA4 event:', err.response?.data || err.message);
    }
  }

   async  trackMetaPixelEvent(
    type: string,
    order_amount: number,
    createdAt: string | Date,
    name: string,
    business: any,
    userIp?: string,
    userAgent?: string,
    
  ): Promise<void> {
    const  { pixelId } = getMetaPixelConfig(business);
    const endpoint = `https://graph.facebook.com/v14.0/${pixelId}/events`;
    const eventTime = Math.floor(new Date(createdAt).getTime() / 1000);
    const eventId   = randomUUID();
  
    // Conversions API requires a user_data block for matching quality.
    // Fill in whatever you have: email (hashed), phone (hashed), ip, ua, etc.
    const user_data: Record<string, any> = {};
    if (userIp)    user_data.client_ip_address = userIp;
    if (userAgent) user_data.client_user_agent   = userAgent;
  
    const payload = {
      data: [
        {
          event_name:      type,
          event_time:      eventTime,
          event_id:        eventId,
          action_source:   'website',
          event_source_url:'',             // optionally track page URL
          user_data,
          custom_data: {
            value:           order_amount,
            currency:        'USD',         // swap your currency code
            content_name:    name,
          }
        }
      ],
      partner_agent: 'your-server',       // optional identifier
    };
  
    try {
      const res = await axios.post(
        endpoint,
        payload,
        {
          params: { access_token: decrypt(business?.whatsapp_token) },
          headers: { 'Content-Type': 'application/json' }
        }
      );
      if (res.data.error) {
        console.error('Meta Pixel API error:', res.data.error);
      }
    } catch (err: any) {
      console.error('Failed to send Meta Pixel event:', err.response?.data || err.message);
    }
  }
}
