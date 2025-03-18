import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post('/createOrder')
  createOrderCampaign(@Body() createCampaignDto: CreateCampaignDto,@Req() req:any) {
    return this.campaignService.createOrderCampaign(createCampaignDto,req);
  }

  @Post('/createCheckout')
  createCheckoutCampaign(@Body() createCampaignDto: CreateCampaignDto,@Req() req:any) {
    return this.campaignService.createOrderCampaign(createCampaignDto,req);
  }



}
