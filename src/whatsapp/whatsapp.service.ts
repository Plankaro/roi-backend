import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { console } from 'inspector';

import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class WhatsappService {
  private readonly client: AxiosInstance;
  private readonly whatsappMobileId = process.env.WHATSAPP_MOBILE_ID;
  private readonly whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
  private readonly whatsappBusinessId = process.env.WHATSAPP_BUISNESS_ID;

  constructor() {
    if (
      !this.whatsappMobileId ||
      !this.whatsappApiToken ||
      !this.whatsappBusinessId
    ) {
      throw new Error(
        'WhatsApp Mobile ID, API token, or Business ID is not configured.',
      );
    }

    this.client = axios.create({
      baseURL: `https://graph.facebook.com/v21.0/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.whatsappApiToken}`,
      },
    });
  }

  async sendTemplateMessage({
    recipientNo,
    templateName,
    languageCode,
    components,
  }: {
    recipientNo: string;
    templateName: string;
    languageCode: string;
    components: any;
  }): Promise<void> {
    try {
  

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientNo,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode, // Language code of your approved template
          },
          components: components,
        },
      };

      const result = await this.client.post(
        `/${this.whatsappMobileId}/messages`,
        payload,
      );
      console.log(JSON.stringify(result.data,null,2));
      return result.data;
    } catch (error) {
      console.log(error);
      console.error(
        'Error sending template message:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to send WhatsApp template message.',
        error,
      );
    }
  }

  async getTemplates(): Promise<any> {
    try {
      const response = await this.client.get(
        `${this.whatsappBusinessId}/message_templates`,
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching WhatsApp templates:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to fetch WhatsApp templates.',
        error,
      );
    }
  }

  async sendMessage(recipientNo: string, message: string) {
    try {
      console.log(recipientNo);
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        type: 'text',
        to: recipientNo,
        text: {
          body: message,
        },
      };

      const response = await this.client.post(
        `/${this.whatsappMobileId}/messages`,
        payload,
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(
        'Error sending WhatsApp message:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to send WhatsApp message.',
        error,
      );
    }
  }

  async sendMedia(
    recipientNo: string,
    mediaUrl: string,
    type: 'image' | 'video' | 'document',
    caption?: string,
  ) {
    try {
      console.log(type);

      // Construct the payload based on media type
      let mediaPayload: any = {};
      if (type === 'image') {
        mediaPayload = { image: { link: mediaUrl, caption } };
      } else if (type === 'video') {
        mediaPayload = { video: { link: mediaUrl, caption } };
      } else if (type === 'document') {
        mediaPayload = { document: { link: mediaUrl, caption } };
      }

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        type,
        to: recipientNo,
        ...mediaPayload,
      };

      const response = await this.client.post(
        `/${this.whatsappMobileId}/messages`,
        payload,
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(
        'Error sending WhatsApp message:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteTemplate(templateName: string): Promise<any> {
    try {
      const response = await this.client.delete(
        `${this.whatsappBusinessId}/message_templates`,
        {
          params: {
            name: templateName,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error deleting WhatsApp template:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to delete WhatsApp template.',
        error,
      );
    }
  }

  async createTemplate(template: any): Promise<any> {
    try {
      const response = await this.client.post(
        `${this.whatsappBusinessId}/message_templates`,
        template
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error creating WhatsApp template:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to create WhatsApp template.',
        error,
      );
    }
  }
}
