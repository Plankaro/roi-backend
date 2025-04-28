import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, BadRequestException, Redirect } from '@nestjs/common';
import { GoService } from './go.service';
import { CreateGoDto } from './dto/create-go.dto';
import { UpdateGoDto } from './dto/update-go.dto';
import { Response } from 'express';
import { Public } from 'src/auth/decorator/public.decorator';
import { DatabaseService } from 'src/database/database.service';
@Controller('go')
export class GoController {
  constructor(private readonly goService: GoService,private readonly databaseService: DatabaseService) {}

  @Post()
  create(@Body() createGoDto: CreateGoDto) {
    return this.goService.create(createGoDto);
  }

  @Get()
  findAll() {
    return this.goService.findAll();
  }

@Public()
  @Get(':id')
   findOne(@Param('id') id: string, @Res() res: Response,@Req()req:Request) {
    
     return this.goService.findOne(id,res,req);
 
   }

   @Public()
   @Post('whatsapp')
  @Redirect()  // Let Nest send the 302 for us
  async handleWhatsAppLaunch(
    @Body('shop') shop: string,     // ← this is what your script posts
  ) {
    if (!shop) {
      throw new BadRequestException('Missing shop domain');
    }
    console.log(shop);
    // look up the merchant’s phone number
    const findPerson = await this.databaseService.business.findUnique({
      where: {
        shopify_domain: shop,
      },
      select: {
        whatsapp_mobile: true,
      },
    });
    console.log(findPerson);
    if (!findPerson) {
      throw new BadRequestException('WhatsApp not configured for this shop');
    }

    return {
      url: `https://wa.me/${findPerson.whatsapp_mobile}`,
      statusCode: 302,
    };
  }
}

 

