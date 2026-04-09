import { Injectable } from '@nestjs/common';

import {
    AdminApplicationListResponseDto,
} from '../../dto/response/application-list-response.dto';
import {
    AdopterAdminApplicationListSnapshot,
} from '../../application/ports/adopter-admin-reader.port';
import { AdopterAdminApplicationListAssemblerService } from './adopter-admin-application-list-assembler.service';

@Injectable()
export class AdopterAdminPresentationService {
    constructor(private readonly adopterAdminApplicationListAssemblerService: AdopterAdminApplicationListAssemblerService) {}

    toApplicationList(snapshot: AdopterAdminApplicationListSnapshot): AdminApplicationListResponseDto {
        return this.adopterAdminApplicationListAssemblerService.toResponse(snapshot);
    }
}
