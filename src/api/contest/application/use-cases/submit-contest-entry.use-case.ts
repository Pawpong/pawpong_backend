import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { CONTEST_READER_PORT, type ContestReaderPort } from '../ports/contest-reader.port';
import { CONTEST_USER_INFO_PORT, type ContestUserInfoPort } from '../ports/contest-user-info.port';
import { CONTEST_WRITER_PORT, type ContestWriterPort } from '../ports/contest-writer.port';
import type { SubmitContestEntryResult } from '../types/contest-result.type';

export interface SubmitContestEntryCommand {
    userId: string;
    role: 'adopter' | 'breeder';
    photoFileName: string;
    description: string;
}

@Injectable()
export class SubmitContestEntryUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_WRITER_PORT)
        private readonly writer: ContestWriterPort,
        @Inject(CONTEST_USER_INFO_PORT)
        private readonly userInfo: ContestUserInfoPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(command: SubmitContestEntryCommand): Promise<SubmitContestEntryResult> {
        this.logger.logStart('submitContestEntry', '콘테스트 참여 시작', { userId: command.userId });

        const contest = await this.reader.findActive();
        if (!contest) {
            throw new BadRequestException('현재 진행 중인 콘테스트가 없습니다.');
        }

        const existing = await this.reader.findEntryByUserId(contest.id, command.userId);
        if (existing) {
            throw new BadRequestException('이미 이번 콘테스트에 참여하셨습니다.');
        }

        const userSnapshot = await this.userInfo.readUserInfo(command.userId, command.role);
        if (!userSnapshot) {
            throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }

        const entryId = await this.writer.createEntry({
            contestId: contest.id,
            userId: command.userId,
            userDisplayName: userSnapshot.displayName,
            userProfileImageFileName: userSnapshot.profileImageFileName,
            photoFileName: command.photoFileName,
            description: command.description,
        });

        await this.writer.incrementParticipantCount(contest.id);

        this.logger.logSuccess('submitContestEntry', '콘테스트 참여 완료', { entryId });

        return { entryId };
    }
}
