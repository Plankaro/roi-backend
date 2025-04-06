import { Controller, Get, Post, Body, Patch, Param, Delete, Query,Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  create(@Body() createAnalyticsDto: CreateAnalyticsDto) {
    return this.analyticsService.create(createAnalyticsDto);
  }

  @Public()
  @Get('/ecommerce')
  getEcommerceAnalytics(@Query() query: { startDate?: string; endDate?: string }, @Req() req: Request) {
      return this.analyticsService.getEcommerceAnalytics(req,query);
  }

  @Get('/engagement')
  getEngagementAnalytics(@Query() query: { startDate?: string; endDate?: string }, @Req() req: Request) {
    return this.analyticsService.getEngagementAnalytics(req,query);
  
  }

  @Get('/chat')
  getChatAnalytics(@Query() query: { startDate?: string; endDate?: string }, @Req() req: Request) {
    return this.analyticsService.getChatAnalytics(req,query);
  }

  
}
