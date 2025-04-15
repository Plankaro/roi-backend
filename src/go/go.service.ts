import { Injectable } from '@nestjs/common';
import { CreateGoDto } from './dto/create-go.dto';
import { UpdateGoDto } from './dto/update-go.dto';
import { DatabaseService } from 'src/database/database.service';
import { Response } from 'express';

@Injectable()
export class GoService {
  constructor(private readonly databaseService: DatabaseService) {}
  create(createGoDto: CreateGoDto) {
    return 'This action adds a new go';
  }

  findAll() {
    return `This action returns all go`;
  }

  async findOne(id: string,res:Response) {
    try {
      // Ensure the URL includes a protocol; if not, assume "https://"
    const findlink = await this.databaseService.linkTrack.findUnique({
      where: {
        id: id,
      },
 
    })

    if (!findlink) {
      return {};
    }

    let data;
    if(findlink.no_of_click == 0){
      data = {
        no_of_click: findlink.no_of_click + 1,
        first_click: new Date(),
        last_click:  new Date()
      }
    }else{
      data = {
        no_of_click: findlink.no_of_click + 1,
        last_click:  new Date()
      }
    }

    this.databaseService.linkTrack.update({
      where: {
        id: id,
      },
      data: {
        ...data
      },
    })


    const link = findlink.link;
    const url = new URL(link);
    
    // Required UTM parameters
    url.searchParams.set('utm_source', findlink.utm_source);
    url.searchParams.set('utm_medium', findlink.utm_medium);
    
    // Optional UTM parameter
    if (findlink.utm_campaign) {
      url.searchParams.set('utm_campaign', findlink.utm_campaign);
    }
    
    const finalUrl = url.toString();
    

    return res.redirect(finalUrl);
    
      
    
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
