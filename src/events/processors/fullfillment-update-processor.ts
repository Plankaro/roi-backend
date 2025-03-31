import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobData } from './checkout-create-processor';
import { sanitizePhoneNumber } from 'utils/usefulfunction';

@Injectable()
@Processor('createFullfillmentQueue')
export class FullfillmentEventProcessor extends  WorkerHost{
    constructor(private readonly databaseService: DatabaseService) {
        super();
    }
    async process(job: Job<JobData>): Promise<void> {
        
    }
}