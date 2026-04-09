import { BadRequestException } from '@nestjs/common';

import { UpdateAnnouncementUseCase } from './update-announcement.use-case';
import { AnnouncementWriterPort } from '../ports/announcement-writer.port';
import { AnnouncementPaginationAssemblerService } from '../../../domain/services/announcement-pagination-assembler.service';
import { AnnouncementResponseMapperService } from '../../../domain/services/announcement-response-mapper.service';

describe('공지사항 수정 유스케이스', () => {
    const createLogger = () => ({
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    });

    it('공지사항이 있으면 수정된 응답을 반환한다', async () => {
        const announcementWriter: AnnouncementWriterPort = {
            create: jest.fn(),
            update: jest.fn().mockResolvedValue({
                announcementId: '67f1f77e7d672ba26e4d2c91',
                title: 'updated title',
                content: 'updated content',
                isActive: false,
                order: 1,
                createdAt: new Date('2026-04-06T00:00:00.000Z'),
                updatedAt: new Date('2026-04-06T00:00:00.000Z'),
            }),
            delete: jest.fn(),
        };
        const useCase = new UpdateAnnouncementUseCase(
            announcementWriter,
            new AnnouncementResponseMapperService(new AnnouncementPaginationAssemblerService()),
            createLogger() as any,
        );

        await expect(
            useCase.execute('67f1f77e7d672ba26e4d2c91', {
                title: 'updated title',
                isActive: false,
            }),
        ).resolves.toMatchObject({
            announcementId: '67f1f77e7d672ba26e4d2c91',
            title: 'updated title',
            isActive: false,
        });
    });

    it('잘못된 ID면 예외을 던진다', async () => {
        const useCase = new UpdateAnnouncementUseCase(
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new AnnouncementResponseMapperService(new AnnouncementPaginationAssemblerService()),
            createLogger() as any,
        );

        await expect(useCase.execute('invalid-id', { title: 'updated title' })).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });
});
