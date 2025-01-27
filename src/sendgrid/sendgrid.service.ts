import { Injectable } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';

@Injectable()
export class SendgridService {
    constructor() {
        // Set the SendGrid API key
        console.log(process.env.SENDGRID_API_KEY);
        sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
      }
    
      async sendMail(to: string, subject: string, content: string): Promise<void> {
        const message = {
          to,
          from: process.env.SENDER_EMAIL, // Your verified sender email
          subject,
          text: content,
          html: `<p>${content}</p>`,
        };
    
        try {
          await sendgrid.send(message);
          console.log(`Email sent to ${to}`);
        } catch (error) {
          console.error('Error sending email:', error);
          if (error.response) {
            console.error(error.response.body);
          }
        }
      }
}