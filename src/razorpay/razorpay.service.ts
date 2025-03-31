import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { config } from 'process';
@Injectable()
export class RazorpayService {
  private createClient(apiKey: string, apiSecret: string) {
    const token = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    return axios.create({
      baseURL: 'https://api.razorpay.com/v1/',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
      },
    });
  }

  public async generatePaymentLink(
    config: { razorpayApiKey: string; razorpayApiSecret: string },
    customer: { name?: string; contact: string; email?: string },
    amount: number,

    description: 'cod to checkout link',

    acceptPartial: boolean = false,

    expireBy?: number,
  ): Promise<any> {
    const amountInPaise = Math.round(amount * 100);
    const data = {
      amount: amountInPaise,
      currency: 'INR',
      accept_partial: acceptPartial,

      expire_by: expireBy,

      description,
      customer,
    };
    console.log(data);
    const client = this.createClient(
      config.razorpayApiKey,
      config.razorpayApiSecret,
    );
    try {
      const response = await client.post('/payment_links', data);
      return response.data;
    } catch (error) {
      throw new Error(
        `Error generating payment link: ${error.response?.data?.error?.description || error.message}`,
      );
    }
  }
}
