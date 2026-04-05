import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import type { AdopterFileUrlPort } from '../../application/ports/adopter-file-url.port';
import type { AdopterApplicationRecord } from '../../application/ports/adopter-application-reader.port';
import { ApplicationListItemResponseDto } from '../../dto/response/application-list-item-response.dto';
import { ApplicationListResponseDto } from '../../dto/response/application-list-response.dto';

@Injectable()
export class AdopterApplicationListAssemblerService {
    toEmptyResponse(page: number, limit: number): ApplicationListResponseDto {
        const builder = new PaginationBuilder<ApplicationListItemResponseDto>()
            .setItems([])
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(0);

        return new ApplicationListResponseDto(builder);
    }

    toItem(
        application: AdopterApplicationRecord,
        breeder: any | null,
        adopterFileUrlPort: AdopterFileUrlPort,
    ): ApplicationListItemResponseDto {
        return {
            applicationId: application._id.toString(),
            breederId: application.breederId.toString(),
            adopterId: this.toAdopterId(application.adopterId),
            breederName: breeder?.nickname || breeder?.name || '알 수 없음',
            petId: application.petId?.toString(),
            petName: application.petName,
            status: application.status,
            appliedAt: application.appliedAt.toISOString(),
            processedAt: application.processedAt?.toISOString(),
            breederLevel: (breeder?.verification?.level || 'new') as 'elite' | 'new',
            profileImage: breeder?.profileImageFileName
                ? adopterFileUrlPort.generateOneSafe(breeder.profileImageFileName, 60)
                : null,
            animalType: (breeder?.profile?.specialization?.[0] || 'dog') as 'cat' | 'dog',
            applicationDate: this.formatDate(application.appliedAt),
            customResponses: application.customResponses || [],
        } as ApplicationListItemResponseDto & { adopterId: string | null };
    }

    toPaginatedResponse(
        items: ApplicationListItemResponseDto[],
        page: number,
        limit: number,
        totalItems: number,
    ): ApplicationListResponseDto {
        const builder = new PaginationBuilder<ApplicationListItemResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(totalItems);

        return new ApplicationListResponseDto(builder);
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}. ${month}. ${day}.`;
    }

    private toAdopterId(adopterId?: AdopterApplicationRecord['adopterId']): string | null {
        if (!adopterId) {
            return null;
        }

        if (typeof adopterId === 'object' && '_id' in adopterId && adopterId._id) {
            return adopterId._id.toString();
        }

        return adopterId.toString();
    }
}
