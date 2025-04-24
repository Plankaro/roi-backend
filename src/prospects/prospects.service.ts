import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { DatabaseService } from 'src/database/database.service';
import { InternalServerErrorException } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { getWhatsappConfig, sanitizePhoneNumber } from 'utils/usefulfunction';

@Injectable()
export class ProspectsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly whatsappService: WhatsappService,
  ) {}
  async create(createProspectDto: CreateProspectDto, req: any) {
    try {
      const { shopify_id, name, email, phone, image } = createProspectDto;
      const buisnessId = req.user.business.id;
     
   
      const prospect = await this.databaseService.prospect.upsert({
        where: {
          buisnessId_phoneNo: {
            buisnessId: buisnessId,
            phoneNo: sanitizePhoneNumber(phone),
          },
        },
        update: {}, // Ensuring a valid update operation
        create: {
          shopify_id,
          name,
          email,
          image,
          phoneNo: sanitizePhoneNumber(phone),
          lead: 'LEAD',
          buisnessId:buisnessId
        },
        include: {
          chats: {
            take: 1,

            orderBy: {
              createdAt: 'desc', // Adjust this field based on your schema
            },
            where: {
              deleted: false,
            },
          },
          assignedTo: true,
        },
        
      });

      console.log(prospect);
      return prospect;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
  async update(id: string, updateProspectDto: UpdateProspectDto, req: any) {
    const buisnessId = req.user.business.id;
    try {
      const updateProspect = await this.databaseService.prospect.update({
        where: {
          id,
          buisnessId: buisnessId,
        },
        data: {
          ...updateProspectDto,
        },
      });
      console.log(updateProspect);
      return updateProspect;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }


  async findAll(req: any, query: any) {
    console.log(req.user);
    console.log(query.broadcast);

  
    try {
      const buisnessNo = req.user.business.whatsapp_mobile;
      if (!buisnessNo) {
        throw new BadRequestException('An error occurred');
      }
  
      // Destructure query parameters
      const {
        broadcast,
        Agents,
        conversation_status,
        assignment_status,
        campaigns,
        engagement_status,
        tags,
      } = query;
  
      // Start building a dynamic Prisma filter
      const whereFilter: any = {
        buisnessNo, // Always filter by business number
      };
  
      // Build an array to collect conditions for the `chats` relation
      const chatConditions: any[] = [];
  
      // Filter by broadcast IDs if provided.
      if (broadcast) {
        const broadcastIds = Array.isArray(broadcast) ? broadcast : [broadcast];
        chatConditions.push({
          broadcastId: { in: broadcastIds },
        });
      }
  
      // Filter by conversation_status using the Chat table.
      if (conversation_status) {
        if (conversation_status === "read") {
          chatConditions.push({
            receiverPhoneNo: buisnessNo,
            Status: "read",
          });
        } else if (conversation_status === "unread") {
          chatConditions.push({
            receiverPhoneNo: buisnessNo,
            Status: { not: "read" },
          });
        }
        // Always ensure chats are not deleted
        chatConditions.push({ deleted: false });
      }
  
      // Filter by campaigns if provided.
      if (campaigns) {
        const campaignIds = Array.isArray(campaigns) ? campaigns : [campaigns];
        chatConditions.push({
          campaignId: { in: campaignIds },
        });
      }
  
      // If any chat-related conditions were set, attach them as an AND condition inside a `some`
      if (chatConditions.length > 0) {
        whereFilter.chats = {
          some: {
            AND: chatConditions,
          },
        };
      }
  
      // Filter by Agents (assuming this refers to assignedTo user ids)
      if (Agents) {
        const agentIds = Array.isArray(Agents) ? Agents : [Agents];
        whereFilter.assignedTo = {
          id: { in: agentIds },
        };
      }
  
      // Filter by assignment_status.
      if (assignment_status) {
        if (assignment_status === "assigned") {
          whereFilter.assignedToId = { not: null };
        } else if (assignment_status === "unassigned") {
          whereFilter.assignedToId = null;
        }
      }
  
      // Filter by engagement_status.
      if (engagement_status) {
        const engagements = Array.isArray(engagement_status)
          ? engagement_status
          : [engagement_status];
        whereFilter.lead = { in: engagements };
      }
  
      // Filter by tags using the many-to-many relation via ProspectTag.
      if (tags) {
        const tagIds = Array.isArray(tags) ? tags : [tags];
        whereFilter.ProspectTag = {
          some: {
            tagId: { in: tagIds },
          },
        };
      }
  
      // Execute the query with the dynamic filter.
      const response = await this.databaseService.prospect.findMany({
        where: whereFilter,
        include: {
          chats: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            where: { deleted: false },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          ProspectTag: true,
        },
      });
  
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
  
  

  async findOne(id: string) {
    try {
      const response = await this.databaseService.prospect.findUnique({
        where: {
          id,
        },
        include: {
          order: true,
        },
      });
      console.log;
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  

  async changeblockstatus(id: string, req: any) {
    const buisness = req.user.business;
    console.log(id);
    console.log(buisness);
    try {
      const findPropspect = await this.databaseService.prospect.findUnique({
        where: {
          id,
          // buisnessNo: buisness.whatsapp_mobile,
        },
      });

      if (!findPropspect) {
        throw new BadRequestException('Prospect not found');
      }
      const config = getWhatsappConfig(buisness);
      if (!findPropspect.is_blocked) {
        console.log('blocking');
        await this.whatsappService.blockNumber(findPropspect.phoneNo, config);
      } else {
        console.log('unblocking');
        await this.whatsappService.unblockNumber(findPropspect.phoneNo, config);
      }

      const updateProspect = await this.databaseService.prospect.update({
        where: {
          id,
          buisnessId: buisness.id,
        },
        data: {
          is_blocked: !findPropspect.is_blocked,
        },
      });
      return updateProspect;
    } catch (error) {
      console.error(error);
    }
  }
  async getTags(req: any) {
    try {
      const buisness = req.user.business;
      const tags = await this.databaseService.tag.findMany({
        where:{
          businessId: buisness.id,
        }
    });
      return tags;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async createTags(createTagDto: any, req: any) {
    try {
      const user = req.user;
      const createTags = await this.databaseService.tag.create({
        data: {
          tagName: createTagDto.tagName,
          businessId: user.business.id,
          userId: user.id
        }
      })
      return createTags;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async deleteTags(id: string, req: any) {
    try {
      const user = req.user;
      await this.databaseService.tag.delete({
        where: {
          id,
          businessId: user.business.id,
        }
      });
      return { message: 'Tag deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
