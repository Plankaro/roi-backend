import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

@Injectable()
export class GemniService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY; // Ensure this is set in your .env file

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
  }

  async generateEnumValues(userMessage: string, previousMessage: string): Promise<any> {
    // The prompt includes instructions for categorization and handling an order ID if present,
    // and now also considers the previous message context.
    const prompt = `
  Assume you are a call center manager responding to user feedback on WhatsApp for a Shopify store. Your primary task is to handle user queries effectively.
  
  Context:
  Previous message: "${previousMessage}"
  Current user message: "${userMessage}"
  
  Based on both messages, determine which category the *current* user message falls into, using the options below:
  
  1) discount_bot: The user is asking for a discount (e.g., "Can I get a discount?", "discount", etc.)  
  2) product_browsing_bot: The user is requesting to view the latest products (e.g., "Shop", "Give me a list of your products", etc.)  
  3) order_tracking_bot: The user is requesting to track an order (e.g., "I want to track my order" or "Can you track {{some_id}}?" where an order ID may be provided)  
  4) order_cancelling_bot: The user is requesting to cancel an order (e.g., "I want to cancel my order" or "Can you cancel {{some_id}}?" where an order ID may be provided)  
  5) shipping_charges_bot: The user is asking about shipping charges (e.g., "I want to know shipping charges")  
  6) repeat_order_bot: The user is requesting to repeat an order (e.g., "I want to repeat my order" or "Can you repeat {{some_id}}?" where an order ID may be provided)  
  7) welcome_bot: The user is initiating a conversation or greeting (e.g., "Hi", "Hello", "Hey", "Good morning"), or expressing a general need for help or assistance (e.g., "I need help", "I’m having an issue", "I have a problem", etc.) without specifically mentioning customer support.  
  8) contacting_support_bot: The user explicitly wants to speak with customer support or a customer service agent (e.g., "I want to talk to customer support", "Connect me to customer service", "I need to speak to a support agent", etc.)  
  
  If the user message does not fall into any of these categories, respond with "None".  
  The user may also respond with a number corresponding to one of these categories.
  
  If the user message (either previous or current) contains an order ID (for example, an email, phone number, or alphanumeric code within double braces like "{{12345}}"), extract that ID and include it in your output as "orderId". If no order ID is provided, set "orderId": "null"
  
  Your output must be exactly in the following JSON format and nothing else:
  \`\`\`json
  {
    "category": "<category>",
    "orderId": "<id if provided, otherwise null>"
  }
  \`\`\`
  `;
  
    const chatSession = this.model.startChat({
      generationConfig: {
        temperature: 0.0,
        topP: 1.0,
        topK: 40,
        maxOutputTokens: 256,
        responseMimeType: 'application/json',
      },
      history: [
        { role: 'user', parts: [{ text: prompt }] },
        {
          role: 'model',
          parts: [
            {
              text: '```json\n{\n  "category": "order_tracking_bot",\n  "orderId": "12345"\n}\n```',
            },
          ],
        },
      ],
    });
  
    try {
      const result = await chatSession.sendMessage(prompt);
      return JSON.parse(result.response.text().trim());
    } catch (error) {
      console.error('Error generating enum values:', error);
      throw new Error('Failed to generate enum values');
    }
  }
  
  async generateMessageForNoDiscountGiven(userMessage: string): Promise<any> {
    const prompt = `
  Assume you are a call center manager responding to user feedback. A user has asked for a discount with the following message:
  "${userMessage}"
  However, your database shows that this user already received a discount within the past week. 
  
  Prepare a professional and humane response in the user's language. If the user is speaking Hindi, respond in Hindi but written in English letters (e.g., "Aapko pehle hi ek hafte ke andar discount mil chuka hai, isliye abhi koi extra discount uplabdh nahi hai.").
  
  Your output must be exactly in the following JSON format and nothing else:
  \`\`\`json
  {
    "message": "<response message>"
  }
  \`\`\`
  `;

    const chatSession = this.model.startChat({
      generationConfig: {
        temperature: 0.0, // Deterministic output for structured JSON
        topP: 1.0, // Use full probability distribution
        topK: 40, // Consider the top 40 tokens
        maxOutputTokens: 256, // Sufficient for a short JSON response
        responseMimeType: 'application/json',
      },
      history: [
        { role: 'user', parts: [{ text: prompt }] },
        {
          role: 'model',
          parts: [
            {
              text: '```json\n{\n  "message": "Aapko pehle hi ek hafte ke andar discount mil chuka hai, isliye abhi koi extra discount uplabdh nahi hai. Kripya samjhein."\n}\n```',
            },
          ],
        },
      ],
    });

    try {
      const result = await chatSession.sendMessage(prompt);
      return JSON.parse(result.response.text().trim());
    } catch (error) {
      console.error('Error generating discount message:', error);
      throw new Error('Failed to generate discount message');
    }
  }
  async generateMessageForDiscountError(userMessage: string): Promise<any> {
    const prompt = `
  Assume you are a call center manager responding to user feedback. A user has asked for discount  but during discount generation an error has occurred. The user sent the following message:
  "${userMessage}"
  Prepare a professional and humane response in the user's language. If the user is speaking Hindi, respond in Hindi but written in English letters (e.g., "Filhal discount generate karne mein samasya aa rahi hai, kripya baad mein phir se prayas karein.").
    
  Your output must be exactly in the following JSON format and nothing else:
  \`\`\`json
  {
    "message": "<response message>"
  }
  \`\`\`
  `;

    const chatSession = this.model.startChat({
      generationConfig: {
        temperature: 0.0, // Deterministic output for structured JSON
        topP: 1.0, // Use full probability distribution
        topK: 40, // Consider the top 40 tokens
        maxOutputTokens: 256, // Sufficient for a short JSON response
        responseMimeType: 'application/json',
      },
      history: [
        { role: 'user', parts: [{ text: prompt }] },
        {
          role: 'model',
          parts: [
            {
              text: '```json\n{\n  "message": "Filhal discount generate karne mein samasya aa rahi hai, kripya baad mein phir se prayas karein."\n}\n```',
            },
          ],
        },
      ],
    });

    try {
      const result = await chatSession.sendMessage(prompt);
      return JSON.parse(result.response.text().trim());
    } catch (error) {
      console.error('Error generating discount error message:', error);
      throw new Error('Failed to generate discount error message');
    }
  }
  async generateMessageForDiscountCode(
    discountCode: string,
    discountPercentage: string,
  ): Promise<any> {
    const prompt = `
  Assume you are a call center manager responding to user feedback. A discount has been successfully generated with the following details:
  Discount Code: "${discountCode}"
  Discount Percentage: "${discountPercentage}%"
  
  Prepare a professional and friendly response in the user's language to inform them about their discount offer. If the user is speaking Hindi, respond in Hindi but written in English letters (for example, "Aapka discount code ${discountCode} ${discountPercentage}% discount ke liye valid hai. Kripya ise istemal karein."). 
  
  Your output must be exactly in the following JSON format and nothing else:
  \`\`\`json
  {
    "message": "<response message>"
  }
  \`\`\`
  `;

    const chatSession = this.model.startChat({
      generationConfig: {
        temperature: 0.0, // Deterministic output for structured JSON
        topP: 1.0, // Use full probability distribution
        topK: 40, // Consider the top 40 tokens
        maxOutputTokens: 256, // Sufficient for a short JSON response
        responseMimeType: 'application/json',
      },
      history: [
        { role: 'user', parts: [{ text: prompt }] },
        {
          role: 'model',
          parts: [
            {
              text:
                '```json\n{\n  "message": "Aapka discount code ' +
                discountCode +
                ' ' +
                discountPercentage +
                '% discount ke liye valid hai. Kripya ise istemal karein."\n}\n```',
            },
          ],
        },
      ],
    });

    try {
      const result = await chatSession.sendMessage(prompt);
      return JSON.parse(result.response.text().trim());
    } catch (error) {
      console.error('Error generating discount code message:', error);
      throw new Error('Failed to generate discount code message');
    }
  }
}
