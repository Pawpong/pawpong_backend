import { Injectable } from '@nestjs/common';

import type { AdopterApplicationCreatedRecord } from '../../application/ports/adopter-application-command.port';
import type { AdopterApplicationCreateResult } from '../../application/types/adopter-result.type';

@Injectable()
export class AdopterApplicationCreateResultMapperService {
    toResult(
        savedApplication: AdopterApplicationCreatedRecord,
        breederName: string,
        petName?: string,
    ): AdopterApplicationCreateResult {
        return {
            applicationId: savedApplication._id.toString(),
            breederId: savedApplication.breederId.toString(),
            breederName,
            petId: savedApplication.petId ? savedApplication.petId.toString() : undefined,
            petName,
            status: savedApplication.status,
            appliedAt: savedApplication.appliedAt.toISOString(),
            message: '입양 상담 신청이 성공적으로 접수되었습니다. 브리더의 응답을 기다려주세요.',
        };
    }
}
