import { Inject, Injectable } from '@nestjs/common';

import { BreederSearchRequestDto } from '../../dto/request/breeder-search-request.dto';
import { BREEDER_VERIFICATION_ADMIN_READER } from '../ports/breeder-verification-admin-reader.port';
import type { BreederVerificationAdminReaderPort } from '../ports/breeder-verification-admin-reader.port';
import { BreederVerificationAdminListPresentationService } from '../../domain/services/breeder-verification-admin-list-presentation.service';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';

@Injectable()
export class GetLevelChangeRequestsUseCase {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_READER)
        private readonly breederVerificationAdminReader: BreederVerificationAdminReaderPort,
        private readonly breederVerificationAdminPolicyService: BreederVerificationAdminPolicyService,
        private readonly breederVerificationAdminListPresentationService: BreederVerificationAdminListPresentationService,
    ) {}

    async execute(adminId: string, filter: BreederSearchRequestDto) {
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

        return this.breederVerificationAdminListPresentationService.toPaginatedResponse(
            result.items.map((breeder) =>
                this.breederVerificationAdminListPresentationService.toLevelChangeRequestResponse(breeder),
            ),
            pageNumber,
            itemsPerPage,
            result.total,
        );
    }
}
