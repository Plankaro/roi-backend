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
  private readonly databaseService: DatabaseService;
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

  // async sendBroadcastMessage({
  //   broadastContactId,
  //   recipients,
  //   templateName,
  //   languageCode,
  //   components,
  //   previewSection,
  // }): Promise<{ responses: any[]; unsentContacts: string[] }> {
  //   const responses = [];
  //   const unsentContacts: string[] = [];
  //   const delayInMilliseconds = 3000;
  
  //   for (let i = 0; i < recipients.length; i++) {
  //     const recipientNo = recipients[i];
  
  //     try {
  //       const response: any = await this.sendTemplateMessage({
  //         recipientNo,
  //         templateName,
  //         languageCode,
  //         components,
  //       });
  
  //       console.log(JSON.stringify(response),null,2)
  //       const addTodb = await this.databaseService.chat.create({
  //         data: {
  //           chatId: response?.messages[0]?.id ?? '',
  //           template_used: true,
  //           template_name: templateName,
  //           senderPhoneNo: '15551365364',
  //           receiverPhoneNo: response?.contacts[0].input.replace(/^\+/, ''),
  //           sendDate: new Date(),
  //           header_type: previewSection.header.type,
  //           header_value: previewSection.header.value,
  //           body_text: previewSection.bodyText,
  //           footer_included: previewSection.footer.length > 0,
  //           footer_text: previewSection.footer,
  //           Buttons: previewSection.buttons,
  //           isForBroadcast: true,
  //           broadcastId: broadastContactId,
  //         },
  //       });
  //       console.log("ddd",addTodb);
  
  //       responses.push(addTodb);
  //     } catch (error) {
  //       if (error.response && error.response.status === 429) {
  //         console.error('Rate limit hit. Capturing unsent contacts.');
  //         unsentContacts.push(...recipients.slice(i));
  //         break;
  //       } else {
  //         console.error(
  //           `Error sending message to ${recipientNo}:`,
  //           error?.response?.data || error.message,
  //         );
  //       }
  //     }
  
  //     // Introduce a delay between message sends to manage rate limits
  //     if (i < recipients.length - 1) {
  //       await new Promise((resolve) =>
  //         setTimeout(resolve, delayInMilliseconds),
  //       );
  //     }
  //   }
  
  //   return { responses, unsentContacts };
  // }
}
