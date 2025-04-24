import { ConflictException, Injectable } from '@nestjs/common';
import { CreateBuisnessDto } from './dto/create-buisness.dto';
import { UpdateBuisnessDto } from './dto/update-buisness.dto';
import { DatabaseService } from 'src/database/database.service';

import {
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { GoogleAnalyticsDto } from './dto/ga-dto';
import { RazorpayDto } from './dto/razorpay-modal';
import { encrypt } from 'utils/usefulfunction';
import { PixelDto } from './dto/meta-pixel';
import { WhatsappFormDto } from './dto/whatsapp-dto';
@Injectable()
export class BuisnessService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createBuisnessDto: CreateBuisnessDto) {
    try {
      const alredyExists = await this.databaseService.user.findUnique({
        where: {
          id: createBuisnessDto.createdBy,
          role: 'ADMIN',
        },
      });

      if (alredyExists) {
        throw new ConflictException(
          'a buisness is already created by this user',
        );
      }

      const buisness = await this.databaseService.business.create({
        data: {
          ...createBuisnessDto,
        },
      });

      return { message: 'success', buisness: buisness };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(businessId: string, userId: string) {
    try {
      const business = await this.databaseService.business.findFirst({
        where: {
          id: businessId, // The business ID
          employees: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          employees: true, // Include employee details if needed
        },
      });

      if (!business) {
        throw new BadRequestException(
          'buisness not found or you dont have acess to it',
        );
      }

      return business;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  update(id: number, updateBuisnessDto: UpdateBuisnessDto) {
    /**
     * Update a buisness.
     * @param id The id of the buisness.
     * @param updateBuisnessDto The updated buisness data.
     * @returns The updated buisness.
     */
    return `This action updates a #${id} buisness`;
  }

  remove(id: number) {
    return `This action removes a #${id} buisness`;
  }
  async getNotifications(user_id: string) {
    try {
      const notifications = await this.databaseService.notification.findMany({
        where: {
          user_id: user_id,
        },
      });
      return notifications;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async addGoogleAnalytics(googleAnalytics: GoogleAnalyticsDto, req: any) {
    try {
      const user = req.user;

      const buisness = await this.databaseService.business.findUnique({
        where: {
          id: user.business.id,
        },
        include: {
          employees: {
            where: {
              id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });

      if (!buisness) {
        throw new BadRequestException(
          'Only admin have acess to add google analytics',
        );
      }

      await this.databaseService.business.update({
        where: {
          id: user.business.id,
        },
        data: {
          is_google_analytics_connected: true,
          g_mesurement_id: encrypt(googleAnalytics.measurementId),
          g_api_secret: encrypt(googleAnalytics.apiSecret),
        },
      });
      return { message: 'success' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeGoogleAnalytics(req: any) {
    const user = req.user;
    const findBuisness = await this.databaseService.business.findUnique({
      where: {
        id: user.business.id,
      },
      include: {
        employees: {
          where: {
            id: user.id,
            role: 'ADMIN',
          },
        },
      },
    });

    if (!findBuisness) {
      throw new BadRequestException(
        'Only admin have acess to disconnect google analytics',
      );
    }
    await this.databaseService.business.update({
      where: {
        id: user.business.id,
      },
      data: {
        is_google_analytics_connected: false,
        g_mesurement_id: null,
        g_api_secret: null,
      },
    });
    return { message: 'success' };
  }

  async addRazorPay(razorpayDto: RazorpayDto, req: any) {
    try {
      const user = req.user;
      const buisness = await this.databaseService.business.findUnique({
        where: {
          id: user.business.id,
        },
        include: {
          employees: {
            where: {
              id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });
      if (!buisness) {
        throw new BadRequestException('Only admin have acess to add razorpay');
      }
      await this.databaseService.business.update({
        where: {
          id: buisness.id,
        },
        data: {
          is_razorpay_connected: true,
          razorpay_id: encrypt(razorpayDto.keyId),
          razorpay_secret: encrypt(razorpayDto.keySecret),
        },
      });
      return { message: 'success' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeRazorPay(req: any) {
    try {
      const user = req.user;
      const buisness = await this.databaseService.business.findUnique({
        where: {
          id: user.business.id,
        },
        include: {
          employees: {
            where: {
              id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });
      if (!buisness) {
        throw new BadRequestException(
          'Only admin have acess to remove razorpay',
        );
      }
      await this.databaseService.business.update({
        where: {
          id: buisness.id,
        },
        data: {
          is_razorpay_connected: false,
          razorpay_id: null,
          razorpay_secret: null,
        },
      });
      return { message: 'success' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addmetaPixel(metaPixelDto: PixelDto, req: any) {
    try {
      const user = req.user;
      const buisness = await this.databaseService.business.findUnique({
        where: {
          id: user.business.id,
        },
        include: {
          employees: {
            where: {
              id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });
      if (!buisness) {
        throw new BadRequestException(
          'Only admin have acess to add meta pixel',
        );
      }
      await this.databaseService.business.update({
        where: {
          id: buisness.id,
        },
        data: {
          is_meta_pixel: true,
          p_track_id: encrypt(metaPixelDto.pixelId),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removemetaPixel(req: any) {
    try {
      const user = req.user;
      const buisness = await this.databaseService.business.findUnique({
        where: {
          id: user.business.id,
        },
        include: {
          employees: {
            where: {
              id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });
      if (!buisness) {
        throw new BadRequestException(
          'Only admin have acess to remove meta pixel',
        );
      }
      await this.databaseService.business.update({
        where: {
          id: buisness.id,
        },
        data: {
          is_meta_pixel: false,
          p_track_id: null,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addWhatsapp(whatsappDto: WhatsappFormDto, req: any) {
    try {
      const user = req.user;
      const buisness = await this.databaseService.business.findUnique({
        where: {
          id: user.business.id,
        },
        include: {
          employees: {
            where: {
              id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });
      if (!buisness) {
        throw new BadRequestException(
          'Only admin have acess to add whatsapp config',
        );
      }
      await this.databaseService.business.update({
        where: {
          id: buisness.id,
        },
        data: {
          is_whatsapp_connected: true,
          whatsapp_mobile: whatsappDto.whatsapp_mobile,
          whatsapp_buisness_id:whatsappDto.whatsapp_buisness_id,
          whatsapp_token:encrypt(whatsappDto.whatsapp_token),
          whatsapp_app_id: whatsappDto.whatsapp_app_id,
        },
      });
  }catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async removeWhatsapp(req: any) {
    try {
      const user = req.user;
      const buisness = await this.databaseService.business.findUnique({
        where: {
          id: user.business.id,
        },
        include: {
          employees: {
            where: {
              id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });
      if (!buisness) {
        throw new BadRequestException(
          'Only admin have acess to remove whatsapp config',
        );
      }
      
      await this.databaseService.business.update({
        where: {
          id: buisness.id,
        },
        data: {
          is_whatsapp_connected: false,
          whatsapp_mobile: null,
          whatsapp_buisness_id: null,
          whatsapp_token: null,
          whatsapp_app_id: null,
        },
      });

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
  
  async findintegrations(req: any) {
    try {
      const user = req.user;
      const buisness = await this.databaseService.business.findUnique({
        where: {
          id: user.business.id,
        },
        select:{
          is_google_analytics_connected:true,
          is_meta_pixel:true,
          is_razorpay_connected:true,
          is_whatsapp_connected:true,
          is_shopify_connected:true,
          shopify_domain: true,
          whatsapp_mobile: true,
          whatsapp_buisness_id: true,
        }
        
      })
      if (!buisness) {
        throw new BadRequestException(
          'buisness not found or you dont have acess to it',
        );
      }

      return buisness;
  }catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
