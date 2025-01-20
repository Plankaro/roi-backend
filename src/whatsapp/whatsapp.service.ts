import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class WhatsappService {
    private readonly client: AxiosInstance;

    constructor() {
        const whatsappMobileId = process.env.WHATSAPP_MOBILE_ID;
        const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;

        if (!whatsappMobileId || !whatsappApiToken) {
            throw new Error('WhatsApp mobile ID or API token is not configured.');
        }

        this.client = axios.create({
            baseURL: `https://graph.facebook.com/v13.0/${whatsappMobileId}`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${whatsappApiToken}`,
            },
        });
    }

    /**
     * Sends a template message via WhatsApp.
     * @param recipientId The recipient's WhatsApp number in international format (e.g., "+1234567890").
     * @param templateName The name of the WhatsApp template.
     * @param languageCode The language code for the template (e.g., "en_US").
     * @param components An array of template components (e.g., header, body, etc.).
     */
    async sendTemplateMessage(
        recipientNo: string,
        templateName: string,
        languageCode: string,
        components: Array<any>
    ): Promise<void> {
        try {
            const payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: recipientNo,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: languageCode,
                    },
                    components,
                },
            };

            await this.client.post('/messages', payload);
        } catch (error) {
            console.error('Error sending template message:', error?.response?.data || error.message);
            throw new Error('Failed to send WhatsApp template message.');
        }
    }

    async getTemplates(): Promise<any> {
        try {
            const response = await this.client.get('/message_templates');
            return response.data;
        } catch (error) {
            console.error('Error fetching WhatsApp templates:', error?.response?.data || error.message);
            throw new Error('Failed to fetch WhatsApp templates.');
        }
    }

    async getAllChats(limit = 100): Promise<any> {
        try {
            const response = await this.client.get(`/conversations`, {
                params: {
                    limit,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all chats:', error?.response?.data || error.message);
            throw new Error('Failed to fetch all chats.');
        }
    }
}
