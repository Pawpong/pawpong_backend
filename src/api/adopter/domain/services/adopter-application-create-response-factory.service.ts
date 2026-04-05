import { Injectable } from '@nestjs/common';

import { AdopterMapper } from '../../mapper/adopter.mapper';
import { ApplicationCreateResponseDto } from '../../dto/response/application-create-response.dto';
import type { AdopterApplicationCreatedRecord } from '../../application/ports/adopter-application-command.port';

@Injectable()
export class AdopterApplicationCreateResponseFactoryService {
    create(
        savedApplication: AdopterApplicationCreatedRecord,
        breederName: string,
        petName?: string,
    ): ApplicationCreateResponseDto {
        return AdopterMapper.toApplicationCreateResponse(savedApplication, breederName, petName);
    }
}
