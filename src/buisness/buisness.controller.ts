import { Controller, Get, Post,Req, Body, Patch, Param, Delete } from '@nestjs/common';
import { BuisnessService } from './buisness.service';
import { CreateBuisnessDto } from './dto/create-buisness.dto';
import { UpdateBuisnessDto } from './dto/update-buisness.dto';

@Controller('buisness')
export class BuisnessController {
  constructor(private readonly buisnessService: BuisnessService) {}

  @Post()
  addIntegration(@Req() req, @Body() createBuisnessDto: CreateBuisnessDto) {
    
  }
  @Get('notifications/:id')
  getNotifications(@Param('id') id: string) {
    return this.buisnessService.getNotifications(id);
  }

  @Post("google_analytics")
  addGoogleAnalytics(@Req() req, @Body() googleAnalytics: any,) {
    return this.buisnessService.addGoogleAnalytics(googleAnalytics,req);
    
  }

  @Delete("google_analytics")
  removeGoogleAnalytics(@Req() req) {
    return this.buisnessService.removeGoogleAnalytics(req);
  }

  @Post("razorpay")
  addRazorPay(@Req() req, @Body() razorpayDto: any,) {
    return this.buisnessService.addRazorPay(razorpayDto,req);    
  }

  @Delete("razorpay")
  removeRazorPay(@Req() req) {
    return this.buisnessService.removeRazorPay(req);
  }

  @Post("meta_pixel")
  addmetaPixel(@Req() req, @Body() metaPixelDto: any,) {
    return this.buisnessService.addmetaPixel(metaPixelDto,req);
  }

  @Delete("meta_pixel")
  removemetaPixel(@Req() req) {
    return this.buisnessService.removemetaPixel(req);
  }

  @Post("whatsapp")
  addWhatsapp(@Req() req, @Body() whatsappDto: any,) {
    return this.buisnessService.addWhatsapp(whatsappDto,req);
  }

  @Delete("whatsapp")
  removeWhatsapp(@Req() req) {
    return this.buisnessService.removeWhatsapp(req);
  }

  @Get("integrations")
  findintegrations(@Req() req) {
    return this.buisnessService.findintegrations(req);
  }



}
