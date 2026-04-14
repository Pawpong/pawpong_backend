import { BadRequestException } from '@nestjs/common';

import { GetAdopterApplicationDetailUseCase } from '../../../application/use-cases/get-adopter-application-detail.use-case';
import { AdopterApplicationDetailAssemblerService } from '../../../domain/services/adopter-application-detail-assembler.service';

describe('입양자 상담 신청 상세 조회 유스케이스', () => {
    const adopterProfilePort = {
        findById: jest.fn(),
    };
    const adopterApplicationReaderPort = {
        findByIdForAdopter: jest.fn(),
    };
    const adopterBreederReaderPort = {
        findById: jest.fn(),
    };

    const useCase = new GetAdopterApplicationDetailUseCase(
        adopterProfilePort as any,
        adopterApplicationReaderPort as any,
        adopterBreederReaderPort as any,
        new AdopterApplicationDetailAssemblerService(),
    );

    const mockApplication = {
        _id: { toString: () => 'app-1' },
        breederId: { toString: () => 'breeder-1' },
        adopterId: { toString: () => 'user-1' },
        petId: { toString: () => 'pet-1' },
        petName: '뽀삐',
        status: 'consultation_pending',
        standardResponses: [],
        customResponses: [],
        appliedAt: new Date('2026-04-01T00:00:00.000Z'),
        processedAt: undefined,
        breederNotes: undefined,
    };

    const mockBreeder = { name: '행복브리더' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('신청 상세 정보를 정상 조회한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterApplicationReaderPort.findByIdForAdopter.mockResolvedValue(mockApplication);
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);

        const result = await useCase.execute('user-1', 'app-1');

        expect(result.applicationId).toBe('app-1');
        expect(result.breederName).toBe('행복브리더');
        expect(result.status).toBe('consultation_pending');
    });

    it('입양자 정보가 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('user-1', 'app-1')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('user-1', 'app-1')).rejects.toThrow('입양자 정보를 찾을 수 없습니다.');
    });

    it('해당 신청이 없거나 권한이 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterApplicationReaderPort.findByIdForAdopter.mockResolvedValue(null);

        await expect(useCase.execute('user-1', 'app-1')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('user-1', 'app-1')).rejects.toThrow(
            '해당 입양 신청을 찾을 수 없거나 조회 권한이 없습니다.',
        );
    });

    it('브리더 정보가 없으면 브리더명을 알 수 없음으로 반환한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterApplicationReaderPort.findByIdForAdopter.mockResolvedValue(mockApplication);
        adopterBreederReaderPort.findById.mockResolvedValue(null);

        const result = await useCase.execute('user-1', 'app-1');

        expect(result.breederName).toBe('알 수 없음');
    });
});
