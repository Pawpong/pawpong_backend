import { BadRequestException, Inject, Injectable } from '@nestjs/common';

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

        return { postId, reported: !alreadyReported };
    }
}
