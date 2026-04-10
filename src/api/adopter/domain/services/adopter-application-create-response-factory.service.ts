import { Injectable } from '@nestjs/common';

import { AdopterMapper } from '../../mapper/adopter.mapper';
import type { AdopterApplicationCreateResult } from '../../application/types/adopter-result.type';
import type { AdopterApplicationCreatedRecord } from '../../application/ports/adopter-application-command.port';

@Injectable()
export class AdopterApplicationCreateResponseFactoryService {
    create(
        savedApplication: AdopterApplicationCreatedRecord,
        breederName: string,
        petName?: string,
    ): AdopterApplicationCreateResult {
        return AdopterMapper.toApplicationCreateResponse(savedApplication, breederName, petName);
    }
}
