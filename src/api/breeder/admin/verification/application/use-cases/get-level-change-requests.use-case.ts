import { Inject, Injectable } from '@nestjs/common';

import { BREEDER_VERIFICATION_ADMIN_READER_PORT } from '../ports/breeder-verification-admin-reader.port';
import type { BreederVerificationAdminReaderPort } from '../ports/breeder-verification-admin-reader.port';
import { BreederVerificationAdminLevelChangeItemMapperService } from '../../domain/services/breeder-verification-admin-level-change-item-mapper.service';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';
import { BreederPaginationAssemblerService } from '../../../../domain/services/breeder-pagination-assembler.service';
import type { BreederVerificationAdminSearchQuery } from '../types/breeder-verification-admin-command.type';

@Injectable()
export class GetLevelChangeRequestsUseCase {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_READER_PORT)
        private readonly breederVerificationAdminReader: BreederVerificationAdminReaderPort,
        private readonly breederVerificationAdminPolicyService: BreederVerificationAdminPolicyService,
        private readonly breederVerificationAdminLevelChangeItemMapperService: BreederVerificationAdminLevelChangeItemMapperService,
        private readonly breederPaginationAssemblerService: BreederPaginationAssemblerService,
    ) {}

    async execute(adminId: string, filter: BreederVerificationAdminSearchQuery) {
        this.breederVerificationAdminPolicyService.assertCanManageBreeders(
            await this.breederVerificationAdminReader.findAdminById(adminId),
            'Access denied',
        );

        const pageNumber = filter.pageNumber ?? 1;
        const itemsPerPage = filter.itemsPerPage ?? 10;
        const result = await this.breederVerificationAdminReader.getLevelChangeRequests({
            verificationStatus: filter.verificationStatus,
            cityName: filter.cityName,
            searchKeyword: filter.searchKeyword,
            pageNumber,
            itemsPerPage,
        });

        return this.breederPaginationAssemblerService.build(
            result.items.map((breeder) => this.breederVerificationAdminLevelChangeItemMapperService.toResponse(breeder)),
            pageNumber,
            itemsPerPage,
            result.total,
        );
    }
}
