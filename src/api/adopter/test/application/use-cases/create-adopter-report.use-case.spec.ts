import { BadRequestException } from '@nestjs/common';

import { CreateAdopterReportUseCase } from '../../../application/use-cases/create-adopter-report.use-case';
import { AdopterReportPayloadBuilderService } from '../../../domain/services/adopter-report-payload-builder.service';
import { ADOPTER_RESPONSE_PAYLOAD_MESSAGES } from '../../../constants/adopter-response-messages';

describe('브리더 신고 유스케이스', () => {
    const adopterProfilePort = { findById: jest.fn() };
    const adopterBreederReaderPort = { findById: jest.fn() };
    const adopterReportCommandPort = { addReport: jest.fn() };

    const useCase = new CreateAdopterReportUseCase(
        adopterProfilePort as any,
        adopterBreederReaderPort as any,
        adopterReportCommandPort as any,
        new AdopterReportPayloadBuilderService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('입양자가 브리더를 정상 신고한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ nickname: '입양자1' });
        adopterBreederReaderPort.findById.mockImplementation((id: string) =>
            id === 'breeder-target' ? { name: '신고대상브리더' } : null,
        );
        adopterReportCommandPort.addReport.mockResolvedValue(undefined);

        const result = await useCase.execute('user-1', {
            type: 'breeder',
            breederId: 'breeder-target',
            reason: 'no_contract',
        });

        expect(result.reportId).toBeDefined();
        expect(result.message).toBe(ADOPTER_RESPONSE_PAYLOAD_MESSAGES.reportAccepted);
        expect(adopterReportCommandPort.addReport).toHaveBeenCalledWith('breeder-target', expect.objectContaining({ reporterId: 'user-1', reporterName: '입양자1' }));
    });

    it("reason이 'other'이고 description이 없으면 BadRequestException을 던진다", async () => {
        await expect(
            useCase.execute('user-1', { type: 'breeder', breederId: 'breeder-1', reason: 'other', description: '' }),
        ).rejects.toThrow(BadRequestException);
        await expect(
            useCase.execute('user-1', { type: 'breeder', breederId: 'breeder-1', reason: 'other', description: '' }),
        ).rejects.toThrow('기타 사유를 선택한 경우 상세 내용을 입력해주세요.');
    });

    it("reason이 'other'이고 description이 공백이면 BadRequestException을 던진다", async () => {
        await expect(
            useCase.execute('user-1', { type: 'breeder', breederId: 'breeder-1', reason: 'other', description: '   ' }),
        ).rejects.toThrow('기타 사유를 선택한 경우 상세 내용을 입력해주세요.');
    });

    it('신고자 정보를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);
        adopterBreederReaderPort.findById.mockImplementation(() => null);

        await expect(
            useCase.execute('user-1', { type: 'breeder', breederId: 'breeder-1', reason: 'false_info' }),
        ).rejects.toThrow(BadRequestException);
        await expect(
            useCase.execute('user-1', { type: 'breeder', breederId: 'breeder-1', reason: 'false_info' }),
        ).rejects.toThrow('사용자 정보를 찾을 수 없습니다.');
    });

    it('신고 대상 브리더가 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ nickname: '입양자1' });
        adopterBreederReaderPort.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('user-1', { type: 'breeder', breederId: 'nonexistent-breeder', reason: 'false_info' }),
        ).rejects.toThrow(BadRequestException);
        await expect(
            useCase.execute('user-1', { type: 'breeder', breederId: 'nonexistent-breeder', reason: 'false_info' }),
        ).rejects.toThrow('신고할 브리더를 찾을 수 없습니다.');
    });

    it('브리더가 다른 브리더를 신고할 수 있다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);
        adopterBreederReaderPort.findById.mockImplementation((id: string) => {
            if (id === 'breeder-reporter') return { name: '신고자브리더' };
            if (id === 'breeder-target') return { name: '신고대상브리더' };
            return null;
        });
        adopterReportCommandPort.addReport.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-reporter', {
            type: 'breeder',
            breederId: 'breeder-target',
            reason: 'inappropriate_content',
            description: '부적절한 내용',
        });

        expect(result.reportId).toBeDefined();
        expect(adopterReportCommandPort.addReport).toHaveBeenCalledWith(
            'breeder-target',
            expect.objectContaining({ reporterName: '신고자브리더' }),
        );
    });
});
