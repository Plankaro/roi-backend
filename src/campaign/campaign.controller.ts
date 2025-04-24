import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post('/')
  createOrderCampaign(@Body() createCampaignDto: CreateCampaignDto,@Req() req:any) {
    return this.campaignService.createrCampaign(createCampaignDto,req);
  }

@Get('/')
getCampaign(@Req() req:any){
  return this.campaignService.getCampaigns(req);
}

@Get('/:id')
getSingleCampaign(@Param('id') id: string,@Req() req:any){
  return this.campaignService.getSingleCampaign(id,req);
}


@Patch('/:id')
updateCampaign(@Param('id') id: string,@Body() updateCampaignDto: any,@Req() req:any){
  
  return this.campaignService.updateCampaign(updateCampaignDto,req,id);
}




  // @Post('/createCheckout')
  // createCheckoutCampaign(@Body() createCampaignDto: CreateCampaignDto,@Req() req:any) {
  //   return this.campaignService.createOrderCampaign(createCampaignDto,req);
  // }



}
