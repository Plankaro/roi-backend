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


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return this.campaignService.update(+id, updateCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignService.remove(+id);
  }
}
