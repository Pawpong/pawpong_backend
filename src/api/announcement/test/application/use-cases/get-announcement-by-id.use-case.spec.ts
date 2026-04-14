import { BadRequestException } from '@nestjs/common';

import type {
    AnnouncementPublicItem,
    AnnouncementPublicListResult,
    AnnouncementPublicReaderPort,
} from '../../../application/ports/announcement-public-reader.port';
import { AnnouncementItemMapperService } from '../../../domain/services/announcement-item-mapper.service';
import { GetAnnouncementByIdUseCase } from '../../../application/use-cases/get-announcement-by-id.use-case';

class StubAnnouncementPublicReaderPort implements AnnouncementPublicReaderPort {
    item: AnnouncementPublicItem | null = {
        announcementId: '507f1f77bcf86cd799439011',
        title: '공지 1',
        content: '내용 1',
        isActive: true,
        order: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    async findActiveAnnouncements(): Promise<AnnouncementPublicListResult> {
        return {
            items: this.item ? [this.item] : [],
            totalCount: this.item ? 1 : 0,
            page: 1,
            limit: 10,
        };
    }

    async findActiveAnnouncementById(): Promise<AnnouncementPublicItem | null> {
        return this.item;
    }
}

describe('공지사항 상세 조회 유스케이스', () => {
    let readerPort: StubAnnouncementPublicReaderPort;
    let useCase: GetAnnouncementByIdUseCase;

    beforeEach(() => {
        readerPort = new StubAnnouncementPublicReaderPort();
        useCase = new GetAnnouncementByIdUseCase(
            readerPort,
            new AnnouncementItemMapperService(),
        );
    });

    it('공지사항 상세 응답 계약을 유지한다', async () => {
        const result = await useCase.execute('507f1f77bcf86cd799439011');

        expect(result).toMatchObject({
            announcementId: '507f1f77bcf86cd799439011',
            title: '공지 1',
            content: '내용 1',
            isActive: true,
            order: 1,
        });
    });

    it('존재하지 않는 공지는 기존 오류 계약을 유지한다', async () => {
        readerPort.item = null;

        await expect(useCase.execute('507f1f77bcf86cd799439011')).rejects.toThrow(
            new BadRequestException('공지사항을 찾을 수 없습니다.'),
        );
    });
});
