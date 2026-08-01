import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import {
    USER_PROFILE_UPDATED_EVENT,
    type UserProfileUpdatedEvent,
} from '../../../../../common/events/user-profile-updated.event';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BreederManagementProfileCommandResultMapperService } from '../../domain/services/breeder-management-profile-command-result-mapper.service';
import { BreederManagementProfileUpdateMapperService } from '../../domain/services/breeder-management-profile-update-mapper.service';
import type { BreederManagementProfileUpdateCommand } from '../types/breeder-management-profile-command.type';

@Injectable()
export class UpdateBreederManagementProfileUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        private readonly breederManagementProfileUpdateMapperService: BreederManagementProfileUpdateMapperService,
        private readonly breederManagementProfileCommandResultMapperService: BreederManagementProfileCommandResultMapperService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(userId: string, updateData: BreederManagementProfileUpdateCommand): Promise<{ message: string }> {
        const breeder = await this.breederManagementProfilePort.findByIdWithAllData(userId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
        }

        const mappedUpdateData = this.breederManagementProfileUpdateMapperService.toUpdateData(breeder, updateData);
        await this.breederManagementProfilePort.updateProfile(userId, mappedUpdateData);

        // 닉네임/프로필 이미지는 커뮤니티 등에 snapshot 으로 복제돼 있어, 변경 시 동기화 이벤트를 발행한다.
        // 저장된 필드와 발행 필드를 일치시키기 위해 원본 command 가 아닌 mappedUpdateData 에서 읽는다.
        // (현재 이 경로는 profileImageFileName 만 변경 가능하지만, 향후 nickname 편집이 매퍼에 추가되면 자동 발행되도록 guard 는 제네릭하게 둔다.)
        const nickname = mappedUpdateData.nickname as string | undefined;
        const profileImageFileName = mappedUpdateData.profileImageFileName as string | undefined;
        if (nickname !== undefined || profileImageFileName !== undefined) {
            const payload: UserProfileUpdatedEvent = { userId, nickname, profileImageFileName };
            this.eventEmitter.emit(USER_PROFILE_UPDATED_EVENT, payload);
        }

        return this.breederManagementProfileCommandResultMapperService.toProfileUpdatedResult();
    }
}
