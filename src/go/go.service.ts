import { Injectable } from '@nestjs/common';
import { CreateGoDto } from './dto/create-go.dto';
import { UpdateGoDto } from './dto/update-go.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class GoService {
  constructor(private readonly databaseService: DatabaseService) {}
  create(createGoDto: CreateGoDto) {
    return 'This action adds a new go';
  }

  findAll() {
    return `This action returns all go`;
  }

  async findOne(url: string) {
    try {
      // Ensure the URL includes a protocol; if not, assume "https://"
      let formattedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        formattedUrl = `https://${url}`;
      }
      
      // Create a URL object to parse the URL
      const urlObject = new URL(formattedUrl);
      const searchParams = urlObject.searchParams;
      
      // Extract the desired UTM parameters (or null if not present)
      const utmParams = {
        utm_params: searchParams.get('utm_params'),
        utm_source: searchParams.get('utm_source'),
        utm_campaign: searchParams.get('utm_campaign'),
      };
      
      // Check if at least one UTM parameter exists
      // const hasUtmParams = Object.values(utmParams).some(value => value !== null);
      // if (hasUtmParams) {
      //    await this.databaseService.broadcast.updateMany({
      //     where: {
      //       utm_params: utmParams.utm_params,
      //       utm_source: utmParams.utm_source,
      //       utm_campaign: utmParams.utm_campaign,
      //     },
      //     data: {
      //       links_visit: { increment: 1 },
      //     },
      //   });
        
      // }
      
      return utmParams;
    } catch (error) {
      console.error('Error processing URL:', error);
      return {};
    }
  }

  update(id: number, updateGoDto: UpdateGoDto) {
    return `This action updates a #${id} go`;
  }

  remove(id: number) {
    return `This action removes a #${id} go`;
  }
}
