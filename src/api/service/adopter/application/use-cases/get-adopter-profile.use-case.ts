import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { AdopterProfileResultMapperService } from '../../domain/services/adopter-profile-result-mapper.service';
import { ADOPTER_FILE_URL_PORT } from '../ports/adopter-file-url.port';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterFileUrlPort } from '../ports/adopter-file-url.port';
import type { AdopterProfilePort, AdopterProfileRecord } from '../ports/adopter-profile.port';
import type { AdopterBreederRecord } from '../../types/adopter-breeder.type';
import type { AdopterProfileResult } from '../types/adopter-result.type';

@Injectable()
export class GetAdopterProfileUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_FILE_URL_PORT)
        private readonly adopterFileUrlPort: AdopterFileUrlPort,
        private readonly adopterProfileResultMapperService: AdopterProfileResultMapperService,
    ) {}

    /**
     * 신청자 프로필 조회.
     *
     * RolesGuard 의 breeder → adopter fallback 때문에 브리더도 이 경로를 탄다.
     * role 을 넘기지 않으면 브리더 id 를 adopters 컬렉션에서 찾다가 404 로 떨어져
     * 입양 신청 화면이 열리지 않는다(신청 폼이 이 조회 성공에 의존한다).
     */
    async execute(userId: string, userRole?: string): Promise<AdopterProfileResult> {
        const profile = await this.adopterProfilePort.findById(userId, userRole);
        if (!profile) {
            throw new DomainNotFoundError('입양자 정보를 찾을 수 없습니다.');
        }

        const profileResponse =
            userRole === 'breeder'
                ? this.adopterProfileResultMapperService.toResultFromBreeder(profile as AdopterBreederRecord)
                : this.adopterProfileResultMapperService.toResult(profile as AdopterProfileRecord);

        if (profileResponse.profileImageFileName) {
            profileResponse.profileImageFileName = this.adopterFileUrlPort.generateOneSafe(
                profileResponse.profileImageFileName,
                60,
            );
        }

        return profileResponse;
    }
}
