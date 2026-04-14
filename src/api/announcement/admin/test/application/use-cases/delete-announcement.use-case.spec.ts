import { BadRequestException } from '@nestjs/common';

import { DeleteAnnouncementUseCase } from '../../../application/use-cases/delete-announcement.use-case';

describe('공지사항 삭제 유스케이스', () => {
    const announcementWriter = {
        delete: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new DeleteAnnouncementUseCase(announcementWriter as any, logger as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('유효한 ID의 공지사항을 정상 삭제한다', async () => {
        const validObjectId = '507f1f77bcf86cd799439011';
        announcementWriter.delete.mockResolvedValue(true);

        await expect(useCase.execute(validObjectId)).resolves.toBeUndefined();
        expect(announcementWriter.delete).toHaveBeenCalledWith(validObjectId);
    });

    it('유효하지 않은 ObjectId면 BadRequestException을 던진다', async () => {
        await expect(useCase.execute('not-an-objectid')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('not-an-objectid')).rejects.toThrow('올바르지 않은 공지사항 ID입니다.');
        expect(announcementWriter.delete).not.toHaveBeenCalled();
    });

    it('공지사항이 존재하지 않으면 BadRequestException을 던진다', async () => {
        const validObjectId = '507f1f77bcf86cd799439011';
        announcementWriter.delete.mockResolvedValue(false);

        await expect(useCase.execute(validObjectId)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute(validObjectId)).rejects.toThrow('공지사항을 찾을 수 없습니다.');
    });

    it('삭제 중 예외가 발생하면 BadRequestException으로 변환한다', async () => {
        const validObjectId = '507f1f77bcf86cd799439011';
        announcementWriter.delete.mockRejectedValue(new Error('DB 오류'));

        await expect(useCase.execute(validObjectId)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute(validObjectId)).rejects.toThrow('공지사항을 삭제할 수 없습니다.');
    });
});
