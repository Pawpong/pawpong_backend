import { BadRequestException } from '@nestjs/common';

import { CreateAnnouncementUseCase } from './create-announcement.use-case';
import { AnnouncementWriterPort } from '../ports/announcement-writer.port';
import { AnnouncementResponseMapperService } from '../../../domain/services/announcement-response-mapper.service';

describe('공지사항 생성 유스케이스', () => {
    const createLogger = () => ({
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    });

    it('생성된 공지사항을 응답 객체로 반환한다', async () => {
        const announcementWriter: AnnouncementWriterPort = {
            create: jest.fn().mockResolvedValue({
                announcementId: 'announcement-1',
                title: 'title',
                content: 'content',
                isActive: true,
                order: 0,
                createdAt: new Date('2026-04-06T00:00:00.000Z'),
                updatedAt: new Date('2026-04-06T00:00:00.000Z'),
            }),
            update: jest.fn(),
            delete: jest.fn(),
        };
        const useCase = new CreateAnnouncementUseCase(
            announcementWriter,
            new AnnouncementResponseMapperService(),
            createLogger() as any,
        );

        await expect(
            useCase.execute({
                title: 'title',
                content: 'content',
                isActive: true,
                order: 0,
            }),
        ).resolves.toMatchObject({
            announcementId: 'announcement-1',
            title: 'title',
            content: 'content',
        });
    });

    it('저장 중 에러가 나면 예외을 던진다', async () => {
        const announcementWriter: AnnouncementWriterPort = {
            create: jest.fn().mockRejectedValue(new Error('db failure')),
            update: jest.fn(),
            delete: jest.fn(),
        };
        const useCase = new CreateAnnouncementUseCase(
            announcementWriter,
            new AnnouncementResponseMapperService(),
            createLogger() as any,
        );

        await expect(
            useCase.execute({
                title: 'title',
                content: 'content',
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
