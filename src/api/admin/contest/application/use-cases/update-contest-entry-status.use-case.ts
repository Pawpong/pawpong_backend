import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import {
    CONTEST_READER_PORT,
    type ContestReaderPort,
} from '../../../../service/contest/application/ports/contest-reader.port';
import { CONTEST_ADMIN_WRITER_PORT, type ContestAdminWriterPort } from '../ports/contest-admin-writer.port';

@Injectable()
export class UpdateContestEntryStatusUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_ADMIN_WRITER_PORT)
        private readonly adminWriter: ContestAdminWriterPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(entryId: string, status: 'hidden' | 'deleted'): Promise<void> {
        this.logger.logStart('updateContestEntryStatus', '콘테스트 항목 상태 변경', { entryId, status });

        const entry = await this.reader.findEntryById(entryId);
        if (!entry) {
            throw new BadRequestException('해당 콘테스트 항목을 찾을 수 없습니다.');
        }

        if (entry.status === 'deleted') {
            throw new BadRequestException('이미 삭제된 항목은 상태를 변경할 수 없습니다.');
        }

        if (entry.status === status) {
            throw new BadRequestException(`이미 ${status} 상태인 항목입니다.`);
        }

        await this.adminWriter.updateEntryStatus(entryId, status);

        this.logger.logSuccess('updateContestEntryStatus', '콘테스트 항목 상태 변경 완료', { entryId, status });
    }
}
