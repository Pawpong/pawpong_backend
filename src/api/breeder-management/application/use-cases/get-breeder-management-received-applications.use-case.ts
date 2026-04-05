import { Inject, Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import {
    BREEDER_MANAGEMENT_LIST_READER_PORT,
    type BreederManagementListReaderPort,
} from '../ports/breeder-management-list-reader.port';
import { BreederManagementReceivedApplicationMapperService } from '../../domain/services/breeder-management-received-application-mapper.service';

@Injectable()
export class GetBreederManagementReceivedApplicationsUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_LIST_READER_PORT)
        private readonly breederManagementListReaderPort: BreederManagementListReaderPort,
        private readonly breederManagementReceivedApplicationMapperService: BreederManagementReceivedApplicationMapperService,
    ) {}

    async execute(userId: string, page: number = 1, limit: number = 10) {
        const result = await this.breederManagementListReaderPort.findReceivedApplications(userId, page, limit);
        const items = result.applications.map((application) =>
            this.breederManagementReceivedApplicationMapperService.toItem(application),
        );

        return new PaginationBuilder<any>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(result.total)
            .build();
    }
}
