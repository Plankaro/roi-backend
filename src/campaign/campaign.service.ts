import { Injectable } from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CampaignService {
  constructor(private readonly databaseService: DatabaseService) {}
  async createOrderCampaign(createCampaignDto: any, req: any) {
    const user = req.user;
    console.log(user);
    const campaign = await this.databaseService.campaign.create({
      data: {
        name: createCampaignDto.name,
        type: "ORDER_CREATED",
        creator: { connect: { id: user.id  } }, // Ensure correct relation handling
        createdFor: { connect: { id: user.business.id } }, // Properly linking Business
    
        OrderCreatedCampaign: {
          create: {
            template_name: createCampaignDto.template_name,
            template_lang: createCampaignDto.template_lang,
            template_type: createCampaignDto.template_type,
            components: createCampaignDto.components,
            trigger_time: createCampaignDto.trigger_time,
            trigger_time_unit: createCampaignDto.trigger_time_unit,
            Condition_filter_match: createCampaignDto.Condition_filter_match,
            new_checkout_abondnment: createCampaignDto.new_checkout_abondnment,
          },
        },
      },
    });
    
    return campaign;
    
  }

  async createCheckoutCampaign(createCampaignDto: any, req: any) {
    const user = req.user;
    console.log(user);
    const campaign = await this.databaseService.campaign.create({
      data: {
        name: createCampaignDto.name,
        type: "CHECKOUT_CREATED",
        creator: { connect: { id: user.id  } }, // Ensure correct relation handling
        createdFor: { connect: { id: user.business.id } }, // Properly linking Business
    
        CheckoutCreatedCampaign: {
          create: {
            template_name: createCampaignDto.template_name,
            components: createCampaignDto.components,
            template_lang:createCampaignDto.template_lang,
            template_type:createCampaignDto.template_type,
            discount: createCampaignDto.discount,
            Condition_filter_match: createCampaignDto.Condition_filter_match,
            new_checkout_abondnment: createCampaignDto.new_checkout_abondnment,
            new_checkout_abondnment_trigger_time: createCampaignDto.new_checkout_abondnment_trigger_time,
            new_checkout_abondnment_trigger_time_unit: createCampaignDto.new_checkout_abondnment_trigger_time_unit,
            new_checkout_abondnment_type: createCampaignDto.new_checkout_abondnment_type,
            new_order_abondnment: createCampaignDto.new_order_abondnment,
            new_order_abondnment_trigger_time: createCampaignDto.new_order_abondnment_trigger_time,
            new_order_abondnment_trigger_time_unit: createCampaignDto.new_order_abondnment_trigger_time_unit,
            order_cancelled: createCampaignDto.order_cancelled,
            ordered_created: createCampaignDto.ordered_created,
            new_order_abondnment_type: createCampaignDto.new_order_abondnment_type
            
           
            
          },
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} campaign`;
  }

  update(id: number, updateCampaignDto: UpdateCampaignDto) {
    return `This action updates a #${id} campaign`;
  }

  remove(id: number) {
    return `This action removes a #${id} campaign`;
  }
}
