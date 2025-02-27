import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface WhatsappConfig {
  whatsappMobileId?: string;    // required for sending messages (template/text/media)
  whatsappBusinessId?: string;  // required for template management (get/create/delete)
  whatsappApiToken: string;
}

@Injectable()
export class WhatsappService {
  // Helper method: create an Axios client using the provided API token.
  private createClient(apiToken: string): AxiosInstance {
    return axios.create({
      baseURL: 'https://graph.facebook.com/v21.0/',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
    });
  }

  async sendTemplateMessage(
    params: {
      recipientNo: string;
      templateName: string;
      languageCode: string;
      components: any;
    },
    config: WhatsappConfig
  ): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException('Missing whatsappMobileId in config');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.recipientNo,
        type: 'template',
        template: {
          name: params.templateName,
          language: { code: params.languageCode },
          components: params.components,
        },
      };
      const result = await client.post(`/${config.whatsappMobileId}/messages`, payload);
    
      return result.data;
    } catch (error: any) {
      const errorMessage = error.response?.data.error.error_data.details
      console.error(
        errorMessage || "gjgyjf"
      )
      throw new InternalServerErrorException(
       
        errorMessage || 'Failed to send WhatsApp template message due to unknown reasons.',
      );
    }
  }

  

  async getTemplates(config: WhatsappConfig): Promise<any> {
    if (!config.whatsappBusinessId) {
      throw new InternalServerErrorException('Missing whatsappBusinessId in config');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const response = await client.get(`${config.whatsappBusinessId}/message_templates`);
      return response.data;
    } catch (error: any) {
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

  async sendMessage(
    recipientNo: string,
    message: string,
    config: WhatsappConfig
  ): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException('Missing whatsappMobileId in config');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        type: 'text',
        to: recipientNo,
        text: { body: message },
      };
      const response = await client.post(`/${config.whatsappMobileId}/messages`, payload);
      console.log(response.data);
      return response.data;
    } catch (error: any) {
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
    config: WhatsappConfig,
    caption?: string,
  ): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException('Missing whatsappMobileId in config');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
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
      const response = await client.post(`/${config.whatsappMobileId}/messages`, payload);
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        'Error sending WhatsApp media message:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteTemplate(
    templateName: string,
    config: WhatsappConfig
  ): Promise<any> {
    if (!config.whatsappBusinessId) {
      throw new InternalServerErrorException('Missing whatsappBusinessId in config');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const response = await client.delete(`${config.whatsappBusinessId}/message_templates`, {
        params: { name: templateName },
      });
      return response.data;
    } catch (error: any) {
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

  async createTemplate(
    template: any,
    config: WhatsappConfig
  ): Promise<any> {
    if (!config.whatsappBusinessId) {
      throw new InternalServerErrorException('Missing whatsappBusinessId in config');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const response = await client.post(`${config.whatsappBusinessId}/message_templates`, template);
      return response.data;
    } catch (error: any) {
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

  async blockNumber(
    phoneNumber: string,
    config: WhatsappConfig
  ): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException('Missing whatsappMobileId in config');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const payload:any = {
        messaging_product: 'whatsapp',
        // phoneNumber should be in E.164 format, e.g., "+14155552671"
        block_users: [
          {
          user: phoneNumber,
          }
        ],
      };
      console.log(JSON.stringify(payload, null, 2));
      const response = await client.post(`/${config.whatsappMobileId}/block_users`, payload);
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error(
        'Error blocking number:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException('Failed to block the number.', error);
    }
  }
  async unblockNumber(
    phoneNumber: string,
    config: WhatsappConfig
  ): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException('Missing whatsappMobileId in config');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const payload = {
        block_users: [
          {
            user: phoneNumber, // must be in E.164 format (e.g., "+14155552671")
          }
        ],
      };
      const response = await client.request({
        method: 'delete',
        url: `/${config.whatsappMobileId}/block_users?messaging_product=whatsapp`,
        data: payload,
      });
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error(
        'Error unblocking number:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException('Failed to unblock the number.', error);
    }
  }

  async markstatusasread(id: string, config: WhatsappConfig): Promise<any> {
    if (!config.whatsappApiToken || !config.whatsappMobileId) {
      throw new InternalServerErrorException('Missing required configuration (whatsappApiToken or whatsappMobileId)');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const response = await client.put(
        `/${config.whatsappMobileId}/messages/${id}`,
        null,
        { params: { status: 'read' } }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Error marking status as read:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException('Failed to mark status as read.', error);
    }
  }

  
}
