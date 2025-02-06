import { Injectable } from '@nestjs/common';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { UpdateBroadcastDto } from './dto/update-broadcast.dto';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BroadcastService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly whatsappService: WhatsappService,
  ) {}
  async create(createBroadcastDto: any) {
    const {
      body, // Array of body objects
      buttons, // Array of buttons
      header, // Header object
      language, // Language string
      parameter_format, // Format type
      recipientNo, // Recipient's phone number
      template_name,
      previewSection,
      type,

      // Template name
    } = createBroadcastDto;

    const components = [];

    if (header && header.isEditable) {
      if (header.type === 'TEXT') {
        // For text headers: include parameter_name only for NAMED templates.
        if (parameter_format === 'NAMED' && header.parameter_name) {
          components.push({
            type: 'header',
            parameters: [
              {
                type: 'text',
                parameter_name: header.parameter_name,
                text: header.value,
              },
            ],
          });
        } else {
          // For POSITIONAL templates, only include the text.
          components.push({
            type: 'header',
            parameters: [{ type: 'text', text: header.value }],
          });
        }
      } else if (header.type === 'IMAGE') {
        // For image headers, use the "image" key.
        components.push({
          type: 'header',
          parameters: [{ type: 'image', image: { link: header.value } }],
        });
      } else if (header.type === 'VIDEO') {
        // For video headers, use the "video" key.
        components.push({
          type: 'header',
          parameters: [{ type: 'video', video: { link: header.value } }],
        });
      } else if (header.type === 'DOCUMENT') {
        // For document headers, use the "document" key.
        components.push({
          type: 'header',
          parameters: [{ type: 'document', document: { link: header.value } }],
        });
      }
    }

    const bodyParameters = body.map((param) => {
      if (parameter_format === 'NAMED') {
        return {
          type: 'text',
          parameter_name: param.parameter_name, // e.g., "customer_name"
          text: param.value, // e.g., "John"
        };
      } else {
        // Default to positional
        return {
          type: 'text',
          text: param.value, // e.g., "John"
        };
      }
    });
    components.push({
      type: 'body',
      parameters: bodyParameters,
    });

    buttons.map((button, index) => {
      if (button.type === 'URL' && button.isEditable == true) {
        components.push({
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            {
              type: 'text',
              text: button.value,
            },
          ],
        });
      } else if (button.type === 'COPY_CODE') {
        components.push({
          type: 'button',
          sub_type: 'copy_code',
          index: index,
          parameters: [
            {
              type: 'otp',
              text: button.value,
            },
          ],
        });
      }
    });

    const createBroadcast = await this.databaseService.broadcast.create({
      data: {
        template: template_name,
        type: type,

        broadastContact: recipientNo,
        status: 'pending',
      },
    });
    const send =  this.sendBroadcastMessage({
      broadastContactId: createBroadcast.id,
      recipients: recipientNo,
      templateName: template_name,
      languageCode: language,
      components: components,
      previewSection: previewSection,
    })
    return "broadcast created successfully";
  }

  async sendBroadcastMessage({
    broadastContactId,
    recipients,
    templateName,
    languageCode,
    components,
    previewSection,
  }): Promise<{ responses: any[]; unsentContacts: string[] }> {
    const responses = [];
    const unsentContacts: string[] = [];
    const delayInMilliseconds = 3000;

    for (let i = 0; i < recipients.length; i++) {
      const recipientNo = recipients[i];

      try {
        const response: any = await this.whatsappService.sendTemplateMessage({
          recipientNo,
          templateName,
          languageCode,
          components,
        });

        console.log(JSON.stringify(response), null, 2);
        const addTodb = await this.databaseService.chat.create({
          data: {
            chatId: response?.messages[0]?.id ?? '',
            template_used: true,
            template_name: templateName,
            senderPhoneNo: '15551365364',
            receiverPhoneNo: response?.contacts[0].input.replace(/^\+/, ''),
            sendDate: new Date(),
            header_type: previewSection.header.type,
            header_value: previewSection.header.value,
            body_text: previewSection.bodyText,
            footer_included: previewSection.footer.length > 0,
            footer_text: previewSection.footer,
            Buttons: previewSection.buttons,
            isForBroadcast: true,
            broadcastId: broadastContactId,
          },
        });
        console.log('ddd', addTodb);

        responses.push(addTodb);
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.error('Rate limit hit. Capturing unsent contacts.');
          unsentContacts.push(...recipients.slice(i));
          break;
        } else {
          console.error(
            `Error sending message to ${recipientNo}:`,
            error?.response?.data || error.message,
          );
        }
      }

      // Introduce a delay between message sends to manage rate limits
      if (i < recipients.length - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayInMilliseconds),
        );
      }
    }

    return { responses, unsentContacts };
  }

  findAll() {
    return `This action returns all broadcast`;
  }

  findOne(id: number) {
    return `This action returns a #${id} broadcast`;
  }

  update(id: number, updateBroadcastDto: UpdateBroadcastDto) {
    return `This action updates a #${id} broadcast`;
  }

  remove(id: number) {
    return `This action removes a #${id} broadcast`;
  }
}
