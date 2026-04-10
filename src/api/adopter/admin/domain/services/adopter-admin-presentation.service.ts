import { Injectable } from '@nestjs/common';

import {
    AdopterAdminApplicationListSnapshot,
} from '../../application/ports/adopter-admin-reader.port';
import { AdopterAdminApplicationListAssemblerService } from './adopter-admin-application-list-assembler.service';
import type { AdopterAdminApplicationListResult } from '../../application/types/adopter-admin-result.type';

@Injectable()
export class AdopterAdminPresentationService {
    constructor(private readonly adopterAdminApplicationListAssemblerService: AdopterAdminApplicationListAssemblerService) {}

    toApplicationList(snapshot: AdopterAdminApplicationListSnapshot): AdopterAdminApplicationListResult {
        return this.adopterAdminApplicationListAssemblerService.toResponse(snapshot);
    }
}
