import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import {
    USER_PROFILE_UPDATED_EVENT,
    type UserProfileUpdatedEvent,
} from '../../../../common/events/user-profile-updated.event';
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
        updateData: { name?: string; phone?: string; profileImage?: string },
    ): Promise<AdopterProfileUpdateResult> {
        const mappedUpdateData = this.adopterProfileUpdateMapperService.toRecord(updateData);
        const adopter = await this.adopterProfilePort.updateProfile(userId, mappedUpdateData);

        if (!adopter) {
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
