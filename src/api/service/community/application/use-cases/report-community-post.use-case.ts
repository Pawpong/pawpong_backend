import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
    OPS_PENDING_CREATED_EVENT,
    OPS_PENDING_KIND,
    type OpsPendingCreatedEvent,
} from '../../../../../common/events/ops-pending.event';

import { COMMUNITY_AUTHOR_READER_PORT, type CommunityAuthorReaderPort } from '../ports/community-author-reader.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import { COMMUNITY_REPORT_PORT, type CommunityReportPort } from '../ports/community-report.port';
import type { CommunityReportReason } from '../types/community-report.type';
import type { CommunityAuthorModel } from '../types/community-post.type';

interface ReportCommand {
    reason: CommunityReportReason;
    description?: string;
}

@Injectable()
export class ReportCommunityPostUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_AUTHOR_READER_PORT)
        private readonly authorReader: CommunityAuthorReaderPort,
        @Inject(COMMUNITY_REPORT_PORT)
        private readonly reportPort: CommunityReportPort,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(
        postId: string,
        userId: string,
        role: 'adopter' | 'breeder',
        command: ReportCommand,
    ): Promise<{ postId: string; reported: boolean }> {
        const exists = await this.reader.existsActivePost(postId);
        if (!exists) throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');

        const authorSnapshot = await this.authorReader.readAuthorSnapshot(userId, role);
        if (!authorSnapshot) throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');

        const reporterModel: CommunityAuthorModel = role === 'adopter' ? 'Adopter' : 'Breeder';
        const { alreadyReported } = await this.reportPort.report({
            postId,
            reporterId: userId,
            reporterModel,
            reporterNickname: authorSnapshot.authorNickname,
            reason: command.reason,
            description: command.description,
        });

        // 같은 글에 신고가 여러 번 들어와도 방은 한 번만 울린다 (게시글 단위로 묶어 대기 등록).
        if (!alreadyReported) {
            const opsEvent: OpsPendingCreatedEvent = {
                kind: OPS_PENDING_KIND.COMMUNITY_REPORT,
                referenceId: postId,
                summary: '커뮤니티 게시글 신고가 접수되었습니다. 어드민에서 내용을 확인해주세요.',
                details: [
                    { name: '게시글 ID', value: postId },
                    { name: '신고 사유', value: command.reason },
                ],
            };
            await this.eventEmitter.emitAsync(OPS_PENDING_CREATED_EVENT, opsEvent);
        }

        return { postId, reported: !alreadyReported };
    }
}
