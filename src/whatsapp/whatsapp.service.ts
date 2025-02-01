import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { SendTemplateMessageDto } from 'src/chats/dto/template-chat';

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

  async sendTemplateMessage(data:SendTemplateMessageDto
  ): Promise<void> {
    try {
       // Replace with your dynamic URL

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: data.recipientNo,
        type: 'template',
        template: {
          name: data.templateName,
          language: {
            code: data.languageCode, // Language code of your approved template
          },
          components: data.components
        },
      };
      
      console.log(payload);

      await this.client.post(`/${this.whatsappMobileId}/messages`, payload);
    } catch (error) {
      console.error(
        'Error sending template message:',
        error?.response?.data || error.message,
      );
      throw new Error('Failed to send WhatsApp template message.');
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
      throw new Error('Failed to fetch WhatsApp templates.');
    }
  }

  async sendMessage(recipientNo: string, message: string) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        type: 'text',
        to: recipientNo,
        text: {
          body: message,
        },
      };

      const response = await this.client.post(`/${this.whatsappMobileId}/messages`, payload);
      return response.data
    } catch (error) {
      console.error(
        'Error sending WhatsApp message:',
        error?.response?.data || error.message,
      );
      throw new Error('Failed to send WhatsApp message.');
    }
  }
  



}
