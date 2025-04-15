import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

interface WhatsappConfig {
  whatsappMobileId?: string; // required for sending messages (template/text/media)
  whatsappBusinessId?: string; // required for template management (get/create/delete)
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
    config: WhatsappConfig,
  ): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException(
        'Missing whatsappMobileId in config',
      );
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
      const result = await client.post(
        `/${config.whatsappMobileId}/messages`,
        payload,
      );
      console.log(result.data);

      return result.data;
    } catch (error: any) {
      console.log(JSON.stringify(error,null,2));
      const errorMessage = error.response?.data?.error?.error_data?.details;
      console.error(errorMessage || 'gjgyjf');
      throw new InternalServerErrorException(
        errorMessage ||
          'Failed to send WhatsApp template message due to unknown reasons.',
      );
    }
  }

  async getTemplates(config: WhatsappConfig): Promise<any> {
    if (!config.whatsappBusinessId) {
      throw new InternalServerErrorException(
        'Missing whatsappBusinessId in config',
      );
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const response = await client.get(
        `${config.whatsappBusinessId}/message_templates`,
      );
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

  async findSpecificTemplate(
    config: WhatsappConfig,
    templateName: string,
  ): Promise<any> {
    console.log(templateName);

    try {
      const client = this.createClient(config.whatsappApiToken);
      // Query the API for a specific template by name
      const response = await client.get(
        `${config.whatsappBusinessId}/message_templates?name=${templateName}`,
        {},
      );

      // Validate that the response contains a template
      const data = response.data;
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new NotFoundException(`Template "${templateName}" not found.`);
      }

      // If the API returns an array, assume the first element is the desired template
      const specificTemplate = Array.isArray(data) ? data[0] : data;
      return specificTemplate;
    } catch (error: any) {
      console.error(
        `Error fetching WhatsApp template "${templateName}":`,
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        `Failed to fetch WhatsApp template "${templateName}".`,
      );
    }
  }


  // for future refernce
  // {
  //   "name": "order_test_tem",
  //   "language": "en_US",
  //   "category": "UTILITY",
  //   "status": "PENDING",
  //   "components": [
  //     {
  //       "type": "BODY",
  //       "text": "Thank you for your order, {{1}}! Your confirmation number is {{2}}. If you have any questions, please use the buttons below to contact support.",
  //       "example": {
  //         "body_text": [
  //           ["Pablo", "860198-230332"]
  //         ]
  //       }
  //     },
  //     {
  //       "type": "BUTTONS",
  //       "buttons": [
  //         {
  //           "type": "PHONE_NUMBER",
  //           "text": "Call",
  //           "phone_number": "917086441614"
  //         },
  //         {
  //           "type": "URL",
  //           "text": "Contact Support",
  //           "url": "https://www.luckyshrub.com/support"
  //         }
  //       ]
  //     }
  //   ],
  //   "createdBy": "user123",
  //   "createdForId": "business456"
  // }
  
  async sendTemplateToMeta(templateData: any, config: any) {
    const payload = {
      name: templateData.name,
      language: templateData.language,
      category: templateData.category,
      components: templateData.components,
    };
    console.log(JSON.stringify(payload,null,2));
    try {
      const client = this.createClient(
        config?.whatsappApiToken
      );
      const response = await client.post(
        `/${config?.whatsappBusinessId}/message_templates`,
        payload,
      );
      console.log('Template successfully sent to Meta:', response.data);
      return response.data;
    } catch (error: any) {
     console.log(JSON.stringify(error.response ? error.response.data : error.message,null,2))
      throw error;
    }
  }

  async sendMessage(
    recipientNo: string,
    message: string,
    config: WhatsappConfig,
  ): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException(
        'Missing whatsappMobileId in config',
      );
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
      const response = await client.post(
        `/${config.whatsappMobileId}/messages`,
        payload,
      );
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
      throw new InternalServerErrorException(
        'Missing whatsappMobileId in config',
      );
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
      const response = await client.post(
        `/${config.whatsappMobileId}/messages`,
        payload,
      );
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.error(
        'Error sending WhatsApp media message:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteTemplate(templateName: string, config: any): Promise<any> {
    if (!config?.whatsappBusinessId || !config?.whatsappApiToken) {
      throw new InternalServerErrorException('Missing required config');
    }
  
    console.log('Attempting to delete template:', templateName);
  
    try {
      const client = this.createClient(config.whatsappApiToken);
      const response = await client.delete(
        `${config.whatsappBusinessId}/message_templates`,
        {
          params: { name: templateName },
        },
      );
  
      console.log('Delete response status:', response.status);
      console.log('Delete response data:', response.data); // May be undefined if successful
  
      return {
        success: response.status === 200 || response.status === 204,
        message: 'Template deleted successfully',
      };
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
  


  async blockNumber(phoneNumber: string, config: WhatsappConfig): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException(
        'Missing whatsappMobileId in config',
      );
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const payload: any = {
        messaging_product: 'whatsapp',
        // phoneNumber should be in E.164 format, e.g., "+14155552671"
        block_users: [
          {
            user: phoneNumber,
          },
        ],
      };
      console.log(JSON.stringify(payload, null, 2));
      const response = await client.post(
        `/${config.whatsappMobileId}/block_users`,
        payload,
      );
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error(
        'Error blocking number:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to block the number.',
        error,
      );
    }
  }
  async unblockNumber(
    phoneNumber: string,
    config: WhatsappConfig,
  ): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException(
        'Missing whatsappMobileId in config',
      );
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const payload = {
        block_users: [
          {
            user: phoneNumber, // must be in E.164 format (e.g., "+14155552671")
          },
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
      throw new InternalServerErrorException(
        'Failed to unblock the number.',
        error,
      );
    }
  }

  async markstatusasread(id: string, config: WhatsappConfig): Promise<any> {
    if (!config.whatsappApiToken || !config.whatsappMobileId) {
      throw new InternalServerErrorException(
        'Missing required configuration (whatsappApiToken or whatsappMobileId)',
      );
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      const response = await client.put(
        `/${config.whatsappMobileId}/messages/${id}`,
        null,
        { params: { status: 'read' } },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Error marking status as read:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to mark status as read.',
        error,
      );
    }
  }

  async uploadMedia(
    filePath: string,
    type: 'image' | 'video' | 'document',
    config: WhatsappConfig,
    caption?: string,
    mimeTypeOverride?: string,
  ): Promise<any> {
    if (!config.whatsappMobileId) {
      throw new InternalServerErrorException('Missing whatsappMobileId in config');
    }

    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('messaging_product', 'whatsapp');

      let mimeType: string;
      if (type === 'image') {
        // Use the provided MIME type (allows any image type) or fallback
        mimeType = mimeTypeOverride || 'image/jpeg';
      } else if (type === 'video') {
        mimeType = mimeTypeOverride || 'video/mp4';
      } else if (type === 'document') {
        mimeType = mimeTypeOverride || 'application/pdf';
      } else {
        throw new InternalServerErrorException('Unsupported media type');
      }
      form.append('type', mimeType);

      if (caption && (type === 'image' || type === 'video')) {
        form.append('caption', caption);
      }

      const client = axios.create({
        baseURL: 'https://graph.facebook.com/v21.0/',
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${config.whatsappApiToken}`,
        },
      });

      const response = await client.post(
        `/${config.whatsappMobileId}/media`,
        form,
      );
      console.log('Media uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        'Error uploading media:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        error.response?.data?.error?.message || 'Failed to upload media to WhatsApp.',
        error,
      );
    }
  }
  async getMedia(mediaId: string, config: WhatsappConfig): Promise<any> {
    if (!mediaId) {
      throw new Error('Media ID is required.');
    }
    try {
      const client = this.createClient(config.whatsappApiToken);
      // Request media fields such as id, mime_type, sha256, and url.
      const response = await client.get(`/${mediaId}`, {
        params: { fields: 'id,mime_type,sha256,url' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching media:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        'Failed to fetch media from WhatsApp.',
        error,
      );
    }
  }
  async uploadMediaUsingResumabelApi(filePath:string,config:WhatsappConfig){
    
  }
}
