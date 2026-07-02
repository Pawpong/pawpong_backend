import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import {
    USER_PROFILE_UPDATED_EVENT,
    type UserProfileUpdatedEvent,
} from '../../../../common/events/user-profile-updated.event';
import {
    COMMUNITY_AUTHOR_SNAPSHOT_PORT,
    type CommunityAuthorSnapshotPort,
} from '../ports/community-author-snapshot.port';

/**
 * 프로필(닉네임/이미지) 변경 시, 커뮤니티에 복제된 작성자 snapshot 을 동기화한다.
 * 느슨한 결합을 위해 프로필 도메인을 직접 의존하지 않고 도메인 이벤트로만 반응한다.
 */
@Injectable()
export class CommunityAuthorSyncListener {
    constructor(
        @Inject(COMMUNITY_AUTHOR_SNAPSHOT_PORT)
        private readonly authorSnapshotPort: CommunityAuthorSnapshotPort,
        private readonly logger: CustomLoggerService,
    ) {}

    @OnEvent(USER_PROFILE_UPDATED_EVENT)
    async handleUserProfileUpdated(event: UserProfileUpdatedEvent): Promise<void> {
        if (event.nickname === undefined && event.profileImageFileName === undefined) {
            return;
        }
        try {
            const result = await this.authorSnapshotPort.syncAuthorSnapshots(event.userId, {
                nickname: event.nickname,
                profileImageFileName: event.profileImageFileName,
            });
            this.logger.logSuccess(
                'CommunityAuthorSyncListener',
                '커뮤니티 작성자 snapshot 동기화 완료',
                { userId: event.userId, ...result },
            );
        } catch (error) {
            // 스냅샷 동기화 실패는 본 요청(프로필 수정)을 실패시키지 않는다 — 로깅 후 흡수.
            this.logger.logError('CommunityAuthorSyncListener', '커뮤니티 작성자 snapshot 동기화 실패', error);
        }
    }
}
