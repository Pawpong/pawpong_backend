import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import {
    USER_PROFILE_UPDATED_EVENT,
    type UserProfileUpdatedEvent,
} from '../../../../../common/events/user-profile-updated.event';
import { AdopterProfileUpdateMapperService } from '../../domain/services/adopter-profile-update-mapper.service';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterProfileUpdateResult } from '../types/adopter-result.type';

@Injectable()
export class UpdateAdopterProfileUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        private readonly adopterProfileUpdateMapperService: AdopterProfileUpdateMapperService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(
        userId: string,
        updateData: {
            name?: string;
            phone?: string;
            profileImage?: string;
            counselDefaultProfile?: {
                selfIntroduction?: string;
                dailyAbsenceHours?: string;
                livingSpaceDescription?: string;
            };
        },
        userRole?: string,
    ): Promise<AdopterProfileUpdateResult> {
        const mappedUpdateData = this.adopterProfileUpdateMapperService.toRecord(updateData);
        // 조회(GetAdopterProfileUseCase)와 마찬가지로 브리더도 이 경로를 탄다.
        // role 을 넘기지 않으면 브리더 id 를 adopters 에서 갱신하려다 404 로 떨어진다.
        const profile = await this.adopterProfilePort.updateProfile(userId, mappedUpdateData, userRole);

        if (!profile) {
            throw new DomainNotFoundError('입양자 정보를 찾을 수 없습니다.');
        }

        // 닉네임/프로필 이미지는 커뮤니티 등에 snapshot 으로 복제돼 있어, 변경 시 동기화 이벤트를 발행한다.
        if (mappedUpdateData.nickname !== undefined || mappedUpdateData.profileImageFileName !== undefined) {
            const payload: UserProfileUpdatedEvent = {
                userId,
                nickname: mappedUpdateData.nickname,
                profileImageFileName: mappedUpdateData.profileImageFileName,
            };
            this.eventEmitter.emit(USER_PROFILE_UPDATED_EVENT, payload);
        }

        return { message: '프로필이 성공적으로 수정되었습니다.' };
    }
}
