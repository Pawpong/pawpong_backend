import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundError } from '../../../../common/error/domain.error';

import {
    BREEDER_MANAGEMENT_LIST_READER_PORT,
    type BreederManagementListReaderPort,
} from '../ports/breeder-management-list-reader.port';
import { BreederManagementMyPetMapperService } from '../../domain/services/breeder-management-my-pet-mapper.service';
import { BreederManagementPaginationAssemblerService } from '../../domain/services/breeder-management-pagination-assembler.service';
import type { BreederManagementMyPetsPageResult } from '../types/breeder-management-result.type';

@Injectable()
export class GetBreederManagementMyPetsUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_LIST_READER_PORT)
        private readonly breederManagementListReaderPort: BreederManagementListReaderPort,
        private readonly breederManagementMyPetMapperService: BreederManagementMyPetMapperService,
        private readonly breederManagementPaginationAssemblerService: BreederManagementPaginationAssemblerService,
    ) {}

    async execute(
        userId: string,
        status?: string,
        includeInactive: boolean = false,
        page: number = 1,
        limit: number = 20,
    ): Promise<BreederManagementMyPetsPageResult> {
        const breeder = await this.breederManagementListReaderPort.findBreederSummary(userId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
        }

        const snapshot = await this.breederManagementListReaderPort.findMyPetsSnapshot(userId, {
            status,
            includeInactive,
            page,
            limit,
        });
        const items = snapshot.pets.map((pet) =>
            this.breederManagementMyPetMapperService.toItem(pet, snapshot.applicationCountMap),
        );
        const paginationResponse = this.breederManagementPaginationAssemblerService.toPage(
            items,
            page,
            limit,
            snapshot.total,
        );

        return {
            ...paginationResponse,
            availableCount: snapshot.availableCount,
            reservedCount: snapshot.reservedCount,
            adoptedCount: snapshot.adoptedCount,
            inactiveCount: snapshot.inactiveCount,
        };
    }
}
