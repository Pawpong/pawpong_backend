import { Injectable } from '@nestjs/common';

import { AdminApplicationListItemDto, AdminApplicationListResponseDto } from '../../dto/response/application-list-response.dto';
import { AdopterAdminApplicationListSnapshot } from '../../application/ports/adopter-admin-reader.port';

@Injectable()
export class AdopterAdminApplicationListAssemblerService {
    toResponse(snapshot: AdopterAdminApplicationListSnapshot): AdminApplicationListResponseDto {
        return {
            applications: snapshot.items.map(
                (item): AdminApplicationListItemDto => ({
                    applicationId: item.applicationId,
                    adopterName: item.adopterName,
                    adopterEmail: item.adopterEmail,
                    adopterPhone: item.adopterPhone,
                    breederId: item.breederId,
                    breederName: item.breederName,
                    petName: item.petName,
                    status: item.status,
                    appliedAt: item.appliedAt,
                    processedAt: item.processedAt,
                }),
            ),
            totalCount: snapshot.totalCount,
            pendingCount: snapshot.pendingCount,
            completedCount: snapshot.completedCount,
            approvedCount: snapshot.approvedCount,
            rejectedCount: snapshot.rejectedCount,
            currentPage: snapshot.page,
            pageSize: snapshot.limit,
            totalPages: Math.ceil(snapshot.totalCount / snapshot.limit),
        };
    }
}
