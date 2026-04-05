import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { MyPetsListResponseDto } from '../../dto/response/my-pets-list-response.dto';
import {
    BREEDER_MANAGEMENT_LIST_READER_PORT,
    type BreederManagementListReaderPort,
} from '../ports/breeder-management-list-reader.port';
import { BreederManagementMyPetMapperService } from '../../domain/services/breeder-management-my-pet-mapper.service';

@Injectable()
export class GetBreederManagementMyPetsUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_LIST_READER_PORT)
        private readonly breederManagementListReaderPort: BreederManagementListReaderPort,
        private readonly breederManagementMyPetMapperService: BreederManagementMyPetMapperService,
    ) {}

    async execute(
        userId: string,
        status?: string,
        includeInactive: boolean = false,
        page: number = 1,
        limit: number = 20,
    ): Promise<MyPetsListResponseDto> {
        const breeder = await this.breederManagementListReaderPort.findBreederSummary(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
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
        const paginationResponse = new PaginationBuilder<any>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(snapshot.total)
            .build();

        return {
            ...paginationResponse,
            availableCount: snapshot.availableCount,
            reservedCount: snapshot.reservedCount,
            adoptedCount: snapshot.adoptedCount,
            inactiveCount: snapshot.inactiveCount,
        } as MyPetsListResponseDto;
    }
}
